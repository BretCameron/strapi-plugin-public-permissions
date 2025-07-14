import { TABLE } from "./table";
import { Transaction, UPPermissionsLink } from "./types";

export const getPermissionsLinks = async (
  trx: Transaction,
  isV5: boolean
): Promise<UPPermissionsLink[]> => {
  return await trx.select("*").from(isV5 ? TABLE.linksV5 : TABLE.linksV4);
};
