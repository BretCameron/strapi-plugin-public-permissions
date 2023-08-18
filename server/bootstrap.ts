import type { Strapi } from "@strapi/strapi";
import {
  createDbOperationsLists,
  isEmpty,
  replaceObjectKeyWithApiId,
  replaceObjectKeyWithPluginId,
  replaceWildcardWithModelNames,
} from "./helpers";
import { db } from "./helpers/db";
import { PluginGetter } from "./types";
import { UPPermission } from "./helpers/db/types";

async function setPublicContentTypes({
  strapi,
  actions = {},
  plugins = {},
  maxParallelOperations = 8,
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

  if (isEmpty({ ...actions, ...plugins })) {
    warn(`No actions found in public-permissions plugin config.`);
    return;
  }

  log(`Setting actions to "public"...`);

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
    const [publicRole, publicPermissions] = await Promise.all([
      db.getPublicRole(trx),
      db.getPublicPermissions(trx),
    ]);

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

    console.log({ publicPermissions, permissionsToDelete });

    for (const action of toInsert) {
      if (!existingPermissions.find((p) => p.action === action)) {
        permissionsToInsert.push(action);
      }
    }

    const permissionDeleteCount = await db.deletePermissions(
      trx,
      permissionsToDelete
    );
    const insertedPermissionIds = await db.insertPermissions(
      trx,
      permissionsToInsert
    );

    console.log({
      insertedPermissionIds,
      existingPermissions,
    });

    const permissionIdsThatNeedLinks = [
      ...insertedPermissionIds,
      ...existingPermissions.map(({ id }) => id),
    ];

    const [existingLinks] = await Promise.all([
      db.getPermissionsLinksByPermissionIds(trx, permissionIdsThatNeedLinks),
    ]);

    const linksToInsert = permissionIdsThatNeedLinks.filter(
      (id) => !existingLinks.find((l) => l.permission_id === id)
    );

    console.log({ existingLinks, linksToInsert });

    const insertedLinkIds = await db.insertPermissionLinks(
      trx,
      linksToInsert,
      publicRole.id
    );

    console.log({
      insertedPermissionIds,
      permissionDeleteCount,
      permissionIdsThatNeedLinks,
      existingLinks,
      insertedLinkIds,
      all: await db.getPublicPermissions(trx),
      allLinks: await db.getPermissionsLinks(trx),
    });
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
