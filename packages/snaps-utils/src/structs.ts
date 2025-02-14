import { isObject } from '@metamask/utils';
import { bold, green, red } from 'chalk';
import { resolve } from 'path';
import type { Failure } from 'superstruct';
import { Struct, StructError, create, string, coerce } from 'superstruct';
import type { AnyStruct } from 'superstruct/dist/utils';

import { indent } from './strings';

/**
 * Infer a struct type, only if it matches the specified type. This is useful
 * for defining types and structs that are related to each other in separate
 * files.
 *
 * @example
 * ```typescript
 * // In file A
 * export type GetFileArgs = {
 *   path: string;
 *   encoding?: EnumToUnion<AuxiliaryFileEncoding>;
 * };
 *
 * // In file B
 * export const GetFileArgsStruct = object(...);
 *
 * // If the type and struct are in the same file, this will return the type.
 * // Otherwise, it will return `never`.
 * export type GetFileArgs =
 *   InferMatching<typeof GetFileArgsStruct, GetFileArgs>;
 * ```
 */
export type InferMatching<
  StructType extends Struct<any, any>,
  Type,
> = StructType['TYPE'] extends Type ? Type : never;

/**
 * A wrapper of `superstruct`'s `string` struct that coerces a value to a string
 * and resolves it relative to the current working directory. This is useful
 * for specifying file paths in a configuration file, as it allows the user to
 * use both relative and absolute paths.
 *
 * @returns The `superstruct` struct, which validates that the value is a
 * string, and resolves it relative to the current working directory.
 * @example
 * ```ts
 * const config = struct({
 *   file: file(),
 *   // ...
 * });
 *
 * const value = create({ file: 'path/to/file' }, config);
 * console.log(value.file); // /process/cwd/path/to/file
 * ```
 */
export function file() {
  return coerce(string(), string(), (value) => {
    return resolve(process.cwd(), value);
  });
}

/**
 * Define a struct, and also define the name of the struct as the given name.
 *
 * This is useful for improving the error messages returned by `superstruct`.
 *
 * @param name - The name of the struct.
 * @param struct - The struct.
 * @returns The struct.
 */
export function named<Type, Schema>(
  name: string,
  struct: Struct<Type, Schema>,
) {
  return new Struct({
    ...struct,
    type: name,
  });
}

export class SnapsStructError<Type, Schema> extends StructError {
  constructor(
    struct: Struct<Type, Schema>,
    prefix: string,
    suffix: string,
    failure: StructError,
    failures: () => Generator<Failure>,
  ) {
    super(failure, failures);

    this.name = 'SnapsStructError';
    this.message = `${prefix}.\n\n${getStructErrorMessage(struct, [
      ...failures(),
    ])}${suffix ? `\n\n${suffix}` : ''}`;
  }
}

type GetErrorOptions<Type, Schema> = {
  struct: Struct<Type, Schema>;
  prefix: string;
  suffix?: string;
  error: StructError;
};

/**
 * Converts an array to a generator function that yields the items in the
 * array.
 *
 * @param array - The array.
 * @returns A generator function.
 * @yields The items in the array.
 */
export function* arrayToGenerator<Type>(
  array: Type[],
): Generator<Type, void, undefined> {
  for (const item of array) {
    yield item;
  }
}

/**
 * Returns a `SnapsStructError` with the given prefix and suffix.
 *
 * @param options - The options.
 * @param options.struct - The struct that caused the error.
 * @param options.prefix - The prefix to add to the error message.
 * @param options.suffix - The suffix to add to the error message. Defaults to
 * an empty string.
 * @param options.error - The `superstruct` error to wrap.
 * @returns The `SnapsStructError`.
 */
export function getError<Type, Schema>({
  struct,
  prefix,
  suffix = '',
  error,
}: GetErrorOptions<Type, Schema>) {
  return new SnapsStructError(struct, prefix, suffix, error, () =>
    arrayToGenerator(error.failures()),
  );
}

