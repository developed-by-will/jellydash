import { Control, Path, UseFormReturn } from 'react-hook-form';

export type PropsType<T extends Record<string, any>> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  form: UseFormReturn<T>;
  error?: string;
};
