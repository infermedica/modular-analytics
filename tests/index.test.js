/* global __analytics */
document.body.innerHTML = '<script></script>';
let analytics;
let analyticsModules;
const testStr = 'test';
const testObj = { test: 'test' };
const moduleNames = ['amplitude', 'debug', 'googleTagManager', 'infermedicaAnalytics'];
Object.keys(__analytics).forEach((singleModule) => {
  __analytics[singleModule].isEnabled = true;
});

beforeEach(async () => {
  jest.resetModules();
  analyticsModules = await import('../src/modules');
  analytics = await import('../src/index');
  analyticsModules.default.forEach((singleModule) => {
    Object.keys(singleModule).forEach((key) => {
      if (key === 'name') return;
      jest.spyOn(singleModule, key);
    });
  });
});

describe('analytics function', () => {
  describe.each(['trackEvent', 'trackView'])('trackView and trackEvent function', (fn) => {
    test(`${fn} - run all modules`, () => {
      analytics.Analytics[fn](testStr, testObj, moduleNames);
      analyticsModules.default.forEach((singleModule) => {
        if (singleModule[fn]) {
          expect(singleModule[fn]).toHaveBeenCalledWith(testStr, testObj);
        }
      });
    });
    test(`${fn} - run only passed modules`, () => {
      analytics.Analytics[fn](testStr, testObj, ['debug', 'amplitude']);
      analyticsModules.default.forEach((singleModule) => {
        if (singleModule[fn]) {
          const isCalled = singleModule.name !== 'googleTagManager' && singleModule.name !== 'infermedicaAnalytics';
          // eslint-disable-next-line no-unused-expressions
          isCalled
            ? expect(singleModule[fn]).toHaveBeenCalledWith(testStr, testObj)
            : expect(singleModule[fn]).not.toHaveBeenCalled();
        }
      });
    });
    test(`${fn} - with setGlobalProperties as string, run all modules`, () => {
      analytics.Analytics.setGlobalProperties('global', 'asString');
      analytics.Analytics[fn](testStr, testObj, moduleNames);
      analyticsModules.default.forEach((singleModule) => {
        if (singleModule[fn]) {
          expect(singleModule[fn]).toHaveBeenCalledWith(testStr, { global: 'asString', ...testObj });
        }
      });
    });
    test(`${fn} - with setGlobalProperties as object, run all modules`, () => {
      analytics.Analytics.setGlobalProperties({ global: 'asObject' });
      analytics.Analytics[fn](testStr, testObj, moduleNames);
      analyticsModules.default.forEach((singleModule) => {
        if (singleModule[fn]) {
          expect(singleModule[fn]).toHaveBeenCalledWith(testStr, { global: 'asObject', ...testObj });
        }
      });
    });
  });
  describe.each(['initialize', 'trackConversion'])('initialize and trackConversion function', (fn) => {
    test(`${fn} - run all modules without params`, () => {
      analytics.Analytics[fn]();
      analyticsModules.default.forEach((singleModule) => {
        if (singleModule[fn]) {
          expect(singleModule[fn]).toHaveBeenCalled();
        }
      });
    });
    test(`${fn} - run all modules with params`, () => {
      analytics.Analytics[fn](testObj);
      analyticsModules.default.forEach((singleModule) => {
        if (singleModule[fn]) {
          expect(singleModule[fn]).toHaveBeenCalledWith(testObj);
        }
      });
    });
  });
  test('Vue Analytics - add $analytics to vue prototype', () => {
    const vueInstance = { prototype: {} };
    analytics.VueAnalytics.install(vueInstance);
    expect(vueInstance.prototype.$analytics).toEqual(analytics.Analytics);
  });
});
