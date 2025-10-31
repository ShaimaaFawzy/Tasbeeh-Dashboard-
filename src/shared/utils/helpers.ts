/**
 * Helper Utilities
 *
 * Collection of utility functions used throughout the application.
 */

/**
 * Delays execution for a specified amount of time
 *
 * @param ms - Milliseconds to delay
 * @returns A promise that resolves after the specified delay
 *
 * @example
 * await delay(1000); // Wait for 1 second
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Safely parses JSON, returning null on error
 *
 * @param json - JSON string to parse
 * @returns Parsed object or null if parsing fails
 */
export const safeJsonParse = <T = unknown>(json: string): T | null => {
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object)
 *
 * @param value - Value to check
 * @returns True if the value is empty
 */
export const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

/**
 * Omits specified keys from an object
 *
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns New object without the specified keys
 *
 * @example
 * const user = { id: 1, name: 'John', password: 'secret' };
 * const safeUser = omit(user, ['password']);
 * // { id: 1, name: 'John' }
 */
export const omit = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

/**
 * Picks specified keys from an object
 *
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns New object with only the specified keys
 *
 * @example
 * const user = { id: 1, name: 'John', password: 'secret' };
 * const publicUser = pick(user, ['id', 'name']);
 * // { id: 1, name: 'John' }
 */
export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};
