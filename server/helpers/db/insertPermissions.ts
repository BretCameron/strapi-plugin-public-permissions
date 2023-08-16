import { TABLE } from "./table";
import { Transaction, UPPermission } from "./types";

export const insertPermissions = async (
  trx: Transaction,
  permissions: string[]
): Promise<UPPermission[]> => {
  return await trx(TABLE.permissions)
    .select("id")
    .whereIn("action", permissions);
};
