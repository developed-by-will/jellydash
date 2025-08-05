'use client';

import { useToast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Form } from '@/components/ui/form';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import LoginPage01 from './components/form';
import { formValidationRules, LoginPayloadType } from './formValidations';

export default function Login() {
  const { toast } = useToast();
  const [tries, setTries] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formValidationRules>>({
    resolver: zodResolver(formValidationRules),
    mode: 'onChange'
  });

  const onSubmit = async (formData: LoginPayloadType) => {
    setIsLoading(true);

    const result = await signIn('credentials', {
      username: formData.Username,
      password: formData.Pw,
      redirect: false
    });

    if (result?.error) {
      if (tries === 1) {
        toast({
          title: 'Login Failed',
          description: 'Too many failed attempts. You maybe have been locked out.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Login Failed',
          description: `You have ${tries} tries left before being locked out.`,
          variant: 'destructive'
        });

        setTries(tries - 1);
      }

      console.log('Error:', result?.error);
      setIsLoading(false);
    } else {
      redirect('/jd-admin/dashboard');
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-auto bg-info rounded-2xl gap-4 max-w-xl mx-auto justify-center min-h-screen"
      >
        <LoginPage01
          backgroundImage="/Splashscreen.jpeg"
          companyLogo="/logo.webp"
          companyLogoAlt="Jellydash Logo"
          formWidth={300}
          providers={['jellyfin']}
          title="A Jellyfin Management Dashboard"
          loading={isLoading}
          control={form.control}
        />
      </form>
    </Form>
  );
}
