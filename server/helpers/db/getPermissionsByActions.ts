import { TABLE } from "./table";
import { Transaction, UPPermission } from "./types";

export const getPermissionsByActions = async (
  trx: Transaction,
  actions: string[]
): Promise<UPPermission[]> => {
  return await trx(TABLE.permissions).select("*").whereIn("action", actions);
};
