import * as z from 'zod';

export const formValidationRules = z.object({
  picture: z
    .any()
    .refine((files) => files?.length > 0, {
      message: 'File is required'
    })
    .refine((files) => files?.[0]?.size <= 1024 * 1024, {
      message: 'File must be less than 1MB'
    })
    .refine((files) => ['image/png', 'image/jpeg'].includes(files?.[0]?.type), {
      message: 'Only PNG or JPEG images are allowed'
    })
});

export type FormValidationRules = z.infer<typeof formValidationRules>;
