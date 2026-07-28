import * as z from 'zod';

export const formValidationRules = z.object({
  searchTerm: z
    .string()
    .nonempty({ message: 'searchTerm is required' })
    .min(2, { message: 'At least 2 characters' })
});

export type SearchItemPayloadType = z.infer<typeof formValidationRules>;
