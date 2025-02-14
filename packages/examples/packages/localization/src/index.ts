import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';

import { getMessage } from './locales';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `hello`: Responds with "Hello, world!", localized to the user's locale.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'hello':
      return await getMessage('hello');

    default:
      throw rpcErrors.methodNotFound({
        data: { method: request.method },
      });
  }
};
