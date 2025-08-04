'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Loader2Icon } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image, { StaticImageData } from 'next/image';
import { ReactNode } from 'react';
import { Control } from 'react-hook-form';
import { IconType } from 'react-icons/lib';
import { providerDetails, ProvidersEnum } from './providerDetails';

// Check if one of the providers is 'custom'
// If it is then customLabel & customBtnColor are required
type BaseLoginProps = {
  backgroundImage?: string | StaticImageData;
  companyLogo?: string | StaticImageData | JSX.Element;
  companyLogoAlternative?: string | StaticImageData | JSX.Element;
  title?: string | JSX.Element;
  description?: string | JSX.Element;
  handleLogin?: Array<() => void>;
  formWidth: number;
  loading?: boolean;
  control: Control<any>;
} & (
  | { companyLogo?: string | StaticImageData | JSX.Element; companyLogoAlt?: string }
  | {
      companyLogo?: string | StaticImageData | JSX.Element;
      companyLogoAlt?: string;
      companyLogoAlternative?: string | StaticImageData | JSX.Element;
    }
);

type ProvidersRequirement<T extends (ProvidersEnum | 'custom')[]> = 'custom' extends T[number]
  ? {
      providers: T;
      customLabel?: string;
      customBtnColor?: string;
      customIcon?: IconType | string | JSX.Element;
    }
  : {
      providers: T;
      customLabel: never;
      customBtnColor: never;
      customIcon: never;
    };

export type LoginPage01Type = BaseLoginProps & ProvidersRequirement<(ProvidersEnum | 'custom')[]>;

export default function LoginPage01(props: Readonly<LoginPage01Type>) {
  const {
    backgroundImage,
    companyLogo,
    companyLogoAlternative,
    title,
    description,
    providers = [],
    handleLogin = [],
    formWidth,
    loading,
    control
  } = props;

  const { theme, systemTheme } = useTheme();

  // Optional chaining ensures customLabel & customBtnColor are only accessed if defined
  const customLabel = 'customLabel' in props ? props.customLabel : undefined;
  const customBtnColor = 'customBtnColor' in props ? props.customBtnColor : undefined;
  const companyLogoAlt = 'companyLogoAlt' in props ? props.companyLogoAlt : undefined;
  const customIcon = 'customIcon' in props ? props.customIcon : undefined;

  const currentTheme = theme === 'system' ? systemTheme : theme;
  const logo = currentTheme === 'dark' ? companyLogoAlternative : companyLogo;

  return (
    <div className="flex flex-col gap-4">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt="Jellydash Login Background"
          className="absolute object-cover"
          quality={100}
          priority
          fill
        />
      )}

      <div className="z-40 flex justify-center">
        {logo && (typeof logo === 'string' || 'src' in logo) ? (
          <Image src={logo} alt={companyLogoAlt ?? 'Company Logo'} width={formWidth} height={100} />
        ) : (
          logo
        )}
      </div>

      <div className="relative z-50 sm:mx-auto sm:w-full sm:max-w-md">
        <Card
          className={`flex flex-col border-none backdrop-blur-sm bg-gray-800 bg-opacity-50 shadow sm:rounded-lg px-4 z-10 w-[${formWidth}px]`}
        >
          <CardHeader className="flex flex-col items-center">
            <CardTitle>
              {title && <h2 className="text-center text-lg font-bold text-neutral-200">{title}</h2>}
            </CardTitle>
            <CardDescription>
              {description && <div className="text-white">{description}</div>}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col gap-3">
              <FormField
                control={control}
                name="Username"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Username"
                        className="!bg-gray-700/80 placeholder:text-gray-400 border-gray-500 py-5 text-white"
                        value={field.value || ''}
                      />
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
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="********"
                        className="!bg-gray-700/80 placeholder:text-gray-400 border-gray-500 py-5 text-white"
                        value={field.value || ''}
                      />
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
            </div>
          </CardContent>
          <CardFooter className="flex w-full flex-wrap gap-2 ">
            {providers.map((provider, index) => {
              const { label, icon, background } =
                provider === 'custom'
                  ? {
                      label: customLabel!,
                      icon: customIcon,
                      background: customBtnColor!
                    }
                  : providerDetails[provider];
              const handleClick = handleLogin[index];

              return (
                <Button
                  key={provider}
                  onClick={handleClick}
                  disabled={loading}
                  className={`
                    inline-flex items-center justify-center 
                    font-medium rounded-md focus:outline-none 
                    transition-all duration-200 ease-linear
                    cursor-pointer disabled:opacity-50 
                    whitespace-nowrap 
                    px-4 py-2 text-sm mt-2 w-full shadow-sm
                    ${customBtnColor && `bg-${customBtnColor}`}
                    ${!customBtnColor && `${background}`}
                    hover:bg-${background}
                    transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                    transform hover:scale-[0.98] active:scale-[0.99]
                  `}
                >
                  {icon as ReactNode} {label}
                  {loading && <Loader2Icon className="animate-spin ml-2" />}
                </Button>
              );
            })}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
