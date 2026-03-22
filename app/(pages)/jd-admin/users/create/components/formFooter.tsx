import { toast } from '@/components/breeze-ui/toast/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

type Props = {
  control: any;
  isPending: boolean;
  Pw: string;
  isError: boolean;
  isSuccess: boolean;
  errorMessage: string;
};

export default function FormFooter(props: Readonly<Props>) {
  const { isPending, Pw, isError, isSuccess, errorMessage } = props;
  const [passwordButton, setPasswordButton] = useState(true);

  useEffect(() => {
    if (Pw) setPasswordButton(true);
  }, [Pw]);

  const copyHandler = () => {
    navigator.clipboard.writeText(Pw);

    toast({
      description: 'Password copied to clipboard',
      variant: 'info',
      duration: 2000
    });

    setPasswordButton(false);
  };

  return (
    <>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create'}
      </Button>

      {isError && <Badge variant="destructive">{errorMessage}</Badge>}

      <div className="text-center text-sm">
        If you don&apos;t provide a password, the user will be created with a random one.
      </div>

      {isSuccess && Pw && passwordButton && !isPending && (
        <Button type="button" variant="secondary" onClick={copyHandler}>
          Copy Password
        </Button>
      )}
    </>
  );
}
