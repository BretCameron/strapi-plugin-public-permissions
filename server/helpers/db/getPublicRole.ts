import { TABLE } from "./table";
import { Transaction, UPRole } from "./types";

export const getPublicRole = async (trx: Transaction): Promise<UPRole> => {
  return await trx
    .select("*")
    .where({ type: "public" })
    .from(TABLE.roles)
    .first();
};
