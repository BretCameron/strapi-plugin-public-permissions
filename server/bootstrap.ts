import type { Strapi } from "@strapi/strapi";
import {
  createDbOperationsLists,
  isEmpty,
  replaceObjectKeyWithApiId,
  replaceWildcardWithModelNames,
} from "./helpers";
import { db } from "./helpers/db";

const TABLE = {
  roles: "up_roles",
  permissions: "up_permissions",
  links: "up_permissions_role_links",
};

async function setPublicContentTypes({
  strapi,
  actions = {},
  maxParallelOperations = 8,
  verbose = false,
}: {
  strapi: Strapi;
  actions: Record<string, any>;
  maxParallelOperations: number;
  verbose: boolean;
}) {
  if (isEmpty(actions)) {
    strapi.log.warn(`No actions found in public-permissions plugin config.`);
    return;
  }

  function log(...args) {
    if (verbose) {
      strapi.log.info(...args);
    }
  }

  log(`Setting actions to "public"...`);

  const configuredActions = Object.entries(
    replaceObjectKeyWithApiId(replaceWildcardWithModelNames(strapi, actions))
  );

  const { toDelete, toInsert } = createDbOperationsLists(configuredActions);

  await strapi.db.connection.transaction(async function (trx) {
    console.log(await db.getPublicRole(trx));
    console.log(await db.getPublicPermissions(trx));
    console.log(await db.getPermissionsLinks(trx));

    const publicRole = await db.getPublicRole(trx);

    const chunkSize = maxParallelOperations;
    const chunks: string[][] = [];

    for (let i = 0; i < toDelete.length; i += chunkSize) {
      chunks.push(toDelete.slice(i, i + chunkSize));
    }

    let idsToDelete: string[] = [];

    for (const chunk of chunks) {
      const ids: { id: string }[][] = await Promise.all(
        chunk.map((api: string) =>
          trx(TABLE.permissions)
            .select("id")
            .where("action", "like", `${api}.%`)
        )
      );
      const flattenedIds = ids.flat();
      const arrayOfIds = flattenedIds.map(({ id }) => id);
      idsToDelete.push(...arrayOfIds);
    }

    log(
      `Deleting ${idsToDelete.length} permissions from table "${TABLE.permissions}"...`
    );

    await Promise.all([
      trx(TABLE.permissions).whereIn("id", idsToDelete).del(),
      await trx(TABLE.links).whereIn("permission_id", idsToDelete).del(),
    ]);

    log(
      `Adding ${toInsert.length} permissions to table "${TABLE.permissions}"...`
    );

    if (toInsert.length) {
      const now = new Date();
      await trx(TABLE.permissions).insert(
        toInsert.map((action) => ({
          action,
          created_at: now,
          updated_at: now,
        }))
      );
    }

    const insertedIds = await trx(TABLE.permissions)
      .select("id")
      .whereIn("action", toInsert);

    log(`Adding ${insertedIds.length} links to table "${TABLE.links}"...`);

    if (insertedIds.length) {
      await trx(TABLE.links).insert(
        insertedIds.map(({ id }) => ({
          permission_id: id,
          role_id: publicRole.id,
        }))
      );
    }

    log(`Finished setting actions to "public".`);
  });
}

export default ({ strapi }: { strapi: Strapi }) => {
  const plugin = strapi.plugin("public-permissions");

  setPublicContentTypes({
    strapi,
    actions: plugin.config("actions"),
    maxParallelOperations: plugin.config("maxParallelOperations"),
    verbose: plugin.config("verbose"),
  });
};
