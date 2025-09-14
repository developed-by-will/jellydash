'use client';

import {
  CreateUserResponseType,
  UpdateDisplayPrefsPayloadType,
  UsersUpdateConfigsPayloadType
} from '@/app/api/types';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import useMutationHandler from '@/hooks/useMutationHandler';
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
          '23055d604501c80c14c4039a7be70681->Destaques',
          'af92f2d68eea947c7f9df41836afb987->Filmes',
          'd565273fd114d77bdf349a2896867069->Séries',
          '1018a0db3df0561dc2e48ba8dbfbafb9->Séries PT',
          '3f1cdfa851070dc04e40b43ec5927636->Animação',
          'a3c1924c44cd056b3dbb7f61d0c57db9->Documentários',
          '565359d57d7119229df3b615bd177ba2->Animação Adulta',
          'ca0de50d2c11073f53df7c82dc3fe2a4->Animes',
          '6853e7ebc0e86f0ff3ecbbfa33afae5b->Ação e Aventura',
          '75f08b7187c9bd46db075cb4ca8b53cf->Comédia',
          '41bb2f6972b4bba3c88dbdee508e1ce0->Crime',
          '907db89c0f1154dd7be54e924be3b123->Drama',
          'c7e03f936c79e44852c6d4feee9fd1e8->Família',
          '1de99dfa495bb752dbd1a2652769177c->Fantasia',
          'c2c1004a870c68ed2094095ba829122f->Ficção Científica',
          '584cdd118eceee4fa94237ecf0df282a->Horror e Terror',
          'ac832d81c9b55382be5f58bb06131636->Mistério e Thriller',
          '4d97b71b4da03b37ee3dc8fee0d7782d->Musicais',
          '252844775c6daf18b3278b50ef25e344->Romance',
          '9bec90d4afd070984ee68c273324e9a1->Sobrenatural',
          '2b68116379a3285ff75282f3924d8e11->Super-Heróis',
          '7e64e319657a9516ec78490da03edccb->Music',
          'a4a7d3c943f3cdc73001448f67aa3235->TixaMusic'
        ],
        SubtitleLanguagePreference: 'por'
      });
    }
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
          <CardDescription>Quickly create a new user and select it's package</CardDescription>
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
