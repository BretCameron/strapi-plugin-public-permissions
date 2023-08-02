"use strict";

const {
  createDbOperationsLists,
  isEmpty,
  replaceObjectKeyWithApiId,
  replaceWildcardWithModelNames,
} = require("./helpers");

const TABLE = {
  roles: "up_roles",
  permissions: "up_permissions",
  links: "up_permissions_role_links",
};

async function setPublicContentTypes({ actions, verbose }) {
  if (isEmpty(actions)) {
    strapi.log.warn(`No actions found in public-permission plugin config.`);
    return;
  }

  function log() {
    if (verbose) {
      strapi.log.info(...arguments);
    }
  }

  log(`Setting actions to "public"...`);

  const configuredActions = Object.entries(
    replaceObjectKeyWithApiId(replaceWildcardWithModelNames(actions))
  );

  const { toDelete, toInsert } = createDbOperationsLists(configuredActions);

  console.log({ toDelete, toInsert });

  await strapi.db.connection.transaction(async function (trx) {
    log(
      `Deleting ${toDelete.length} permissions from table "${TABLE.permissions}"...`
    );

    const [publicRole] = await Promise.all([
      trx.select("id").where({ type: "public" }).from(TABLE.roles).first(),
      ...toDelete.map((api) =>
        trx(TABLE.permissions).where("action", "like", `${api}.%`).del()
      ),
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

    const currentLinks = await trx(TABLE.links)
      .select("*")
      .whereIn(
        "permission_id",
        insertedIds.map(({ id }) => id)
      )
      .andWhere({ role_id: publicRole.id });

    const linksToInsert = insertedIds.filter(
      (id) => !currentLinks.some((link) => link.permission_id === id)
    );

    log(`Adding ${linksToInsert.length} links to table "${TABLE.links}"...`);

    if (linksToInsert.length) {
      await trx(TABLE.links).insert(
        linksToInsert.map(({ id }) => ({
          permission_id: id,
          role_id: publicRole.id,
        }))
      );
    }

    log(`Finished setting actions to "public".`);
  });
}

module.exports = ({ strapi }) => {
  const plugin = strapi.plugin("public-permissions");

  setPublicContentTypes({
    actions: plugin.config("actions"),
    verbose: plugin.config("verbose"),
  });
};
