import loader from '../src/index';

it('validate options', () => {
  const validate = (options) =>
    loader.pitch.call(
      Object.assign(
        {},
        {
          query: options,
          loaders: [],
          remainingRequest: 'file.css',
          currentRequest: 'file.css',
          async: () => (error) => {
            if (error) {
              throw error;
            }
          },
        }
      ),
      'file.css'
    );

  expect(() => validate({ injectType: 'styleTag' })).not.toThrow();
  expect(() => validate({ injectType: 'singletonStyleTag' })).not.toThrow();
  expect(() => validate({ injectType: 'lazyStyleTag' })).not.toThrow();
  expect(() => validate({ injectType: 'lazySingletonStyleTag' })).not.toThrow();
  expect(() => validate({ injectType: 'linkTag' })).not.toThrow();
  expect(() =>
    validate({ injectType: 'unknown' })
  ).toThrowErrorMatchingSnapshot();

  expect(() => validate({ attributes: {} })).not.toThrow();
  expect(() => validate({ attributes: { id: 'id' } })).not.toThrow();
  expect(() => validate({ attributes: true })).toThrowErrorMatchingSnapshot();

  expect(() => validate({ insertAt: 'top' })).not.toThrow();
  expect(() =>
    validate({
      insertAt: {
        before: '#id',
      },
    })
  ).not.toThrow();
  expect(() => validate({ insertAt: true })).toThrowErrorMatchingSnapshot();

  expect(() =>
    // eslint-disable-next-line no-undef
    validate({ insertInto: () => document.querySelector('#root') })
  ).not.toThrow();
  expect(() => validate({ insertInto: 'test' })).not.toThrow();
  expect(() => validate({ insertInto: true })).toThrowErrorMatchingSnapshot();

  expect(() => validate({ unknown: 'unknown' })).toThrowErrorMatchingSnapshot();
});
