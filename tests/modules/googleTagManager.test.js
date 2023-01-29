/* global __analytics */
let analyticModules;
const testString = 'test string';
document.body.innerHTML = '<script></script>';
beforeEach(() => {
  __analytics.googleTagManager.isEnabled = true;
  jest.resetModules();
});

describe('module/googleTagManager', () => {
  test('return [] when googleTagManager is disabled', async () => {
    __analytics.googleTagManager.isEnabled = false;
    analyticModules = await import('../../src/modules');
    expect(analyticModules).toEqual({ default: [] });
  });
  test('return correct track view', async () => {
    analyticModules = await import('../../src/modules');
    const { trackView } = analyticModules.default[0];
    window.gtag = jest.fn();
    trackView();
    expect(window.gtag).toHaveBeenCalledWith('event', 'page_view');
  });
  test('return correct track event', async () => {
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    window.gtag = jest.fn();
    trackEvent(testString);
    expect(window.gtag).toHaveBeenCalledWith('event', testString, { event_category: 'Event' });
  });
  test('return correct track conversion with disabled googleAdWords', async () => {
    __analytics.googleAdWords.isEnabled = false;
    analyticModules = await import('../../src/modules');
    const { trackConversion } = analyticModules.default[0];
    window.gtag = jest.fn();
    trackConversion();
    expect(window.gtag).not.toHaveBeenCalled();
  });
  test('return correct track conversion with enabled googleAdWords', async () => {
    __analytics.googleAdWords.isEnabled = true;
    analyticModules = await import('../../src/modules');
    const { trackConversion } = analyticModules.default[0];
    window.gtag = jest.fn();
    trackConversion(testString);
    expect(window.gtag)
      .toHaveBeenCalledWith(
        'event',
        'conversion',
        { send_to: `${__analytics.googleAdWords.key}/${testString}` },
      );
  });
});
