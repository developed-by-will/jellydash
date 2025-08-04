'use client';

import { useToast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Form } from '@/components/ui/form';

import { POST } from '@/lib/breeze-ui/requestHandler';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import LoginPage01 from './components/form';
import { formValidationRules, LoginPayloadType, LoginResponseType } from './formValidations';

export default function Login() {
  const { toast, dismiss } = useToast();
  const [tries, setTries] = useState(3);
  const toastIdRef = useRef<string | undefined>(undefined);

  const form = useForm<z.infer<typeof formValidationRules>>({
    resolver: zodResolver(formValidationRules),
    mode: 'onChange'
  });

  const query = useMutation({
    mutationFn: async (formData: LoginPayloadType) => {
      return await POST<LoginPayloadType, LoginResponseType>('api/users/authenticate-by-name', {
        Username: formData.Username,
        Pw: formData.Pw
      });
    },
    onError: (error) => {
      if (tries === 1) {
        toast({
          title: 'Login Failed',
          description: 'Too many failed attempts. You maybe have been locked out.',
          variant: 'destructive'
        });
      } else {
        const { id } = toast({
          title: 'Login Failed',
          description: `You have ${tries} tries left before being locked out.`,
          variant: 'destructive'
        });

        setTries(tries - 1);
        toastIdRef.current = id;
      }

      console.log('Error:', error);
    },
    onSuccess: (data: LoginResponseType) => {
      setTries(2);
      dismiss(toastIdRef.current);
      toastIdRef.current = undefined;

      console.log('Login Response:', data);
    }
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => query.mutate(data))}
        className="flex flex-col flex-auto bg-info rounded-2xl gap-4 max-w-xl mx-auto justify-center min-h-screen"
      >
        <LoginPage01
          backgroundImage="/Splashscreen.jpeg"
          companyLogo="/logo.webp"
          companyLogoAlt="Jellydash Logo"
          formWidth={300}
          providers={['jellyfin']}
          title="A Jellyfin Management Dashboard"
          loading={query.isPending}
          control={form.control}
        />
      </form>
    </Form>
  );
}
