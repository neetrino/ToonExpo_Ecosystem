import { z } from "zod";

import { BUYER_REQUEST_NOTE_MAX_LENGTH } from "@/features/buyer/constants";

/**
 * Client schema for the optional note on a buyer catalog request.
 */
export const createRequestNoteSchema = z.object({
  note: z
    .string()
    .max(BUYER_REQUEST_NOTE_MAX_LENGTH)
    .transform((value) => value.trim()),
});

export type CreateRequestNoteValues = z.infer<typeof createRequestNoteSchema>;

/**
 * Builds the API body from form values + catalog entity ids.
 */
export const toCreateBuyerRequestBody = (input: {
  projectId: string;
  apartmentId?: string | undefined;
  note?: string | undefined;
}) => {
  const note = input.note?.trim();
  return {
    projectId: input.projectId,
    ...(input.apartmentId ? { apartmentId: input.apartmentId } : {}),
    ...(note && note.length > 0 ? { note } : {}),
  };
};
