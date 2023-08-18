import { TABLE } from "./table";
import { Transaction } from "./types";

export const insertPermissions = async (
  trx: Transaction,
  actions: string[]
): Promise<number[]> => {
  if (!actions.length) {
    return Promise.resolve([]);
  }

  const now = new Date();

  // TODO this doesn't return every id! -- we need to solve this so the correct links are created
  await trx(TABLE.permissions).insert(
    actions.map((action) => ({
      action,
      created_at: now,
      updated_at: now,
    }))
  );

  return (
    await trx(TABLE.permissions).select("id").whereIn("action", actions)
  ).map(({ id }) => id);
};
