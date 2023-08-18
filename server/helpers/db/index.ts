import { deletePermissionLinksByPermissions } from "./deletePermissionLinksByPermissions";
import { deletePermissions } from "./deletePermissions";
import { getPermissionsByActions } from "./getPermissionsByActions";
import { getPermissionsLinks } from "./getPermissionsLinks";
import { getPermissionsLinksByPermissionIds } from "./getPermissionsLinksByPermissionIds";
import { getPublicPermissions } from "./getPublicPermissions";
import { getPublicPermissionsByModel } from "./getPublicPermissionsByModel";
import { getPublicRole } from "./getPublicRole";
import { insertPermissionLinks } from "./insertPermissionLinks";
import { insertPermissions } from "./insertPermissions";
import { TABLE } from "./table";

export const db = {
  deletePermissionLinksByPermissions,
  deletePermissions,
  getPermissionsByActions,
  getPermissionsLinks,
  getPermissionsLinksByPermissionIds,
  getPublicPermissions,
  getPublicPermissionsByModel,
  getPublicRole,
  insertPermissionLinks,
  insertPermissions,
  TABLE,
};
