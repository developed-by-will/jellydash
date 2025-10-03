import { UseFormReturn } from 'react-hook-form';
import { BasePropsType } from '../BasePropsType';

export type PropsType<T extends Record<string, any>> = BasePropsType<T> & {
  label: string;
  form: UseFormReturn<T>;
};
