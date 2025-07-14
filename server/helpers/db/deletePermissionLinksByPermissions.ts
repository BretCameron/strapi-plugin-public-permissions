import { TABLE } from "./table";
import { Transaction, UPPermission } from "./types";

export const deletePermissionLinksByPermissions = async (
  trx: Transaction,
  permissions: UPPermission[],
  isV5: boolean
): Promise<number> => {
  return await trx(isV5 ? TABLE.linksV5 : TABLE.linksV4)
    .whereIn(
      "permission_id",
      permissions.map(({ id }) => id)
    )
    .del();
};
