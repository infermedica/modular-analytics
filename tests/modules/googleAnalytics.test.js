/* global __analytics */
let analyticModules;
const testString = 'test string';
document.body.innerHTML = '<script></script>';
window.ga = jest.fn();
beforeEach(() => {
  __analytics.googleAnalytics.isEnabled = true;
  jest.resetModules();
});

describe('module/googleAnalytics', () => {
  test('return [] when googleAnalytics is disabled', async () => {
    __analytics.googleAnalytics.isEnabled = false;
    analyticModules = await import('../../src/modules');
    expect(analyticModules).toEqual({ default: [] });
  });
  test('return correct track view with parametr', async () => {
    analyticModules = await import('../../src/modules');
    const { trackView } = analyticModules.default[0];
    trackView(testString);
    expect(window.ga).toHaveBeenCalledWith('send', 'pageview', testString);
  });
  test('return correct track view without parametr', async () => {
    analyticModules = await import('../../src/modules');
    const { trackView } = analyticModules.default[0];
    trackView();
    expect(window.ga).toHaveBeenCalledWith('send', 'pageview', window.location.pathname);
  });
  test('return correct track event', async () => {
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    trackEvent(testString);
    expect(window.ga).toHaveBeenCalledWith('send', 'event', { eventCategory: 'Event', eventAction: testString });
  });
});
