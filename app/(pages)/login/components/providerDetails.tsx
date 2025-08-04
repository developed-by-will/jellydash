import { BsDiscord, BsEnvelopeFill, BsFacebook, BsGithub, BsGoogle } from 'react-icons/bs';
import { SiJellyfin } from 'react-icons/si';

// List of providers
export type ProvidersEnum =
  | 'google'
  | 'github'
  | 'discord'
  | 'facebook'
  | 'email'
  | 'custom'
  | 'jellyfin';

// Exclude 'custom' from the list because it is handled separately
export const providerDetails: Record<
  Exclude<ProvidersEnum, 'custom'>,
  { label: string; icon?: JSX.Element; background: string }
> = {
  google: {
    label: 'Sign in with Google',
    icon: <BsGoogle />,
    background: 'bg-orange-600'
  },
  github: {
    label: 'Sign in with GitHub',
    icon: <BsGithub />,
    background: 'bg-stone-600'
  },
  discord: {
    label: 'Sign in with Discord',
    icon: <BsDiscord />,
    background: 'bg-indigo-600'
  },
  facebook: {
    label: 'Sign in with Facebook',
    icon: <BsFacebook />,
    background: 'bg-blue-600'
  },
  email: {
    label: 'Sign in with Email',
    icon: <BsEnvelopeFill />,
    background: 'bg-emerald-600'
  },
  jellyfin: {
    label: 'Sign in with Jellyfin',
    icon: <SiJellyfin />,
    background: 'bg-indigo-600'
  }
};
