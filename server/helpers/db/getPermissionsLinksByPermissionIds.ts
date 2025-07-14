import { TABLE } from "./table";
import { Transaction, UPPermissionsLink } from "./types";

export const getPermissionsLinksByPermissionIds = async (
  trx: Transaction,
  permissionIds: number[],
  isV5: boolean
): Promise<UPPermissionsLink[]> => {
  return await trx
    .select("*")
    .from(isV5 ? TABLE.linksV5 : TABLE.linksV4)
    .whereIn("permission_id", permissionIds);
};
