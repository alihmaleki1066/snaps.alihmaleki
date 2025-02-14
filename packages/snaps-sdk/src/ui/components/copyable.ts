import {
  assign,
  boolean,
  literal,
  object,
  optional,
  string,
} from 'superstruct';

import { createBuilder } from '../builder';
import { LiteralStruct, NodeType } from '../nodes';
import type { Literal } from '../nodes';

/**
 * Text that can be copied to the clipboard. It can optionally be marked as
 * sensitive, in which case it will only be displayed to the user after clicking
 * on the component.
 *
 * @property type - The type of the node. Must be the string `copyable`.
 * @property value - The text to be copied.
 * @property sensitive - Whether the value is sensitive or not. Sensitive values
 * are only displayed to the user after clicking on the component. Defaults to
 * false.
 */
export type Copyable = Literal & {
  type: NodeType.Copyable;
  value: string;
};

export const CopyableStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Copyable),
    value: string(),
    sensitive: optional(boolean()),
  }),
);

/**
 * Create a {@link Copyable} component.
 *
 * @param args - The node arguments. This can either be a string, or an object
 * with the `text` property.
 * @param args.value - The text to be copied.
 * @param args.sensitive - Whether the value is sensitive or not. Sensitive
 * values are only displayed to the user after clicking on the component.
 * Defaults to false.
 * @returns A {@link Copyable} component.
 * @example
 * const node = copyable('Hello, world!');
 * const node = copyable({ value: 'Hello, world!' });
 */
export const copyable = createBuilder(NodeType.Copyable, CopyableStruct, [
  'value',
  'sensitive',
]);
