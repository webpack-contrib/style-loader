function getTestId(testId, injectType) {
  const isLazy = injectType && injectType.toLowerCase().includes('lazy');

  return `./${isLazy ? 'lazy-' : ''}${testId}`;
}

export default getTestId;
