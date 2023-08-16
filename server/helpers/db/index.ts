import { getPermissionsLinks } from "./getPermissionsLinks";
import { getPublicPermissions } from "./getPublicPermissions";
import { getPublicRole } from "./getPublicRole";
import { insertPermissions } from "./insertPermissions";
import { TABLE } from "./table";

export const db = {
  getPermissionsLinks,
  getPublicPermissions,
  getPublicRole,
  insertPermissions,
  TABLE,
};
