import { Badge } from '@/components/ui/badge';
import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

type Props = {
  control: any;
  isPending: boolean;
};

export default function FormFields(props: Readonly<Props>) {
  const { control, isPending } = props;

  return (
    <>
      <FormField
        control={control}
        name="Username"
        disabled={isPending}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <Label htmlFor="Username">
                Username <span className="text-red-500">*</span>
                <Input {...field} placeholder="Username" className="py-5" id="Username" />
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

      <FormField
        control={control}
        name="Pw"
        disabled={isPending}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <Label htmlFor="Pw">
                Password
                <Input {...field} type="password" id="Pw" placeholder="********" className="py-5" />
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

      <FormField
        control={control}
        name="Package"
        disabled={isPending}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <div>
                Package <span className="text-red-500">*</span>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ''}
                  disabled={isPending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a package" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Packages</SelectLabel>
                      <SelectItem value="STANDARD" className="cursor-pointer">
                        Standard
                      </SelectItem>
                      <SelectItem value="CHILDREN" className="cursor-pointer">
                        Children
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </FormControl>
            {fieldState.error && (
              <Badge variant="destructive">
                <FormMessage className="text-white text-xs">{fieldState.error.message}</FormMessage>
              </Badge>
            )}
          </FormItem>
        )}
      />
    </>
  );
}
