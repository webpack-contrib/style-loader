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

  expect(() => validate({ hmr: true })).not.toThrow();
  expect(() => validate({ hmr: false })).not.toThrow();
  expect(() => validate({ hmr: 'unknown' })).toThrowErrorMatchingSnapshot();

  expect(() => validate({ base: 1000 })).not.toThrow();
  expect(() => validate({ base: 'unknown' })).toThrowErrorMatchingSnapshot();

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

  expect(() => validate({ singleton: true })).not.toThrow();
  expect(() => validate({ singleton: false })).not.toThrow();
  expect(() =>
    validate({ singleton: 'unknown' })
  ).toThrowErrorMatchingSnapshot();

  expect(() => validate({ sourceMap: true })).not.toThrow();
  expect(() => validate({ sourceMap: false })).not.toThrow();
  expect(() =>
    validate({ sourceMap: 'unknown' })
  ).toThrowErrorMatchingSnapshot();

  expect(() => validate({ unknown: 'unknown' })).toThrowErrorMatchingSnapshot();
});
