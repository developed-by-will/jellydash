'use client';

import { useToast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { SiJellyfin } from 'react-icons/si';
import backgroundImage from '../../public/Splashscreen.jpeg';
import logo from '../../public/logo.webp';
import LoginPage01 from './components/form';

export default function Login() {
  const { toast } = useToast();

  async function signIn() {
    toast({
      description: 'description',
      title: 'title'
    });
  }

  return (
    <LoginPage01
      customBtnColor="bg-indigo-600 hover:bg-indigo-700"
      customLabel="Sign In with Jellyfin"
      backgroundImage={backgroundImage}
      companyLogo={logo}
      customIcon={<SiJellyfin />}
      formWidth={300}
      providers={['custom']}
      title="Login with Jellyfin"
      handleLogin={[() => signIn()]}
    />
  );
}
