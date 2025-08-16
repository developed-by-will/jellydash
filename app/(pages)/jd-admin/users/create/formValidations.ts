import * as z from 'zod';

export const formValidationRules = z.object({
  Username: z
    .string()
    .nonempty({ message: 'Username is required' })
    .min(2, { message: 'At least 2 characters' }),
  Pw: z.string(),
  Package: z.string().nonempty({ message: 'Package is required' })
});

export type CreateUserPayloadType = z.infer<typeof formValidationRules>;
