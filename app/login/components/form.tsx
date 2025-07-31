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
import { Label } from '@/components/ui/label';
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
          alt="Background image of a forest"
          className="absolute w-full h-full object-cover"
          quality={100}
          priority
          fill
        />
      )}

      <div className="flex flex-col items-center justify-center h-screen">
        <Card
          className={`flex flex-col items-center justify-center bg-secondary/90 shadow-2xl px-4 z-10 w-[${formWidth}px]`}
        >
          <CardHeader className="flex flex-col items-center">
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
            <CardTitle>{title && <h2>{title}</h2>}</CardTitle>
            <CardDescription>
              {description && <div className="text-colors-neutral-700">{description}</div>}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="flex flex-col gap-3">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Emaill address" />
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="********" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-14">
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
                  className={`flex items-center w-full gap-2 hover:saturate-50 transition-all duration-300 ${background}`}
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
