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

  expect(() =>
    validate({
      // eslint-disable-next-line no-undef
      insert: (element) => document.querySelector('#root').appendChild(element),
    })
  ).not.toThrow();
  expect(() => validate({ insert: 'test' })).not.toThrow();
  expect(() => validate({ insert: true })).toThrowErrorMatchingSnapshot();

  expect(() => validate({ unknown: 'unknown' })).toThrowErrorMatchingSnapshot();
});
