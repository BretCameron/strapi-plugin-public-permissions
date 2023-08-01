"use strict";

const TABLE = {
  roles: "up_roles",
  permissions: "up_permissions",
  links: "up_permissions_role_links",
};

async function setPublicContentTypes({ actions, verbose }) {
  function log() {
    if (verbose) {
      strapi.log.info(...arguments);
    }
  }

  log(`Setting actions to "public"...`);

  const now = new Date();

  const apiContentTypes = Object.keys(strapi.contentTypes).filter(
    (contentType) => contentType.startsWith("api")
  );

  // create the permission strings expected in the database
  let permissionsToAutomate = apiContentTypes.reduce((acc, api) => {
    const arr = [];

    if (actions["*"]) {
      for (const action of actions["*"]) {
        arr.push(`${api}.${action}`);
      }
    }

    return [...acc, ...arr];
  }, []);

  const customApis = Object.keys(actions).filter((action) => action !== "*");

  for (const api of customApis) {
    const apiId = `api::${api}.${api}`;
    permissionsToAutomate = permissionsToAutomate.filter(
      (permission) => !permission.startsWith(apiId)
    );

    for (const action of actions[api]) {
      permissionsToAutomate.push(`${apiId}.${action}`);
    }
  }

  await strapi.db.connection.transaction(async function (trx) {
    const publicRole = (
      await trx.select("id").where({ type: "public" }).from(TABLE.roles).first()
    ).id;

    const apisToDelete = customApis;

    if (actions["*"]) {
      apisToDelete.push(...apiContentTypes);
    }

    for (const api of apisToDelete) {
      // delete any existing permissions that start with the api id
      await trx(TABLE.permissions).where("action", "like", `${api}.%`).del();
    }

    const currentPermissions = (
      await trx.select("action").from(TABLE.permissions)
    ).map(({ action }) => action);

    const permissionsToInsert = permissionsToAutomate.filter(
      (action) => !currentPermissions.includes(action)
    );

    if (permissionsToInsert.length) {
      log(
        `Adding ${permissionsToInsert.length} permissions to table "${TABLE.permissions}"...`
      );

      await trx
        .insert(
          permissionsToInsert.map((action) => ({
            action,
            created_at: now,
            updated_at: now,
          }))
        )
        .into(TABLE.permissions);
    } else {
      log(`Table "${TABLE.permissions}" contains all required permissions.`);
    }

    // now all the correct permissions are in the database, we can fetch their ids to then link them to the "public" role
    const permissionsToAutomateIds = (
      await trx
        .select("id")
        .from(TABLE.permissions)
        .whereIn("action", permissionsToAutomate)
    ).map(({ id }) => id);

    const currentPermissionLinks = await trx
      .select("*")
      .from(TABLE.links)
      .whereIn("permission_id", permissionsToAutomateIds)
      .andWhere({ role_id: publicRole });

    const permissionLinksToInsert = permissionsToAutomateIds.filter(
      (id) => !currentPermissionLinks.some((link) => link.permission_id === id)
    );

    if (permissionLinksToInsert.length) {
      log(
        `Adding ${permissionLinksToInsert.length} links to table "${TABLE.links}"...`
      );

      await trx
        .insert(
          permissionLinksToInsert.map((id) => ({
            permission_id: id,
            role_id: publicRole,
          }))
        )
        .into(TABLE.links);
    } else {
      log(`Table "${TABLE.links}" contains all required permission links.`);
    }

    log(`Finished setting actions to "public".`);
  });
}

module.exports = ({ strapi }) => {
  const plugin = strapi.plugin("public-permissions");

  const verbose = plugin.config("verbose");
  const actions = plugin.config("actions");

  setPublicContentTypes({ actions, verbose });
};
