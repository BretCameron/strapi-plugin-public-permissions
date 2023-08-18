import { TABLE } from "./table";
import { Transaction, UPPermissionsLink } from "./types";

export const getPermissionsLinks = async (
  trx: Transaction
): Promise<UPPermissionsLink[]> => {
  return await trx.select("*").from(TABLE.links);
};
