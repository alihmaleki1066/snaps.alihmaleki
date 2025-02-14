import { panel, text } from '@metamask/snaps-sdk';

import { validateTextLinks, validateComponentLinks } from './ui';

describe('validateTextLinks', () => {
  it('passes for valid links', () => {
    expect(() =>
      validateTextLinks('[test](https://foo.bar)', () => false),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('[test](mailto:foo@bar.baz)', () => false),
    ).not.toThrow();

    expect(() =>
      validateTextLinks('[](https://foo.bar)', () => false),
    ).not.toThrow();
  });

  it('throws an error if an invalid link is found in text', () => {
    expect(() =>
      validateTextLinks('[test](http://foo.bar)', () => false),
    ).toThrow('Invalid URL: Protocol must be one of: https:, mailto:.');

    expect(() => validateTextLinks('[test](foo.bar)', () => false)).toThrow(
      'Invalid URL: Unable to parse URL.',
    );
  });
});

describe('validateComponentLinks', () => {
  it('does not throw for a safe text component', async () => {
    const isOnPhishingList = () => false;

    expect(() =>
      validateComponentLinks(
        text('[foobar](https://foo.bar)'),
        isOnPhishingList,
      ),
    ).not.toThrow();

    expect(() =>
      validateComponentLinks(
        panel([text('foobar'), text('[foobar](https://foo.bar)')]),
        isOnPhishingList,
      ),
    ).not.toThrow();
  });

  it('throws for an unsafe text component', async () => {
    const isOnPhishingList = () => true;

    expect(() =>
      validateComponentLinks(
        text('This tests a [link](https://foo.bar)'),
        isOnPhishingList,
      ),
    ).toThrow('Invalid URL: The specified URL is not allowed.');

    expect(() =>
      validateComponentLinks(
        panel([text('foobar'), text('This tests a [link](https://foo.bar)')]),
        isOnPhishingList,
      ),
    ).toThrow('Invalid URL: The specified URL is not allowed.');
  });
});
