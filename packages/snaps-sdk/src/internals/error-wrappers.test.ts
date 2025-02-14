import { rpcErrors } from '@metamask/rpc-errors';

import { SnapError } from '../errors';
import { createSnapError } from './error-wrappers';

describe('createSnapError', () => {
  it('creates a SnapError from an rpc-errors function', () => {
    const Constructor = createSnapError(rpcErrors.invalidParams);
    const error = new Constructor('foo');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(SnapError);
    expect(error.message).toBe('foo');
    expect(error.code).toBe(-32602);
    expect(error.data).toStrictEqual({});
    expect(error.stack).toBeDefined();
    expect(error.toJSON()).toStrictEqual({
      code: -31002,
      message: 'Snap Error',
      data: {
        cause: {
          code: -32602,
          message: 'foo',
          stack: error.stack,
          data: {},
        },
      },
    });
  });
});
