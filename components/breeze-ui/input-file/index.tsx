import AlertError from '@/components/breeze-ui/alert-error';
import { Input as ShadcnInput } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { Controller, Path } from 'react-hook-form';
import { PropsType } from './props';

export const InputFile = <T extends Record<string, any>>(props: PropsType<T>) => {
  const { control, form, label, name, error } = props;
  const [inputKey, setInputKey] = useState(Math.random().toString());

  const formValue = form.watch(name as Path<T>);

  useEffect(() => {
    if (!formValue) {
      setInputKey(Math.random().toString());
    }
  }, [formValue]);

  return (
    <>
      <Controller
        name={name as Path<T>}
        control={control}
        render={({ field }) => {
          return (
            <label htmlFor={label}>
              <span className="text-base-100">{label}</span>
              <ShadcnInput
                id={label}
                type="file"
                name={name as Path<T>}
                key={inputKey}
                className="hover:bg-accent transition-all cursor-pointer"
                onChange={(e) => {
                  field.onChange(e.target.files);
                }}
              />
            </label>
          );
        }}
      />

      {error && <AlertError error={error} />}
    </>
  );
};
