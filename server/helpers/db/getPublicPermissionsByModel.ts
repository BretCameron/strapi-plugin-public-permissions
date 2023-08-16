import { TABLE } from "./table";
import { Transaction, UPPermission } from "./types";

export const getPublicPermissionsByModel = async (
  trx: Transaction,
  model: string
): Promise<UPPermission[]> => {
  return await trx(TABLE.permissions)
    .select("*")
    .where("action", "like", `${model}.%`);
};
