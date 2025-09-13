// Validation utilities with type safety

export type ValidationResult<T = unknown> = {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly data?: T;
};

export type FieldValidator<T = unknown> = (value: T) => ValidationResult<T>;

// Basic validators
export const validators = {
  required: <T>(value: T): ValidationResult<T> => ({
    isValid: value !== null && value !== undefined && value !== '',
    errors: value === null || value === undefined || value === '' ? ['This field is required'] : [],
    data: value,
  }),

  email: (value: string): ValidationResult<string> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid email address'],
      data: value,
    };
  },

  phone: (value: string): ValidationResult<string> => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleanedValue = value.replace(/[^\d+]/g, '');
    const isValid = phoneRegex.test(cleanedValue);
    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid phone number'],
      data: cleanedValue,
    };
  },

  minLength: (min: number) => (value: string): ValidationResult<string> => {
    const isValid = value.length >= min;
    return {
      isValid,
      errors: isValid ? [] : [`Minimum length is ${min} characters`],
      data: value,
    };
  },

  maxLength: (max: number) => (value: string): ValidationResult<string> => {
    const isValid = value.length <= max;
    return {
      isValid,
      errors: isValid ? [] : [`Maximum length is ${max} characters`],
      data: value,
    };
  },

  pattern: (regex: RegExp, message: string) => (value: string): ValidationResult<string> => {
    const isValid = regex.test(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
      data: value,
    };
  },

  number: (value: string | number): ValidationResult<number> => {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    const isValid = !isNaN(numValue) && isFinite(numValue);
    return {
      isValid,
      errors: isValid ? [] : ['Please enter a valid number'],
      data: isValid ? numValue : undefined,
    };
  },

  range: (min: number, max: number) => (value: number): ValidationResult<number> => {
    const isValid = value >= min && value <= max;
    return {
      isValid,
      errors: isValid ? [] : [`Value must be between ${min} and ${max}`],
      data: value,
    };
  },

  custom: <T>(validator: (value: T) => boolean, message: string) => (value: T): ValidationResult<T> => {
    const isValid = validator(value);
    return {
      isValid,
      errors: isValid ? [] : [message],
      data: value,
    };
  },
};

// Combine multiple validators
export function combineValidators<T>(...validators: FieldValidator<T>[]): FieldValidator<T> {
  return (value: T): ValidationResult<T> => {
    const errors: string[] = [];
    let isValid = true;

    for (const validator of validators) {
      const result = validator(value);
      if (!result.isValid) {
        isValid = false;
        errors.push(...result.errors);
      }
    }

    return {
      isValid,
      errors,
      data: isValid ? value : undefined,
    };
  };
}

// Form validation schema
export type ValidationSchema<T extends Record<string, unknown>> = {
  readonly [K in keyof T]: FieldValidator<T[K]>;
};

export type ValidationErrors<T extends Record<string, unknown>> = {
  readonly [K in keyof T]?: readonly string[];
};

// Validate entire form object
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  schema: ValidationSchema<T>
): { isValid: boolean; errors: ValidationErrors<T>; validData?: T } {
  const errors: Record<string, string[]> = {};
  const validData: Record<string, unknown> = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(schema) as [keyof T, FieldValidator<T[keyof T]>][]) {
    const result = validator(data[field]);
    if (!result.isValid) {
      errors[field as string] = [...result.errors];
      isValid = false;
    } else {
      validData[field as string] = result.data;
    }
  }

  return {
    isValid,
    errors: errors as ValidationErrors<T>,
    validData: isValid ? (validData as T) : undefined,
  };
}

// Common validation schemas
export const commonSchemas = {
  contactInfo: {
    name: combineValidators(validators.required, validators.minLength(2)),
    email: combineValidators(validators.required, validators.email),
    phone: combineValidators(validators.required, validators.phone),
  },

  searchQuery: {
    query: validators.minLength(1),
  },

  booking: {
    date: validators.required,
    time: validators.required,
    message: validators.maxLength(500),
    contactInfo: validators.required,
  },
};

// Real-time field validation hook support
export interface FieldValidationState {
  readonly value: unknown;
  readonly errors: readonly string[];
  readonly touched: boolean;
  readonly isValid: boolean;
}

export function createFieldValidator<T>(
  validator: FieldValidator<T>
): (value: T, touched?: boolean) => FieldValidationState {
  return (value: T, touched = false): FieldValidationState => {
    const result = validator(value);
    return {
      value,
      errors: touched ? result.errors : [],
      touched,
      isValid: result.isValid,
    };
  };
}