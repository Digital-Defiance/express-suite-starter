/**
 * Branded enum version of StarterStringKey for runtime-identifiable string keys
 *
 * This module provides the branded enum version of StarterStringKey,
 * enabling runtime identification of string key sources and collision detection.
 *
 * @module branded-starter-string-key
 */

import {
  createI18nStringKeysFromEnum,
  BrandedStringKeyValue,
} from '@digitaldefiance/i18n-lib';
import { StarterStringKey } from './starter-string-key';

/**
 * Branded enum version of StarterStringKey
 *
 * Provides runtime identification, allowing you to:
 * - Detect which component a string key belongs to
 * - Find collisions between components
 * - Route translations to the correct handler
 *
 * @example
 * ```typescript
 * import { StarterStringKeys, findStringKeySources } from '@digitaldefiance/express-suite-starter';
 *
 * // Use keys directly
 * const key = StarterStringKeys.CLI_BANNER; // 'cli_banner'
 *
 * // Find which component owns a key
 * findStringKeySources('cli_banner'); // ['i18n:express-suite-starter']
 * ```
 */
export const StarterStringKeys = createI18nStringKeysFromEnum(
  'express-suite-starter',
  StarterStringKey,
);

/**
 * Type for starter string key values from the branded enum
 */
export type StarterStringKeyValue = BrandedStringKeyValue<
  typeof StarterStringKeys
>;

/**
 * Component ID for the express-suite-starter component
 */
export const STARTER_COMPONENT_ID = 'express-suite-starter';
