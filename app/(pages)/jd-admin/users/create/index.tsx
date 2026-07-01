'use client';

import {
  CreateUserResponseType,
  UpdateDisplayPrefsPayloadType,
  UsersUpdateConfigsPayloadType
} from '@/app/api/types';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useMutationHandler } from '@/hooks/useMutationHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import UsersPage from '..';
import FormFields from './components/formFields';
import FormFooter from './components/formFooter';
import { CreateUserPayloadType, formValidationRules } from './formValidations';

const defaultValues = {
  Username: '',
  Pw: '',
  Package: ''
};

export default function CreateUser() {
  const [isPending, setIsPending] = useState(false);
  const [password, setPassword] = useState('');

  const form = useForm<CreateUserPayloadType>({
    resolver: zodResolver(formValidationRules),
    mode: 'onChange',
    defaultValues
  });

  const { control, handleSubmit } = form;

  const createUser = useMutationHandler<CreateUserPayloadType, CreateUserResponseType>({
    mutationKey: 'users-new',
    endpoint: 'users/new'
    //invalidateQueryKeys: ['users-all']
  });

  const updateUserConfigs = useMutationHandler<UsersUpdateConfigsPayloadType, Response>({
    mutationKey: 'users-update-configs',
    endpoint: 'users/update-configs'
  });

  const updateDisplayPrefs = useMutationHandler<UpdateDisplayPrefsPayloadType, Response>({
    mutationKey: 'users-display-prefs',
    endpoint: 'users/update-display-prefs',
    invalidateQueryKeys: ['users-all']
  });

  useEffect(() => {
    if (createUser.isPending) setIsPending(true);
  }, [createUser.isPending]);

  useEffect(() => {
    if (createUser.isError) setIsPending(false);
    if (createUser.isSuccess) {
      updateUserConfigs.mutate({
        OrderedViews: [
          'af92f2d68eea947c7f9df41836afb987->Filmes',
          'd565273fd114d77bdf349a2896867069->Séries',
          '3f1cdfa851070dc04e40b43ec5927636->Animação',
          '1018a0db3df0561dc2e48ba8dbfbafb9->Séres PT',
          'a3c1924c44cd056b3dbb7f61d0c57db9->Documentários',
          'ca0de50d2c11073f53df7c82dc3fe2a4->Animes',
          'cb7c5f4cc4fdd65994af1a681dfffcd3->Séries Documentários',
          '7e64e319657a9516ec78490da03edccb->Vir7uaLMusic',
          'a4a7d3c943f3cdc73001448f67aa3235->TixaMusic'
        ],
        SubtitleLanguagePreference: 'por'
      });
    }
    // eslint-disable-next-line
  }, [createUser.isSuccess, createUser.isError]);

  useEffect(() => {
    if (updateUserConfigs.isSuccess) {
      updateDisplayPrefs.mutate({
        SortBy: 'AirTime',
        CustomPrefs: {
          homesection0: 'resume',
          homesection1: 'smalllibrarytiles',
          homesection2: 'nextup',
          homesection3: 'latestmedia',
          homesection4: 'none',
          homesection5: 'none',
          homesection6: 'none',
          homesection7: 'none',
          homesection8: 'none',
          homesection9: 'none',
          homesection10: 'none'
        },
        ScrollDirection: 'Horizontal'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateUserConfigs.isSuccess]);

  useEffect(() => {
    if (!updateDisplayPrefs.isPending || updateDisplayPrefs.isSuccess) setIsPending(false);
    if (updateDisplayPrefs.isSuccess) {
      toast({
        title: 'User created successfully',
        description: 'Users table has been updated',
        variant: 'success',
        duration: 5000
      });
      form.reset({ ...defaultValues });
    }
    // eslint-disable-next-line
  }, [updateDisplayPrefs.isSuccess, updateDisplayPrefs.isPending]);

  useEffect(() => {
    if (createUser.isSuccess && createUser.data?.Pw) {
      setPassword(createUser.data.Pw);
    }
  }, [createUser.isSuccess, createUser.data?.Pw]);

  return (
    <Card className="flex flex-col xl:flex-row w-full">
      <div className="flex flex-col gap-10 p-10">
        <CardHeader className="p-0">
          <CardTitle>Create a new user</CardTitle>
          <CardDescription>Quickly create a new user and select its package</CardDescription>
        </CardHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit((formData) => {
              createUser.mutate(formData);
            })}
            className="flex flex-col flex-auto bg-info rounded-2xl gap-4 max-w-sm mx-auto"
          >
            <FormFields control={control} isPending={isPending} />

            <FormFooter
              isPending={isPending}
              Pw={password}
              control={control}
              isError={createUser.isError}
              errorMessage={`${createUser.error?.message}`}
              isSuccess={createUser.isSuccess}
            />
          </form>
        </Form>
      </div>

      <div className="flex flex-col w-full">
        <UsersPage />
      </div>
    </Card>
  );
}
