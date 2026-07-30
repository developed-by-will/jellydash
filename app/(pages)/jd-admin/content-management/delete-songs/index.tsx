'use client';

import { InputFile } from '@/components/breeze-ui/input-file';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import FolderPicker from './components/folderPicker';
import { formValidationRules } from './formValidations';

type DeleteSummary = {
  total: number;
  deleted: number;
  notFound: number;
  skipped: number;
  errors: number;
};

export default function DeletePlaylistSongs() {
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof formValidationRules>>({
    resolver: zodResolver(formValidationRules),
    mode: 'onSubmit',
    defaultValues: { playlist: undefined, musicPath: '', jellyfinPath: '' }
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: any) => {
    if (!data.playlist?.[0]) return;

    const confirmed = window.confirm(
      `This will permanently delete every song listed in this playlist from "${data.musicPath}". This cannot be undone. Continue?`
    );
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const formData = new FormData();
      formData.append('playlist', data.playlist[0]);
      formData.append('musicPath', data.musicPath);
      formData.append('jellyfinPath', data.jellyfinPath ?? '');

      const res = await fetch('/api/delete-songs', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.error ?? 'Failed to delete songs');
      }

      const summary: DeleteSummary = result.summary;
      const hasIssues = summary.notFound + summary.skipped + summary.errors > 0;

      toast({
        title: hasIssues ? 'Finished with some issues' : 'Songs deleted',
        description: `Deleted ${summary.deleted}/${summary.total}. Not found: ${summary.notFound}, skipped: ${summary.skipped}, errors: ${summary.errors}.`,
        variant: hasIssues ? 'warning' : 'success',
        duration: 6000
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to delete songs',
        variant: 'destructive',
        duration: 6000
      });
    } finally {
      reset();
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <Card className="flex-1 p-5">
        <div className="flex justify-center">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              encType="multipart/form-data"
              className="flex flex-col gap-4 w-full max-w-sm"
            >
              <FormField
                control={control}
                name="musicPath"
                disabled={isDeleting}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FolderPicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isDeleting}
                      error={fieldState.error?.message}
                    />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="jellyfinPath"
                disabled={isDeleting}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <Label htmlFor="jellyfinPath">
                      Jellyfin path (optional)
                      <Input
                        {...field}
                        id="jellyfinPath"
                        autoComplete="off"
                        disabled={isDeleting}
                      />
                    </Label>
                    {fieldState.error && (
                      <FormMessage className="text-xs">{fieldState.error.message}</FormMessage>
                    )}
                  </FormItem>
                )}
              />

              <InputFile
                control={control}
                name="playlist"
                label="m3u8 Playlist"
                form={form}
                error={form.formState.errors.playlist?.message as string | undefined}
              />

              <Button type="submit" variant="destructive" disabled={isDeleting} className="mt-2">
                {isDeleting ? 'Deleting...' : 'Delete Songs'}
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
