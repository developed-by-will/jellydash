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
import useQueryHandler from '@/hooks/useQueryHandler';
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

// Playlists always leads the home screen row order - everything else follows in whatever order
// Jellyfin reports the libraries.
const PLAYLISTS_VIEW = '4b94e5cbf58c7a5ea5a2c7bbd0a1e781->Playlists';

export default function CreateUser() {
  const [isPending, setIsPending] = useState(false);
  const [password, setPassword] = useState('');

  const form = useForm<CreateUserPayloadType>({
    resolver: zodResolver(formValidationRules),
    mode: 'onChange',
    defaultValues
  });

  const { control, handleSubmit } = form;

  const { data: compactLibraries } = useQueryHandler<string[]>({
    queryKey: 'libraries-all-compact',
    endpoint: 'libraries/all?info=compact'
  });

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
      const otherViews = (compactLibraries ?? []).filter(
        (view) => !view.startsWith(`${PLAYLISTS_VIEW.split('->')[0]}->`)
      );

      updateUserConfigs.mutate({
        OrderedViews: [PLAYLISTS_VIEW, ...otherViews],
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
