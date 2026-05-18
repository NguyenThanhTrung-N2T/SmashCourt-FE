/**
 * Input Validation Utilities
 * 
 * Provides reusable validation rules and handlers for form inputs
 */

export type ValidationRule = (value: string) => boolean;

/**
 * Validation Rules
 */
export const ValidationRules = {
  /**
   * Allow only numeric characters (0-9)
   */
  numberOnly: (value: string): boolean => {
    return /^\d*$/.test(value);
  },

  /**
   * Allow only decimal numbers (0-9 and one decimal point)
   */
  decimalOnly: (value: string): boolean => {
    return /^\d*\.?\d*$/.test(value);
  },

  /**
   * Allow only alphabetic characters (a-z, A-Z)
   */
  textOnly: (value: string): boolean => {
    return /^[a-zA-Z]*$/.test(value);
  },

  /**
   * Allow only alphanumeric characters (a-z, A-Z, 0-9)
   */
  alphanumericOnly: (value: string): boolean => {
    return /^[a-zA-Z0-9]*$/.test(value);
  },

  /**
   * Allow alphanumeric with spaces
   */
  alphanumericWithSpaces: (value: string): boolean => {
    return /^[a-zA-Z0-9\s]*$/.test(value);
  },

  /**
   * Allow email format characters
   */
  emailFormat: (value: string): boolean => {
    return /^[a-zA-Z0-9@._+-]*$/.test(value);
  },

  /**
   * Allow phone number characters (digits, +, -, spaces, parentheses)
   */
  phoneFormat: (value: string): boolean => {
    return /^[\d\s+()-]*$/.test(value);
  },

  /**
   * Allow Vietnamese text (including diacritics) and spaces
   */
  vietnameseText: (value: string): boolean => {
    return /^[\p{L}\s]*$/u.test(value);
  },

  /**
   * Allow Vietnamese text with numbers and spaces
   */
  vietnameseTextWithNumbers: (value: string): boolean => {
    return /^[\p{L}\p{N}\s]*$/u.test(value);
  },

  /**
   * Allow code format (alphanumeric, uppercase, underscores, hyphens)
   */
  codeFormat: (value: string): boolean => {
    return /^[A-Z0-9_-]*$/.test(value);
  },

  /**
   * Allow positive integers only
   */
  positiveInteger: (value: string): boolean => {
    if (value === '') return true;
    return /^\d+$/.test(value) && parseInt(value, 10) > 0;
  },

  /**
   * Allow non-negative integers (including 0)
   */
  nonNegativeInteger: (value: string): boolean => {
    return /^\d*$/.test(value);
  },

  /**
   * Allow positive decimal numbers
   */
  positiveDecimal: (value: string): boolean => {
    if (value === '') return true;
    return /^\d*\.?\d*$/.test(value) && parseFloat(value) > 0;
  },

  /**
   * Allow percentage (0-100)
   */
  percentage: (value: string): boolean => {
    if (value === '') return true;
    const num = parseFloat(value);
    return /^\d*\.?\d*$/.test(value) && num >= 0 && num <= 100;
  },

  /**
   * Allow URL-safe characters
   */
  urlSafe: (value: string): boolean => {
    return /^[a-zA-Z0-9-._~:/?#[\]@!$&'()*+,;=]*$/.test(value);
  },

  /**
   * Allow time format (HH:MM)
   */
  timeFormat: (value: string): boolean => {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value) || value === '';
  },

  /**
   * Allow date format (YYYY-MM-DD)
   */
  dateFormat: (value: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) || value === '';
  },
};

/**
 * Input Change Handler Factory
 * Creates an onChange handler that validates input before updating state
 * 
 * @param setValue - State setter function
 * @param rule - Validation rule to apply
 * @returns onChange handler function
 * 
 * @example
 * const handleChange = createValidatedChangeHandler(setPhoneNumber, ValidationRules.phoneFormat);
 * <input onChange={handleChange} />
 */
export const createValidatedChangeHandler = (
  setValue: (value: string) => void,
  rule: ValidationRule
) => {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nativeEvent = e.nativeEvent as InputEvent;

    // Skip validation during IME composition
    if (nativeEvent.isComposing) {
      setValue(e.target.value);
      return;
    }

    const newValue = e.target.value;

    if (rule(newValue)) {
      setValue(newValue);
    }
  };
};

/**
 * Numeric Input Handler Factory
 * Creates an onChange handler for numeric inputs with optional min/max constraints
 * 
 * @param setValue - State setter function
 * @param options - Configuration options
 * @returns onChange handler function
 * 
 * @example
 * const handleChange = createNumericChangeHandler(setAge, { min: 0, max: 120, allowDecimal: false });
 * <input type="number" onChange={handleChange} />
 */
