import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { panel, text, row, address } from '@metamask/snaps-sdk';

describe('onTransaction', () => {
  const FROM_ADDRESS = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045';
  const TO_ADDRESS = '0x4bbeeb066ed09b7aed07bf39eee0460dfa261520';

  it('returns transaction insights for an ERC-20 transaction', async () => {
    const { sendTransaction, close } = await installSnap();

    const response = await sendTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      // This is not a valid ERC-20 transfer as all the values are zero, but it
      // is enough to test the `onTransaction` handler.
      data: '0xa9059cbb00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(response).toRender(
      panel([
        row('From', address(FROM_ADDRESS)),
        row('To', address(TO_ADDRESS)),
        row('Transaction type', text('ERC-20')),
      ]),
    );

    await close();
  });

  it('returns transaction insights for an ERC-721 transaction', async () => {
    const { sendTransaction, close } = await installSnap();

    const response = await sendTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      // This is not a valid ERC-721 transfer as all the values are zero, but it
      // is enough to test the `onTransaction` handler.
      data: '0x23b872dd00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(response).toRender(
      panel([
        row('From', address(FROM_ADDRESS)),
        row('To', address(TO_ADDRESS)),
        row('Transaction type', text('ERC-721')),
      ]),
    );

    await close();
  });

  it('returns transaction insights for an ERC-1155 transaction', async () => {
    const { sendTransaction, close } = await installSnap();

    const response = await sendTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      // This is not a valid ERC-1155 transfer as all the values are zero, but
      // it is enough to test the `onTransaction` handler.
      data: '0xf242432a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(response).toRender(
      panel([
        row('From', address(FROM_ADDRESS)),
        row('To', address(TO_ADDRESS)),
        row('Transaction type', text('ERC-1155')),
      ]),
    );

    await close();
  });

  it('returns transaction insights for an unknown transaction', async () => {
    const { sendTransaction, close } = await installSnap();

    const response = await sendTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      data: '0xabcdef1200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    });

    expect(response).toRender(
      panel([
        row('From', address(FROM_ADDRESS)),
        row('To', address(TO_ADDRESS)),
        row('Transaction type', text('Unknown')),
      ]),
    );

    await close();
  });

  it('returns transaction insights for a transaction with no data', async () => {
    const { sendTransaction, close } = await installSnap();

    const response = await sendTransaction({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      data: '0x',
    });

    expect(response).toRender(
      panel([
        row('From', address(FROM_ADDRESS)),
        row('To', address(TO_ADDRESS)),
        row('Transaction type', text('Unknown')),
      ]),
    );

    await close();
  });
});
