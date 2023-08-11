import { TABLE } from "./table";
import { Transaction, UPPermission } from "./types";

export const getPermissionsLinks = async (
  trx: Transaction
): Promise<UPPermission[]> => {
  return await trx.select("*").from(TABLE.links);
};
