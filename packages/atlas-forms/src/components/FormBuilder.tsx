import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@atlas/ui';
import './FormBuilder.css';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'checkbox';
  placeholder?: string;
  options?: { label: string; value: string | number }[];
}

export interface FormBuilderProps<T extends z.ZodTypeAny> {
  schema: T;
  fields: FormField[];
  onSubmit: (data: z.infer<T>) => void;
  defaultValues?: Partial<z.infer<T>>;
  submitLabel?: string;
  isLoading?: boolean;
}

export function FormBuilder<T extends z.ZodTypeAny>({
  schema,
  fields,
  onSubmit,
  defaultValues,
  submitLabel = 'Submit',
  isLoading = false
}: FormBuilderProps<T>) {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any
  });

  return (
    <form className="atlas-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="atlas-form-grid">
        {fields.map(field => (
          <div key={field.name} className="atlas-form-group">
            <label className="atlas-form-label" htmlFor={field.name}>{field.label}</label>
            <Controller
              name={field.name as any}
              control={control}
              render={({ field: controllerField }) => {
                if (field.type === 'select') {
                  return (
                    <select 
                      id={field.name}
                      className={`atlas-input ${errors[field.name] ? 'input-error' : ''}`}
                      {...controllerField}
                    >
                      <option value="" disabled>{field.placeholder || 'Select...'}</option>
                      {field.options?.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  );
                }

                if (field.type === 'checkbox') {
                  return (
                    <input 
                      id={field.name}
                      type="checkbox"
                      className="atlas-checkbox"
                      checked={!!controllerField.value}
                      onChange={e => controllerField.onChange(e.target.checked)}
                    />
                  );
                }

                return (
                  <input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    className={`atlas-input ${errors[field.name] ? 'input-error' : ''}`}
                    {...controllerField}
                    onChange={e => {
                      if (field.type === 'number') {
                        controllerField.onChange(e.target.value ? Number(e.target.value) : undefined);
                      } else {
                        controllerField.onChange(e.target.value);
                      }
                    }}
                  />
                );
              }}
            />
            {errors[field.name] && (
              <span className="atlas-form-error">
                {errors[field.name]?.message as string}
              </span>
            )}
          </div>
        ))}
      </div>
      
      <div className="atlas-form-actions">
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Loading...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
