import { TABLE } from "./table";
import { Transaction } from "./types";

export const createPublicRole = async (trx: Transaction) => {
  return await trx
    .insert([
      {
        name: "Authenticated",
        description: "Default role given to authenticated user.",
        type: "authenticated",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: "Public",
        description: "Default role given to unauthenticated user.",
        type: "public",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ])
    .into(TABLE.roles);
};
