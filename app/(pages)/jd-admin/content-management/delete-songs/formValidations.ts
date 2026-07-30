import * as z from 'zod';

export const formValidationRules = z.object({
  playlist: z
    .any()
    .refine((files) => files?.length === 1, {
      message: 'Playlist file is required'
    })
    .refine((files) => files?.[0]?.size <= 1024 * 1024, {
      message: 'File must be less than 1MB'
    })
    .refine(
      (files) =>
        ['audio/x-mpegurl', 'application/vnd.apple.mpegurl', 'text/plain'].includes(
          files?.[0]?.type
        ) || /\.(m3u|m3u8)$/i.test(files?.[0]?.name),
      {
        message: 'Only .m3u or .m3u8 files are allowed'
      }
    ),
  musicPath: z
    .string()
    .trim()
    .min(1, { message: 'Music folder path is required' }),
  jellyfinPath: z.string().trim().optional()
});

export type FormValidationRules = z.infer<typeof formValidationRules>;
