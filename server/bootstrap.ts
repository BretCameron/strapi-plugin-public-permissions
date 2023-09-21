import type { Strapi } from "@strapi/strapi";
import {
  createDbOperationsLists,
  isEmpty,
  replaceObjectKeyWithApiId,
  replaceObjectKeyWithPluginId,
  replaceWildcardWithModelNames,
  db,
} from "./helpers";
import { PluginGetter } from "./types";
import { UPPermission } from "./helpers/db/types";

async function setPublicContentTypes({
  strapi,
  actions = {},
  plugins = {},
  maxParallelOperations,
  verbose = false,
}: {
  strapi: Strapi;
  actions: Record<string, string[]>;
  plugins: Record<string, string[]>;
  maxParallelOperations: number;
  verbose: boolean;
}): Promise<void> {
  function log(...args) {
    if (verbose) {
      strapi.log.info(...args);
    }
  }

  function warn(...args) {
    strapi.log.warn(...args);
  }

  if (typeof maxParallelOperations === "number") {
    warn(
      `"maxParallelOperations" configuration option is deprecated. It no longer has any effect.`
    );
  }

  if (isEmpty({ ...actions, ...plugins })) {
    warn(`No actions or plugins found in public-permissions plugin config.`);
    return;
  }

  log(`---------------------------------------`);
  log(`Setting permissions to public...`);

  const configuredActions = Object.entries(
    replaceObjectKeyWithApiId(replaceWildcardWithModelNames(strapi, actions))
  );

  const configuredPlugins = Object.entries(
    replaceObjectKeyWithPluginId(plugins)
  );

  const { toDelete, toInsert } = createDbOperationsLists([
    ...configuredActions,
    ...configuredPlugins,
  ]);

  await strapi.db.connection.transaction(async function (trx) {
    const publicRole = await db.getPublicRole(trx);

    if (!publicRole) {
      throw new Error(
        `No public role found. Make sure your database is connected correctly and that the "Users & Permissions Plugin" has at least one public role.`
      );
    }

    const publicPermissions = await db.getPublicPermissions(trx);

    const existingPermissions: UPPermission[] = [];
    const permissionsToDelete: UPPermission[] = [];
    const permissionsToInsert: string[] = [];

    for (const permission of publicPermissions) {
      if (!permission.action) {
        continue;
      }

      const action = permission.action;

      const model = action.match(/([\w-:.]+)\..+$/)?.[1] ?? "";

      const toInsertIncludesAction = toInsert.includes(action);
      const toDeleteIncludesModel = toDelete.includes(model);

      if (toInsertIncludesAction) {
        existingPermissions.push(permission);
      }

      if (!toInsertIncludesAction && toDeleteIncludesModel) {
        permissionsToDelete.push(permission);
      }
    }

    for (const action of toInsert) {
      if (!existingPermissions.find((p) => p.action === action)) {
        permissionsToInsert.push(action);
      }
    }

    await db.deletePermissions(trx, permissionsToDelete);

    log(`Deleted  ${permissionsToDelete.length} old permissions.`);

    const insertedPermissionIds = await db.insertPermissions(
      trx,
      permissionsToInsert
    );

    log(`Inserted ${insertedPermissionIds.length} new permissions.`);

    const permissionIdsThatNeedLinks = [
      ...insertedPermissionIds,
      ...existingPermissions.map(({ id }) => id),
    ];

    const existingLinks = await db.getPermissionsLinksByPermissionIds(
      trx,
      permissionIdsThatNeedLinks
    );

    const linksToInsert = permissionIdsThatNeedLinks.filter(
      (id) => !existingLinks.find((l) => l.permission_id === id)
    );

    await db.insertPermissionLinks(trx, linksToInsert, publicRole.id);

    log(`Finished setting permissions to public!`);
    log(`---------------------------------------`);
  });
}

export default ({ strapi }: { strapi: Strapi }) => {
  const plugin: PluginGetter = strapi.plugin("public-permissions");

  setPublicContentTypes({
    strapi,
    actions: plugin.config("actions"),
    plugins: plugin.config("plugins"),
    maxParallelOperations: plugin.config("maxParallelOperations"),
    verbose: plugin.config("verbose"),
  });
};
