import { TABLE } from "./table";
import { Transaction } from "./types";

export const insertPermissionLinks = async (
  trx: Transaction,
  permissionIds: number[],
  publicRoleId: number,
  isV5: boolean
): Promise<number[]> => {
  if (!permissionIds.length) {
    return Promise.resolve([]);
  }

  await trx(isV5 ? TABLE.linksV5 : TABLE.linksV4).insert(
    permissionIds.map((id) => ({
      permission_id: id,
      role_id: publicRoleId,
    }))
  );

  return (
    await trx(isV5 ? TABLE.linksV5 : TABLE.linksV4)
      .select("id")
      .whereIn("permission_id", permissionIds)
  ).map(({ id }) => id);
};
