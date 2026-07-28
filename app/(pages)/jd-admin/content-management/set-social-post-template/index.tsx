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
    defaultValues: { picture: undefined }
  });

  const { control, handleSubmit, reset } = form;

  const onSubmit = async (data: any) => {
    setIsUploading(true);

    try {
      const formData = new FormData();

      if (data.picture[0]) {
        formData.append('picture', data.picture[0]);
      } else {
        throw new Error('No file selected');
      }

      const res = await fetch('/api/set-social-post-template', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      console.log(result);
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
                name="picture"
                label="Picture"
                form={form}
                error={form.formState.errors.picture?.message as string | undefined}
              />
              <Button type="submit" disabled={isUploading} className="mt-6">
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
