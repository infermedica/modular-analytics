/* global __analytics */
let analyticModules;
const logSpy = jest.spyOn(console, 'log');
beforeEach(() => {
  jest.resetModules();
});

describe('module/dubug', () => {
  test('return [] when debug is disabled', async () => {
    analyticModules = await import('../../src/modules');
    expect(analyticModules).toEqual({ default: [] });
  });
  test('return correct track view', async () => {
    __analytics.debug.isEnabled = true;
    analyticModules = await import('../../src/modules');
    const { trackView } = analyticModules.default[0];
    trackView('test');
    expect(logSpy).toHaveBeenCalledWith('Analytics (trackView):', 'test');
  });
  test('return correct track event', async () => {
    __analytics.debug.isEnabled = true;
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    trackEvent('eventName', { test: 'test' });
    expect(logSpy).toHaveBeenCalledWith('Analytics (trackEvent):', 'eventName', { test: 'test' });
  });
});
