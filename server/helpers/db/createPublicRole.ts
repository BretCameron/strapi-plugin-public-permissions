import { TABLE } from "./table";
import { Transaction } from "./types";

export const createPublicRole = async (trx: Transaction) => {
  return await trx
    .insert({
      name: "Public",
      description: "Default role given to unauthenticated user.",
      type: "public",
    })
    .into(TABLE.roles);
};
