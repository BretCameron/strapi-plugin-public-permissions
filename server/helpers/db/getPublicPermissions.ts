import { TABLE } from "./table";
import { Transaction, UPPermission } from "./types";

export const getPublicPermissions = async (
  trx: Transaction
): Promise<UPPermission[]> => {
  return await trx(TABLE.permissions).select("*");
};
