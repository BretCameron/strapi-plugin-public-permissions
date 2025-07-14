import { TABLE } from "./table";
import { Transaction } from "./types";

export const isV5 = async (trx: Transaction): Promise<boolean> => {
  return await trx.schema.hasTable(TABLE.linksV5);
};
