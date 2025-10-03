import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AlertError(error: any) {
  return (
    <Alert variant="destructive" className="glass mt-2">
      <AlertDescription>{error.error}</AlertDescription>
    </Alert>
  );
}
