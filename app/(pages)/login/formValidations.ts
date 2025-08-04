import * as z from 'zod';

export const formValidationRules = z.object({
  Username: z
    .string()
    .min(1, { message: 'Username is required' })
    .min(2, { message: 'At least 2 characters' }),
  Pw: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'At least 8 characters' })
});

const LoginResponse = z.object({ AccessToken: z.string() });

export type LoginPayloadType = z.infer<typeof formValidationRules>;
export type LoginResponseType = z.infer<typeof LoginResponse>;
