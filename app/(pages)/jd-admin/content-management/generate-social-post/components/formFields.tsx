import { Badge } from '@/components/ui/badge';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  control: any;
  isPending: boolean;
};

export default function FormFields(props: Readonly<Props>) {
  const { control, isPending } = props;

  return (
    <FormField
      control={control}
      name="searchTerm"
      disabled={isPending}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormControl>
            <Label htmlFor="searchTerm">
              Search <span className="text-red-500">*</span>
              <Input
                {...field}
                placeholder="Type the name here"
                className="py-5"
                id="searchTerm"
                autoComplete="off"
              />
            </Label>
          </FormControl>
          {fieldState.error && (
            <Badge variant="destructive">
              <FormMessage className="text-white text-xs">{fieldState.error.message}</FormMessage>
            </Badge>
          )}
        </FormItem>
      )}
    />
  );
}
