"use strict";

const fs = require("fs");

const TABLE = {
  roles: "up_roles",
  permissions: "up_permissions",
  links: "up_permissions_role_links",
};

async function setPublicContentTypes({ actions, verbose }) {
  if (verbose) {
    strapi.log.info(`Setting "find" and "findOne" actions to "public"...`);
  }

  const now = new Date();

  // find apis which should have public find & findOne methods by reading the "./src/api" directory
  const publicApis = fs
    .readdirSync("./src/api")
    .filter((dir) => !dir.startsWith(".") && dir !== "audit-log");

  // create the permission strings expected in the database
  let permissionsToAutomate = publicApis.reduce((acc, api) => {
    const apiId = `api::${api}.${api}`;

    const arr = [];

    if (actions["*"]) {
      for (const action of actions["*"]) {
        arr.push(`${apiId}.${action}`);
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
      apisToDelete.push(...publicApis);
    }

    for (const api of apisToDelete) {
      const apiId = `api::${api}.${api}`;

      // delete any existing permissions that start with the api id
      await trx(TABLE.permissions).where("action", "like", `${apiId}.%`).del();
    }

    const currentPermissions = (
      await trx.select("action").from(TABLE.permissions)
    ).map(({ action }) => action);

    const permissionsToInsert = permissionsToAutomate.filter(
      (action) => !currentPermissions.includes(action)
    );

    if (permissionsToInsert.length) {
      if (verbose) {
        strapi.log.info(
          `Adding ${permissionsToInsert.length} permissions to table "${TABLE.permissions}"...`
        );
      }
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
      if (verbose) {
        strapi.log.info(
          `Table "${TABLE.permissions}" contains all required permissions.`
        );
      }
    }

    // now all the correct permissions are in the database, we can fetch their ids to then link them to the "public" role (role_id: 2)
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
      if (verbose) {
        strapi.log.info(
          `Adding ${permissionLinksToInsert.length} links to table "${TABLE.links}"...`
        );
      }
      await trx
        .insert(
          permissionLinksToInsert.map((id) => ({
            permission_id: id,
            role_id: 2,
          }))
        )
        .into(TABLE.links);
    } else {
      if (verbose) {
        strapi.log.info(
          `Table "${TABLE.links}" contains all required permission links.`
        );
      }
    }

    if (verbose) {
      strapi.log.info(
        `Finished setting "find" and "findOne" actions to "public".`
      );
    }
  });
}

module.exports = ({ strapi }) => {
  const plugin = strapi.plugin("public-permissions");

  const verbose = plugin.config("verbose");
  const actions = plugin.config("actions");

  setPublicContentTypes({ actions, verbose });
};
