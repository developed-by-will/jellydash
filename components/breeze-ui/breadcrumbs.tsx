import Link from 'next/link';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

export type BreadcrumbType = {
  text: string;
  url?: string;
};

type BreadcrumbsProps = {
  breadcrumbs: BreadcrumbType[];
  position: 'justify-start' | 'justify-center' | 'justify-end';
};

export default function Breadcrumbs(props: Readonly<BreadcrumbsProps>) {
  const { breadcrumbs, position } = props;

  return (
    <div className={`flex w-full ${position} text-sm mt-4 mb-6`}>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((breadcrumb, index) => {
            const isLastItem = index === breadcrumbs.length - 1;

            return (
              <BreadcrumbItem key={breadcrumb.text} className="capitalize">
                {breadcrumb.url ? (
                  <Link
                    className="underline underline-offset-4 hover:text-primary transition-all"
                    href={breadcrumb.url}
                  >
                    {breadcrumb.text}
                  </Link>
                ) : (
                  <BreadcrumbPage
                    className={isLastItem ? 'text-primary font-medium' : 'text-muted-foreground'}
                  >
                    {breadcrumb.text}
                  </BreadcrumbPage>
                )}

                {!isLastItem && <BreadcrumbSeparator />}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
