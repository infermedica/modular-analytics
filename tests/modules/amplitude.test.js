/* global __analytics */
let analyticModules;
const testString = 'test string';
const testProperties = { test: 'test', test2: 'test2', test3: 'test3' };
document.body.innerHTML = '<script></script>';
beforeEach(() => {
  __analytics.amplitude.isEnabled = true;
  jest.resetModules();
});

describe('module/googleTagManager', () => {
  test('googleTagManager is disabled', async () => {
    __analytics.amplitude.isEnabled = false;
    analyticModules = await import('../../src/modules');
    expect(analyticModules).toEqual({ default: [] });
  });
  test('return correct name', async () => {
    analyticModules = await import('../../src/modules');
    const { name } = analyticModules.default[0];
    expect(name).toBe('amplitude');
  });
  test('return correct track view', async () => {
    analyticModules = await import('../../src/modules');
    const { trackView } = analyticModules.default[0];
    window.amplitude.getInstance().logEvent = jest.fn();
    trackView(testString);
    expect(window.amplitude.getInstance().logEvent).toHaveBeenCalledWith('Page Viewed', { page: testString });
  });
  test('return correct track event', async () => {
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    window.amplitude.getInstance().logEvent = jest.fn();
    trackEvent(testString, testProperties);
    expect(window.amplitude.getInstance().logEvent).toHaveBeenCalledWith(testString, testProperties);
  });
  test('return correct track event with dissalow properties', async () => {
    __analytics.amplitude.disallowProperties = ['test2'];
    __analytics.amplitude.allowProperties = [];
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    window.amplitude.getInstance().logEvent = jest.fn();
    trackEvent(testString, testProperties);
    expect(window.amplitude.getInstance().logEvent).toHaveBeenCalledWith(testString, { test: 'test', test3: 'test3' });
  });
  test('return correct track event with allow properties', async () => {
    __analytics.amplitude.disallowProperties = [];
    __analytics.amplitude.allowProperties = ['test2', 'test3'];
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    window.amplitude.getInstance().logEvent = jest.fn();
    trackEvent(testString, testProperties);
    expect(window.amplitude.getInstance().logEvent).toHaveBeenCalledWith(testString, { test2: 'test2', test3: 'test3' });
  });
});