/**
 * A wrapper of `superstruct`'s `create` function that throws a
 * `SnapsStructError` instead of a `StructError`. This is useful for improving
 * the error messages returned by `superstruct`.
 *
 * @param value - The value to validate.
 * @param struct - The `superstruct` struct to validate the value against.
 * @param prefix - The prefix to add to the error message.
 * @param suffix - The suffix to add to the error message. Defaults to an empty
 * string.
 * @returns The validated value.
 */
export function createFromStruct<Type, Schema>(
  value: unknown,
  struct: Struct<Type, Schema>,
  prefix: string,
  suffix = '',
) {
  try {
    return create(value, struct);
  } catch (error) {
    if (error instanceof StructError) {
      throw getError({ struct, prefix, suffix, error });
    }

    throw error;
  }
}

/**
 * Get a struct from a failure path.
 *
 * @param struct - The struct.
 * @param path - The failure path.
 * @returns The struct at the failure path.
 */
export function getStructFromPath<Type, Schema>(
  struct: Struct<Type, Schema>,
  path: string[],
) {
  return path.reduce<AnyStruct>((result, key) => {
    if (isObject(struct.schema) && struct.schema[key]) {
      return struct.schema[key] as AnyStruct;
    }

    return result;
  }, struct);
}

/**
 * Get the union struct names from a struct.
 *
 * @param struct - The struct.
 * @returns The union struct names, or `null` if the struct is not a union
 * struct.
 */
export function getUnionStructNames<Type, Schema>(
  struct: Struct<Type, Schema>,
) {
  if (Array.isArray(struct.schema)) {
    return struct.schema.map(({ type }) => green(type));
  }

  return null;
}

/**
 * Get a error prefix from a `superstruct` failure. This is useful for
 * formatting the error message returned by `superstruct`.
 *
 * @param failure - The `superstruct` failure.
 * @returns The error prefix.
 */
export function getStructErrorPrefix(failure: Failure) {
  if (failure.type === 'never' || failure.path.length === 0) {
    return '';
  }

  return `At path: ${bold(failure.path.join('.'))} — `;
}

/**
 * Get a string describing the failure. This is similar to the `message`
 * property of `superstruct`'s `Failure` type, but formats the value in a more
 * readable way.
 *
 * @param struct - The struct that caused the failure.
 * @param failure - The `superstruct` failure.
 * @returns A string describing the failure.
 */
export function getStructFailureMessage<Type, Schema>(
  struct: Struct<Type, Schema>,
  failure: Failure,
) {
  const received = red(JSON.stringify(failure.value));
  const prefix = getStructErrorPrefix(failure);

  if (failure.type === 'union') {
    const childStruct = getStructFromPath(struct, failure.path);
    const unionNames = getUnionStructNames(childStruct);

    if (unionNames) {
      return `${prefix}Expected the value to be one of: ${unionNames.join(
        ', ',
      )}, but received: ${received}.`;
    }

    return `${prefix}${failure.message}.`;
  }

  if (failure.type === 'literal') {
    // Superstruct's failure does not provide information about which literal
    // value was expected, so we need to parse the message to get the literal.
    const message = failure.message
      .replace(/the literal `(.+)`,/u, `the value to be \`${green('$1')}\`,`)
      .replace(/, but received: (.+)/u, `, but received: ${red('$1')}`);

    return `${prefix}${message}.`;
  }

  if (failure.type === 'never') {
    return `Unknown key: ${bold(
      failure.path.join('.'),
    )}, received: ${received}.`;
  }

  return `${prefix}Expected a value of type ${green(
    failure.type,
  )}, but received: ${received}.`;
}

/**
 * Get a string describing the errors. This formats all the errors in a
 * human-readable way.
 *
 * @param struct - The struct that caused the failures.
 * @param failures - The `superstruct` failures.
 * @returns A string describing the errors.
 */
export function getStructErrorMessage<Type, Schema>(
  struct: Struct<Type, Schema>,
  failures: Failure[],
) {
  const formattedFailures = failures.map((failure) =>
    indent(`• ${getStructFailureMessage(struct, failure)}`),
  );

  return formattedFailures.join('\n');
}
