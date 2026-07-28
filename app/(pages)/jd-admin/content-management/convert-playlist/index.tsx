'use client';

import { InputFile } from '@/components/breeze-ui/input-file';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { formValidationRules } from './formValidations';

export default function GenerateSocialPost() {
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formValidationRules>>({
    resolver: zodResolver(formValidationRules),
    mode: 'onSubmit',
    defaultValues: { playlist: undefined }
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: any) => {
    setIsUploading(true);

    try {
      const formData = new FormData();

      if (!data.playlist?.[0]) {
        throw new Error('No file selected');
      }

      formData.append('playlist', data.playlist[0]);

      const res = await fetch('/api/convert-playlist', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to generate playlist');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'playlist.xml';
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      reset();
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <Card className="flex-1 p-5">
        <div className="flex gap-5 flex-col lg:flex-row items-center justify-end">
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              encType="multipart/form-data"
              className="flex items-center rounded-2xl gap-4 max-w-sm mx-auto"
            >
              <InputFile
                control={control}
                name="playlist"
                label="Symfonium Playlist"
                form={form}
                error={form.formState.errors.playlist?.message as string | undefined}
              />
              <Button type="submit" disabled={isUploading} className="mt-6">
                {isUploading ? 'Converting...' : 'Convert'}
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
