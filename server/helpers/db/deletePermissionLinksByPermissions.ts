import { TABLE } from "./table";
import { Transaction, UPPermission } from "./types";

export const deletePermissionLinksByPermissions = async (
  trx: Transaction,
  permissions: UPPermission[]
): Promise<number> => {
  return await trx(TABLE.links)
    .whereIn(
      "permission_id",
      permissions.map(({ id }) => id)
    )
    .del();
};
