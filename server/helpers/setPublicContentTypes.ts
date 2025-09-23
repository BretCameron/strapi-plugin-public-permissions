import type { Core } from "@strapi/strapi";
import {
  createDbOperationsLists,
  isEmpty,
  replaceObjectKeyWithApiId,
  replaceObjectKeyWithPluginId,
  replaceWildcardWithModelNames,
  db,
} from ".";
import { Transaction, UPPermission } from "./db/types";

export async function setPublicContentTypes({
  strapi,
  actions = {},
  plugins = {},
  maxParallelOperations,
  verbose = false,
}: {
  strapi: Core.Strapi;
  actions: Record<string, string[]>;
  plugins: Record<string, string[]>;
  maxParallelOperations: number;
  verbose: boolean;
}): Promise<void> {
  function log(message: string) {
    if (verbose) {
      strapi.log.info(message);
    }
  }

  function warn(message: string) {
    strapi.log.warn(message);
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

  await strapi.db.connection.transaction(async function (trx: Transaction) {
    let publicRole = await db.getPublicRole(trx);

    if (!publicRole) {
      warn(`No public role found. Creating one.`);

      await db.createPublicRole(trx);
      publicRole = await db.getPublicRole(trx);
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

    const isV5 = await db.isV5(trx);

    const existingLinks = await db.getPermissionsLinksByPermissionIds(
      trx,
      permissionIdsThatNeedLinks,
      isV5
    );

    const linksToInsert = permissionIdsThatNeedLinks.filter(
      (id) => !existingLinks.find((l) => l.permission_id === id)
    );

    await db.insertPermissionLinks(trx, linksToInsert, publicRole.id, isV5);

    log(`Finished setting permissions to public!`);
    log(`---------------------------------------`);
  });
}