export const createNumericChangeHandler = (
  setValue: (value: string) => void,
  options?: {
    min?: number;
    max?: number;
    allowDecimal?: boolean;
    allowNegative?: boolean;
  }
) => {
  const { min, max, allowDecimal = true, allowNegative = false } = options || {};

  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let newValue = e.target.value;

    // Allow empty string
    if (newValue === '') {
      setValue(newValue);
      return;
    }

    // Validate format
    const decimalPattern = allowDecimal ? /^-?\d*\.?\d*$/ : /^-?\d*$/;
    const positivePattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    const pattern = allowNegative ? decimalPattern : positivePattern;

    if (!pattern.test(newValue)) {
      return;
    }

    // Check min/max constraints
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) {
        return;
      }
      if (max !== undefined && numValue > max) {
        return;
      }
    }

    setValue(newValue);
  };
};

/**
 * Format number with thousand separators
 * 
 * @param value - Number or string to format
 * @returns Formatted string with thousand separators
 * 
 * @example
 * formatNumberWithSeparator(1000000) // "1,000,000"
 */
export const formatNumberWithSeparator = (value: string | number): string => {
  const numStr = typeof value === 'number' ? value.toString() : value;
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Remove thousand separators from formatted number
 * 
 * @param value - Formatted number string
 * @returns Plain number string
 * 
 * @example
 * removeNumberSeparator("1,000,000") // "1000000"
 */
export const removeNumberSeparator = (value: string): string => {
  return value.replace(/,/g, '');
};

/**
 * Currency Input Handler Factory
 * Creates an onChange handler for currency inputs with thousand separators
 * 
 * @param setValue - State setter function for the raw value
 * @param setDisplayValue - State setter function for the formatted display value
 * @param options - Configuration options
 * @returns onChange handler function
 * 
 * @example
 * const [price, setPrice] = useState('');
 * const [displayPrice, setDisplayPrice] = useState('');
 * const handleChange = createCurrencyChangeHandler(setPrice, setDisplayPrice, { min: 0 });
 * <input value={displayPrice} onChange={handleChange} />
 */
export const createCurrencyChangeHandler = (
  setValue: (value: string) => void,
  setDisplayValue: (value: string) => void,
  options?: {
    min?: number;
    max?: number;
  }
) => {
  const { min, max } = options || {};

  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const inputValue = e.target.value;
    const rawValue = removeNumberSeparator(inputValue);

    // Allow empty string
    if (rawValue === '') {
      setValue('');
      setDisplayValue('');
      return;
    }

    // Validate numeric format
    if (!/^\d*$/.test(rawValue)) {
      return;
    }

    // Check constraints
    const numValue = parseInt(rawValue, 10);
    if (!isNaN(numValue)) {
      if (min !== undefined && numValue < min) {
        return;
      }
      if (max !== undefined && numValue > max) {
        return;
      }
    }

    setValue(rawValue);
    setDisplayValue(formatNumberWithSeparator(rawValue));
  };
};

/**
 * Trim whitespace on blur
 * 
 * @param setValue - State setter function
 * @returns onBlur handler function
 * 
 * @example
 * const handleBlur = createTrimOnBlurHandler(setName);
 * <input onBlur={handleBlur} />
 */
export const createTrimOnBlurHandler = (setValue: (value: string) => void) => {
  return (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value.trim());
  };
};

/**
 * Uppercase transformation handler
 * 
 * @param setValue - State setter function
 * @returns onChange handler function
 * 
 * @example
 * const handleChange = createUppercaseHandler(setCode);
 * <input onChange={handleChange} />
 */
export const createUppercaseHandler = (setValue: (value: string) => void) => {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value.toUpperCase());
  };
};

/**
 * Lowercase transformation handler
 * 
 * @param setValue - State setter function
 * @returns onChange handler function
 * 
 * @example
 * const handleChange = createLowercaseHandler(setEmail);
 * <input onChange={handleChange} />
 */
export const createLowercaseHandler = (setValue: (value: string) => void) => {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value.toLowerCase());
  };
};

/**
 * Combined validation and transformation handler
 * 
 * @param setValue - State setter function
 * @param rule - Validation rule
 * @param transform - Transformation function
 * @returns onChange handler function
 * 
 * @example
 * const handleChange = createValidatedTransformHandler(
 *   setCode,
 *   ValidationRules.alphanumericOnly,
 *   (v) => v.toUpperCase()
 * );
 * <input onChange={handleChange} />
 */
export const createValidatedTransformHandler = (
  setValue: (value: string) => void,
  rule: ValidationRule,
  transform: (value: string) => string
) => {
  return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (rule(newValue)) {
      setValue(transform(newValue));
    }
  };
};
