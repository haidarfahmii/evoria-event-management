"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Type for URL state hook return value
 */
export interface UseUrlStateReturn {
  getParam: (key: string, defaultValue?: string) => string;
  getParamAsNumber: (key: string, defaultValue?: number) => number;
  setParam: (key: string, value: string | null) => void;
  setParams: (updates: Record<string, string | null>) => void;
  deleteParam: (key: string) => void;
  clearParams: () => void;
  getAllParams: () => Record<string, string>;
}

export function useUrlState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * Get a URL parameter value
   *
   * @param key - The parameter key
   * @param defaultValue - Default value if parameter doesn't exist
   * @returns The parameter value or default value
   *
   * @example
   * ```typescript
   * const search = getParam('search', '');
   * const page = getParam('page', '1');
   * ```
   */
  const getParam = useCallback(
    (key: string, defaultValue: string = ""): string => {
      return searchParams.get(key) || defaultValue;
    },
    [searchParams]
  );

  /**
   * Get a URL parameter as number
   *
   * @param key - The parameter key
   * @param defaultValue - Default value if parameter doesn't exist
   * @returns The parameter value as number or default value
   *
   * @example
   * ```typescript
   * const page = getParamAsNumber('page', 1);
   * const limit = getParamAsNumber('limit', 10);
   * ```
   */
  const getParamAsNumber = useCallback(
    (key: string, defaultValue: number = 0): number => {
      const value = searchParams.get(key);
      if (!value) return defaultValue;
      const parsed = parseInt(value, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    },
    [searchParams]
  );

  /**
   * Set a single URL parameter
   *
   * @param key - The parameter key
   * @param value - The parameter value (empty string or null to remove)
   *
   * @example
   * ```typescript
   * setParam('search', 'music');  // Add/update
   * setParam('search', '');       // Remove
   * ```
   */
  const setParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.push(newUrl, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Set multiple URL parameters at once
   *
   * @param updates - Object with key-value pairs to update
   *
   * @example
   * ```typescript
   * setParams({
   *   search: 'music',
   *   category: 'Concert',
   *   page: '1'
   * });
   * ```
   */
  const setParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([Key, value]) => {
        if (value && value !== "") {
          params.set(Key, value);
        } else {
          params.delete(Key);
        }
      });

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.push(newUrl, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Delete a URL parameter
   *
   * @param key - The parameter key to delete
   *
   * @example
   * ```typescript
   * deleteParam('search');
   * ```
   */
  const deleteParam = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      router.push(newUrl, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  /**
   * Clear all URL parameters
   *
   * @example
   * ```typescript
   * clearParams(); // URL becomes /current-page (no query string)
   * ```
   */
  const clearParams = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  /**
   * Get all URL parameters as an object
   *
   * @returns Object with all URL parameters
   *
   * @example
   * ```typescript
   * const allParams = getAllParams();
   * // { search: 'music', category: 'Concert', page: '1' }
   * ```
   */
  const getAllParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  return {
    getParam,
    getParamAsNumber,
    setParam,
    setParams,
    deleteParam,
    clearParams,
    getAllParams,
  };
}

export default useUrlState;
