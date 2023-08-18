import { TABLE } from "./table";
import { Transaction, UPPermission, UPPermissionsLink } from "./types";

export const getPermissionsLinksByPermissionIds = async (
  trx: Transaction,
  permissionIds: number[]
): Promise<UPPermissionsLink[]> => {
  return await trx
    .select("*")
    .from(TABLE.links)
    .whereIn("permission_id", permissionIds);
};
