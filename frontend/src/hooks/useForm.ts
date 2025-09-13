import { useState, useCallback, useMemo } from 'react';
import { FormState, FormField } from '../types/ui';
import { ValidationSchema, validateForm, createFieldValidator } from '../lib/validation';

// Enhanced form hook with comprehensive validation
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>,
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    resetOnSubmit?: boolean;
  } = {}
) {
  const { validateOnChange = true, validateOnBlur = true, resetOnSubmit = false } = options;

  // Form state
  const [values, setValues] = useState<T>(initialValues);
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form fields with validation state
  const fields = useMemo((): FormState<T>['fields'] => {
    const result = {} as { [K in keyof T]: FormField<T[K]> };

    for (const key in initialValues) {
      const validator = createFieldValidator(validationSchema[key]);
      const fieldState = validator(values[key], touched[key]);

      result[key] = {
        value: fieldState.value as T[typeof key],
        error: fieldState.errors[0] || undefined,
        touched: fieldState.touched,
        valid: fieldState.isValid,
      };
    }

    return result;
  }, [values, touched, initialValues, validationSchema]);

  // Computed form state
  const formState = useMemo((): FormState<T> => {
    const allFields = Object.values(fields) as FormField<unknown>[];

    return {
      fields,
      isValid: allFields.every(field => field.valid),
      isSubmitting,
      isDirty: JSON.stringify(values) !== JSON.stringify(initialValues),
    };
  }, [fields, isSubmitting, values, initialValues]);

  // Update a single field
  const setFieldValue = useCallback(
    <K extends keyof T>(name: K, value: T[K]) => {
      setValues(prev => ({ ...prev, [name]: value }));

      // Validate on change if enabled
      if (validateOnChange) {
        setTouched(prev => ({ ...prev, [name]: true }));
      }
    },
    [validateOnChange]
  );

  // Mark field as touched
  const setFieldTouched = useCallback(
    <K extends keyof T>(name: K, touched: boolean = true) => {
      setTouched(prev => ({ ...prev, [name]: touched }));
    },
    []
  );

  // Handle field blur
  const handleFieldBlur = useCallback(
    <K extends keyof T>(name: K) => {
      if (validateOnBlur) {
        setTouched(prev => ({ ...prev, [name]: true }));
      }
    },
    [validateOnBlur]
  );

  // Set multiple values at once
  const setValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));

    // Mark all updated fields as touched if validateOnChange is enabled
    if (validateOnChange) {
      const touchedKeys = Object.keys(newValues) as (keyof T)[];
      setTouched(prev => {
        const newTouched = { ...prev };
        touchedKeys.forEach(key => {
          newTouched[key] = true;
        });
        return newTouched;
      });
    }
  }, [validateOnChange]);

  // Reset form to initial values
  const reset = useCallback(
    (newInitialValues?: T) => {
      const resetValues = newInitialValues || initialValues;
      setValues(resetValues);
      setTouched({} as Record<keyof T, boolean>);
      setIsSubmitting(false);
    },
    [initialValues]
  );

  // Validate entire form
  const validateForm = useCallback(() => {
    const validation = validateForm(values, validationSchema);

    // Mark all fields as touched
    const allTouched = {} as Record<keyof T, boolean>;
    for (const key in values) {
      allTouched[key] = true;
    }
    setTouched(allTouched);

    return validation;
  }, [values, validationSchema]);

  // Submit handler with validation
  const handleSubmit = useCallback(
    async (submitFn: (values: T) => Promise<void> | void) => {
      setIsSubmitting(true);

      try {
        const validation = validateForm();

        if (!validation.isValid) {
          setIsSubmitting(false);
          return { success: false, errors: validation.errors };
        }

        await submitFn(validation.validData!);

        if (resetOnSubmit) {
          reset();
        }

        setIsSubmitting(false);
        return { success: true };
      } catch (error) {
        setIsSubmitting(false);
        const errorMessage = error instanceof Error ? error.message : 'Submission failed';
        return { success: false, error: errorMessage };
      }
    },
    [validateForm, resetOnSubmit, reset]
  );

  // Get field props for easy binding to inputs
  const getFieldProps = useCallback(
    <K extends keyof T>(name: K) => ({
      name: String(name),
      value: values[name],
      onChange: (value: T[K]) => setFieldValue(name, value),
      onBlur: () => handleFieldBlur(name),
      error: fields[name].error,
      touched: fields[name].touched,
      valid: fields[name].valid,
    }),
    [values, setFieldValue, handleFieldBlur, fields]
  );

  // Get input props for HTML inputs
  const getInputProps = useCallback(
    <K extends keyof T>(name: K) => ({
      name: String(name),
      value: String(values[name] || ''),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value as T[K];
        setFieldValue(name, value);
      },
      onBlur: () => handleFieldBlur(name),
      'aria-invalid': !fields[name].valid && fields[name].touched,
      'aria-describedby': fields[name].error ? `${String(name)}-error` : undefined,
    }),
    [values, setFieldValue, handleFieldBlur, fields]
  );

  return {
    // State
    values,
    errors: formState.fields,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
    formState,

    // Field methods
    setFieldValue,
    setFieldTouched,
    setValues,
    getFieldProps,
    getInputProps,

    // Form methods
    reset,
    validateForm,
    handleSubmit,
  };
}

// Specialized form hooks
export function useContactForm() {
  return useForm(
    {
      name: '',
      email: '',
      phone: '',
      message: '',
    },
    {
      name: (value: string) => ({
        isValid: value.length >= 2 && value.length <= 100,
        errors: value.length < 2 ? ['Name must be at least 2 characters'] :
                value.length > 100 ? ['Name must be less than 100 characters'] : [],
        data: value,
      }),
      email: (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);
        return {
          isValid,
          errors: !isValid ? ['Please enter a valid email address'] : [],
          data: value,
        };
      },
      phone: (value: string) => {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        const cleanedValue = value.replace(/[^\d+]/g, '');
        const isValid = phoneRegex.test(cleanedValue);
        return {
          isValid,
          errors: !isValid ? ['Please enter a valid phone number'] : [],
          data: cleanedValue,
        };
      },
      message: (value: string) => ({
        isValid: value.length <= 500,
        errors: value.length > 500 ? ['Message must be less than 500 characters'] : [],
        data: value,
      }),
    }
  );
}

export function useSearchForm() {
  return useForm(
    {
      query: '',
      location: '',
      budget: '',
    },
    {
      query: (value: string) => ({
        isValid: value.length >= 1 && value.length <= 500,
        errors: value.length < 1 ? ['Search query is required'] :
                value.length > 500 ? ['Search query is too long'] : [],
        data: value,
      }),
      location: (value: string) => ({
        isValid: true,
        errors: [],
        data: value,
      }),
      budget: (value: string) => {
        if (!value) return { isValid: true, errors: [], data: value };

        const numValue = parseFloat(value);
        const isValid = !isNaN(numValue) && numValue > 0;
        return {
          isValid,
          errors: !isValid ? ['Please enter a valid budget amount'] : [],
          data: value,
        };
      },
    }
  );
}