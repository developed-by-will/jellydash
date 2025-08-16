'use client';

import { CreateUserResponseType } from '@/app/api/types';
import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import useMutationHandler from '@/hooks/useMutationHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import UsersPage from '..';
import { CreateUserPayloadType, formValidationRules } from './formValidations';

const defaultValues = {
  Username: '',
  Pw: '',
  Package: ''
};

export default function CreateUser() {
  const form = useForm<CreateUserPayloadType>({
    resolver: zodResolver(formValidationRules),
    mode: 'onChange',
    defaultValues
  });

  const { control, handleSubmit } = form;

  const createUser = useMutationHandler<CreateUserPayloadType, CreateUserResponseType>({
    mutationKey: 'users-new',
    endpoint: 'users/new',
    invalidateQueryKeys: ['users-all']
  });

  useEffect(() => {
    if (createUser.isSuccess) {
      toast({
        title: 'User created successfully',
        description: 'Users table has been updated',
        variant: 'success',
        duration: 5000
      });

      form.reset({ ...defaultValues });
    }
  }, [createUser.isSuccess]);

  return (
    <Card className="flex flex-col xl:flex-row w-full">
      <div className="flex flex-col gap-10 p-10">
        <CardHeader className="p-0">
          <CardTitle>Create a new user</CardTitle>
          <CardDescription>Quickly create a new user and select it's package</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit((formData) => createUser.mutate(formData))}
            className="flex flex-col flex-auto bg-info rounded-2xl gap-4 max-w-sm mx-auto"
          >
            <FormField
              control={control}
              name="Username"
              disabled={createUser.isPending}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Label htmlFor="Username">
                      Username <span className="text-red-500">*</span>
                      <Input {...field} placeholder="Username" className="py-5" id="Username" />
                    </Label>
                  </FormControl>
                  {fieldState.error && (
                    <Badge variant="destructive">
                      <FormMessage className="text-white text-xs">
                        {fieldState.error.message}
                      </FormMessage>
                    </Badge>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="Pw"
              disabled={createUser.isPending}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Label htmlFor="Pw">
                      Password
                      <Input
                        {...field}
                        type="password"
                        id="Pw"
                        placeholder="********"
                        className="py-5"
                      />
                    </Label>
                  </FormControl>
                  {fieldState.error && (
                    <Badge variant="destructive">
                      <FormMessage className="text-white text-xs">
                        {fieldState.error.message}
                      </FormMessage>
                    </Badge>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="Package"
              disabled={createUser.isPending}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <Label htmlFor="Package">
                      Package <span className="text-red-500">*</span>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a package" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Packages</SelectLabel>
                            <SelectItem value="STANDARD" className="cursor-pointer">
                              Standard
                            </SelectItem>
                            <SelectItem value="CHILDREN" className="cursor-pointer">
                              Children
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Label>
                  </FormControl>
                  {fieldState.error && (
                    <Badge variant="destructive">
                      <FormMessage className="text-white text-xs">
                        {fieldState.error.message}
                      </FormMessage>
                    </Badge>
                  )}
                </FormItem>
              )}
            />

            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating...' : 'Create'}
            </Button>

            {createUser.isError && <Badge variant="destructive">{createUser.error.message}</Badge>}

            <div className="text-center text-sm">
              If you don't provide a password, the user will be created with a random one.
            </div>

            {createUser.isSuccess && createUser.data?.Pw && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigator.clipboard.writeText(`${createUser.data.Pw}`)}
              >
                Copy Password
              </Button>
            )}
          </form>
        </Form>
      </div>

      <div className="flex flex-col w-full">
        <UsersPage />
      </div>
    </Card>
  );
}
