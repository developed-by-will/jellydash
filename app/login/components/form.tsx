'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import Image, { StaticImageData } from 'next/image';
import { ReactNode } from 'react';
import { IconType } from 'react-icons/lib';
import { providerDetails, ProvidersEnum } from './providerDetails';

// Check if one of the providers is 'custom'
// If it is then customLabel & customBtnColor are required
export type LoginPage01Type = {
  backgroundImage?: string | StaticImageData;
  companyLogo?: string | StaticImageData | JSX.Element;
  companyLogoAlternative?: string | StaticImageData | JSX.Element;
  title?: string | JSX.Element;
  description?: string | JSX.Element;
  providers: ProvidersEnum[];
  handleLogin: Array<() => void>;
  formWidth: number;
} & {
  providers: (ProvidersEnum | 'custom')[];
  customLabel: string;
  customBtnColor: string;
  customIcon: IconType | string | JSX.Element;
} & (
    | { companyLogo?: string | StaticImageData | JSX.Element; companyLogoAlt?: string }
    | {
        companyLogo?: string | StaticImageData | JSX.Element;
        companyLogoAlt?: string;
        companyLogoAlternative?: string | StaticImageData | JSX.Element;
      }
  );

export default function LoginPage01(props: Readonly<LoginPage01Type>) {
  const {
    backgroundImage,
    companyLogo,
    companyLogoAlternative,
    title,
    description,
    providers = [],
    handleLogin = [],
    formWidth
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
    <>
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

      <div className="relative z-40 pt-8 flex flex-col items-center px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="pt-20">
          {logo && (typeof logo === 'string' || 'src' in logo) ? (
            <Image
              src={logo}
              alt={companyLogoAlt ?? 'Company Logo'}
              width={formWidth}
              height={100}
            />
          ) : (
            logo
          )}
        </div>
      </div>

      <div className="relative z-50 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card
          className={`flex flex-col border-none backdrop-blur-sm bg-gray-800 bg-opacity-50 shadow sm:rounded-lg px-4 z-10 w-[${formWidth}px]`}
        >
          <CardHeader className="flex flex-col items-center">
            <CardTitle>
              {title && (
                <h2 className="mb-6 -mt-1 text-center text-lg font-bold text-neutral-200">
                  {title}
                </h2>
              )}
            </CardTitle>
            <CardDescription>
              {description && <div className="text-colors-neutral-700">{description}</div>}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col gap-3">
              <Input
                id="email"
                placeholder="Username"
                className="!bg-gray-700/80 placeholder:text-gray-400 border-gray-500 py-5 text-white"
              />

              <Input
                id="password"
                type="password"
                placeholder="********"
                className="!bg-gray-700/80 placeholder:text-gray-400 border-gray-500 py-5 text-white"
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
                  className={`inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition ease-in-out duration-150 cursor-pointer disabled:opacity-50 whitespace-nowrap text-white border border-indigo-500 bg-indigo-600 bg-opacity-80 hover:bg-opacity-100 hover:border-indigo-500 focus:border-indigo-700 focus:ring-indigo active:bg-opacity-100 active:border-indigo-700 px-4 py-2 text-sm button-md mt-2 w-full shadow-sm ${background}`}
                >
                  {icon as ReactNode} {label}
                </Button>
              );
            })}
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
