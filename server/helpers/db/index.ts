import { getPermissionsLinks } from "./getPermissionsLinks";
import { getPublicPermissions } from "./getPublicPermissions";
import { getPublicPermissionsByModel } from "./getPublicPermissionsByModel";
import { getPublicRole } from "./getPublicRole";
import { insertPermissions } from "./insertPermissions";
import { TABLE } from "./table";

export const db = {
  getPermissionsLinks,
  getPublicPermissions,
  getPublicPermissionsByModel,
  getPublicRole,
  insertPermissions,
  TABLE,
};
