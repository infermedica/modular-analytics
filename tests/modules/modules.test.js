/* global __analytics */
let analyticModules;
document.body.innerHTML = '<script></script>';
beforeEach(() => {
  jest.resetModules();
});

describe('modules', () => {
  test('return [] when all modules are disabled', async () => {
    analyticModules = await import('../../src/modules');
    expect(analyticModules.default.length).toBe(0);
  });
  test('return googleAnalytics when googleTagManager is disabled', async () => {
    __analytics.googleTagManager.isEnabled = false;
    __analytics.googleAnalytics.isEnabled = true;
    analyticModules = await import('../../src/modules');
    const googleTagManager = analyticModules.default.find((moduleName) => moduleName.name === 'googleTagManager');
    const googleAnalytics = analyticModules.default.find((moduleName) => moduleName.name === 'googleAnalytics');
    expect(googleTagManager).toBeFalsy();
    expect(googleAnalytics).toBeTruthy();
  });
  test('without returning googleAnalytics after enabling googleTagManager', async () => {
    __analytics.googleTagManager.isEnabled = true;
    __analytics.googleAnalytics.isEnabled = true;
    analyticModules = await import('../../src/modules');
    const googleTagManager = analyticModules.default.find((moduleName) => moduleName.name === 'googleTagManager');
    const googleAnalytics = analyticModules.default.find((moduleName) => moduleName.name === 'googleAnalytics');
    expect(googleTagManager).toBeTruthy();
    expect(googleAnalytics).toBeFalsy();
  });
  test('return only enabled modules', async () => {
    __analytics.debug.isEnabled = true;
    __analytics.googleAnalytics.isEnabled = true;
    analyticModules = await import('../../src/modules');
    expect(analyticModules.default.length).toBe(2);
  });
  test('return four modules when all are enabled', async () => {
    Object.keys(__analytics).forEach((singleModule) => {
      __analytics[singleModule].isEnabled = true;
    });
    analyticModules = await import('../../src/modules');
    expect(analyticModules.default.length).toBe(4);
  });
});
