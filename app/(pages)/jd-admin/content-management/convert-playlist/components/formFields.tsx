import { Badge } from '@/components/ui/badge';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Props = {
  control: any;
  isPending: boolean;
};

export default function FormFields({ control, isPending }: Readonly<Props>) {
  return (
    <FormField
      control={control}
      name="playlist"
      disabled={isPending}
      render={({ field, fieldState }) => (
        <FormItem>
          <Label htmlFor="playlist">
            Playlist <span className="text-red-500">*</span>
          </Label>

          <FormControl>
            <Input
              id="playlist"
              type="file"
              accept=".m3u,.m3u8"
              disabled={isPending}
              onChange={(e) => field.onChange(e.target.files)}
            />
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
