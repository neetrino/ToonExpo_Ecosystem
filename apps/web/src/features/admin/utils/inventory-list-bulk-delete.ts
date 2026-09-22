/**
 * Runs async deletes sequentially; first failure aborts the rest.
 */
export const deleteSelectedSequentially = async (
  ids: readonly string[],
  deleteOne: (id: string) => Promise<void>,
): Promise<void> => {
  for (const id of ids) {
    await deleteOne(id);
  }
};
