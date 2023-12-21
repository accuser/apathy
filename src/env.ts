import { env } from "node:process";

/**
 * Default host name.
 */
export const DEFAULT_HOST = from(env["HOST"], "localhost");

/**
 * Default port number.
 */
export const DEFAULT_PORT = from(env["PORT"], 3000);

/**
 * Apply a default value to a given value.
 *
 * @private
 * @param value
 * @param defaultValue
 * @returns the original value, or the default value
 */
function from<T = string>(
	value: string | undefined,
	defaultValue?: T
): T | undefined {
	if (defaultValue === undefined) {
		return value as T;
	} else if (typeof defaultValue === "number") {
		return Number.isNaN(Number(value)) ? defaultValue : (Number(value) as T);
	} else if (typeof defaultValue === "boolean") {
		return value === undefined ? defaultValue : (Boolean(value) as T);
	} else {
		return value ? (value as T) : defaultValue;
	}
}
