import { TABLE } from "./table";
import { Transaction } from "./types";

export const insertPermissionLinks = async (
  trx: Transaction,
  permissionIds: number[],
  publicRoleId: number
): Promise<number[]> => {
  if (!permissionIds.length) {
    return Promise.resolve([]);
  }

  return await trx(TABLE.links).insert(
    permissionIds.map((id) => ({
      permission_id: id,
      role_id: publicRoleId,
    }))
  );
};
