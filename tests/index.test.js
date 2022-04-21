/* global __analytics */
let analytics;
let analyticModules;
let mockedAnalyticModules;
let modulesSchema;
const testStr = 'test';
const testObj = { test: 'test' };
const moduleNames = ['mock0', 'mock1', 'mock2'];
const supportedModuleNames = ['mock0', 'mock2'];
const trackViewModule = { support: ['trackView'] };
const trackEventModule = { support: ['trackEvent'] };
const trackConversionModule = { support: ['trackConversion'] };
const initializeModule = { support: 'initialize' };

document.body.innerHTML = '<script></script>';
Object.keys(__analytics).forEach((singleModule) => {
  __analytics[singleModule].isEnabled = true;
});

const createMyModule = (support, name = 'mock') => {
  const template = {
    name,
    trackView: jest.fn(),
    trackEvent: jest.fn(),
    trackConversion: jest.fn(),
    initialize: () => new Promise((resolve) => {
      setTimeout(() => {
        resolve(testObj);
      }, 300);
    }),
  };
  return Object.keys(template).reduce((module, method) => {
    if (support.includes(method) || method === 'name') {
      return {
        ...module,
        [method]: template[method],
      };
    }
    return module;
  }, {});
};
const createModuleList = (moduleRules) => {
  const modules = [];
  moduleRules.forEach((moduleRule, i) => {
    modules.push(createMyModule(moduleRule.support, `mock${i}`));
  });
  return modules;
};
const setAnalyticModulesMock = async (moduleRules) => {
  jest.resetModules();
  jest.unmock('../src/modules');
  jest.doMock('../src/modules', () => ({ __esModule: true, default: createModuleList(moduleRules) }));
  analyticModules = await import('../src/modules');
  analytics = await import('../src/index');
  // eslint-disable-next-line prefer-destructuring
  mockedAnalyticModules = analyticModules.default;
};

describe('analytics function', () => {
  describe('trackEvent function', () => {
    beforeEach(async () => {
      await setAnalyticModulesMock([trackEventModule]);
    });
    test('run trackEvent in module', async () => {
      analytics.Analytics.trackEvent(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackEvent).toHaveBeenCalledWith(testStr, testObj);
    });
    test('not run trackEvent when name of module is not passed', async () => {
      analytics.Analytics.trackEvent(testStr, testObj, 'notThisModuleName');
      expect(mockedAnalyticModules[0].trackEvent).not.toHaveBeenCalledWith(testStr, testObj);
    });
    test('run trackEvent in module with global properties as string', async () => {
      analytics.Analytics.setGlobalProperties('global', 'asString');
      analytics.Analytics.trackEvent(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackEvent).toHaveBeenCalledWith(testStr, { global: 'asString', ...testObj });
    });
    test('run trackEvent in module with global properties as object', async () => {
      analytics.Analytics.setGlobalProperties({ global: 'asObject' });
      analytics.Analytics.trackEvent(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackEvent).toHaveBeenCalledWith(testStr, { global: 'asObject', ...testObj });
    });
    test('trackEvent is not run other events in module', async () => {
      await setAnalyticModulesMock([trackViewModule]);
      analytics.Analytics.trackEvent(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackView).not.toHaveBeenCalled();
    });
    test('trackEvent is not throw error when module does not support trackEvent', async () => {
      await setAnalyticModulesMock([trackViewModule]);
      expect(() => analytics.Analytics.trackEvent(testStr, testObj, moduleNames)).not.toThrow(Error);
    });
    test('run trackEvent in all modules', async () => {
      modulesSchema = [trackEventModule, trackEventModule, trackEventModule];
      await setAnalyticModulesMock(modulesSchema);
      analytics.Analytics.trackEvent(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackEvent).toHaveBeenCalledWith(testStr, testObj);
      expect(mockedAnalyticModules[1].trackEvent).toHaveBeenCalledWith(testStr, testObj);
      expect(mockedAnalyticModules[2].trackEvent).toHaveBeenCalledWith(testStr, testObj);
    });
    test('not throw error when all modules does not support trackEvent', async () => {
      modulesSchema = [trackViewModule, trackConversionModule, initializeModule];
      await setAnalyticModulesMock(modulesSchema);
      expect(() => analytics.Analytics.trackEvent(testStr, testObj, moduleNames)).not.toThrow(Error);
    });
    test('run trackEvent in only passed modules', async () => {
      modulesSchema = [trackEventModule, trackEventModule, trackEventModule];
      await setAnalyticModulesMock(modulesSchema);
      analytics.Analytics.trackEvent(testStr, testObj, supportedModuleNames);
      expect(mockedAnalyticModules[0].trackEvent).toHaveBeenCalledWith(testStr, testObj);
      expect(mockedAnalyticModules[1].trackEvent).not.toHaveBeenCalledWith(testStr, testObj);
      expect(mockedAnalyticModules[2].trackEvent).toHaveBeenCalledWith(testStr, testObj);
    });

    test('trackEvent is not called before response of initialize function', async (done) => {
      modulesSchema = [{ support: ['trackEvent', 'initialize'] }];
      await setAnalyticModulesMock(modulesSchema);
      let response;
      setTimeout(() => {
        expect(mockedAnalyticModules[0].trackEvent).not.toHaveBeenCalled();
        expect(response).toBe(undefined);
        done();
      }, 299);
      response = await mockedAnalyticModules[0].initialize();
      mockedAnalyticModules[0].trackEvent();
    });
    test('trackEvent is called after response of initialize function', async (done) => {
      modulesSchema = [{ support: ['trackEvent', 'initialize'] }];
      await setAnalyticModulesMock(modulesSchema);
      let response;
      setTimeout(() => {
        expect(mockedAnalyticModules[0].trackEvent).toHaveBeenCalled();
        expect(response).toBe(testObj);
        done();
      }, 301);
      response = await mockedAnalyticModules[0].initialize();
      mockedAnalyticModules[0].trackEvent();
    });
  });
  describe('trackView function', () => {
    beforeEach(async () => {
      await setAnalyticModulesMock([trackViewModule]);
    });
    test('run trackView in module', async () => {
      analytics.Analytics.trackView(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackView).toHaveBeenCalledWith(testStr, testObj);
    });
    test('not run trackView when name of module is not passed', async () => {
      analytics.Analytics.trackView(testStr, testObj, 'notThisModuleName');
      expect(mockedAnalyticModules[0].trackView).not.toHaveBeenCalledWith(testStr, testObj);
    });
    test('run trackView with global properties as string', async () => {
      analytics.Analytics.setGlobalProperties('global', 'asString');
      analytics.Analytics.trackView(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackView).toHaveBeenCalledWith(testStr, { global: 'asString', ...testObj });
    });
    test('run trackView with global properties as object', async () => {
      analytics.Analytics.setGlobalProperties({ global: 'asObject' });
      analytics.Analytics.trackView(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackView).toHaveBeenCalledWith(testStr, { global: 'asObject', ...testObj });
    });
    test('trackView is not run other events in module', async () => {
      await setAnalyticModulesMock([trackEventModule]);
      analytics.Analytics.trackView(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackEvent).not.toHaveBeenCalled();
    });
    test('trackView is not throw error when module does not support trackView', async () => {
      await setAnalyticModulesMock([trackEventModule]);
      expect(() => analytics.Analytics.trackView(testStr, testObj, moduleNames)).not.toThrow(Error);
    });
    test('run trackView in all modules', async () => {
      modulesSchema = [trackViewModule, trackViewModule, trackViewModule];
      await setAnalyticModulesMock(modulesSchema);
      analytics.Analytics.trackView(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackView).toHaveBeenCalledWith(testStr, testObj);
      expect(mockedAnalyticModules[1].trackView).toHaveBeenCalledWith(testStr, testObj);
      expect(mockedAnalyticModules[2].trackView).toHaveBeenCalledWith(testStr, testObj);
    });
    test('not throw error when all modules does not support trackView', async () => {
      modulesSchema = [trackEventModule, trackConversionModule, initializeModule];
      await setAnalyticModulesMock(modulesSchema);
      expect(() => analytics.Analytics.trackView(testStr, testObj, moduleNames)).not.toThrow(Error);
    });
    test('run trackView in only passed modules', async () => {
      modulesSchema = [trackViewModule, trackViewModule, trackViewModule];
      await setAnalyticModulesMock(modulesSchema);
      analytics.Analytics.trackView(testStr, testObj, supportedModuleNames);
      expect(mockedAnalyticModules[0].trackView).toHaveBeenCalledWith(testStr, testObj);
      expect(mockedAnalyticModules[1].trackView).not.toHaveBeenCalledWith(testStr, testObj);
      expect(mockedAnalyticModules[2].trackView).toHaveBeenCalledWith(testStr, testObj);
    });
  });
  describe('initialize function', () => {
    test('run initialize in module without params', async () => {
      await setAnalyticModulesMock([initializeModule]);
      jest.spyOn(mockedAnalyticModules[0], 'initialize');
      analytics.Analytics.initialize();
      expect(mockedAnalyticModules[0].initialize).toHaveBeenCalled();
    });
    test('run initialize in module with params', async () => {
      await setAnalyticModulesMock([initializeModule]);
      jest.spyOn(mockedAnalyticModules[0], 'initialize');
      analytics.Analytics.initialize(testObj);
      expect(mockedAnalyticModules[0].initialize).toHaveBeenCalledWith(testObj);
    });
    test('initialize is not run other events in module', async () => {
      await setAnalyticModulesMock([trackViewModule]);
      analytics.Analytics.initialize();
      expect(mockedAnalyticModules[0].trackView).not.toHaveBeenCalled();
    });
    test('initialize is not throw error when module does not support initialize', async () => {
      await setAnalyticModulesMock([trackViewModule]);
      expect(() => analytics.Analytics.initialize()).not.toThrow(Error);
    });
    test('run initialize in all modules without params', async () => {
      await setAnalyticModulesMock([initializeModule, initializeModule, initializeModule]);
      jest.spyOn(mockedAnalyticModules[0], 'initialize');
      jest.spyOn(mockedAnalyticModules[1], 'initialize');
      jest.spyOn(mockedAnalyticModules[2], 'initialize');
      analytics.Analytics.initialize();
      expect(mockedAnalyticModules[0].initialize).toHaveBeenCalled();
      expect(mockedAnalyticModules[1].initialize).toHaveBeenCalled();
      expect(mockedAnalyticModules[2].initialize).toHaveBeenCalled();
    });
    test('run initialize in all modules with params', async () => {
      await setAnalyticModulesMock([initializeModule, initializeModule, initializeModule]);
      jest.spyOn(mockedAnalyticModules[0], 'initialize');
      jest.spyOn(mockedAnalyticModules[1], 'initialize');
      jest.spyOn(mockedAnalyticModules[2], 'initialize');
      analytics.Analytics.initialize(testObj);
      expect(mockedAnalyticModules[0].initialize).toHaveBeenCalledWith(testObj);
      expect(mockedAnalyticModules[1].initialize).toHaveBeenCalledWith(testObj);
      expect(mockedAnalyticModules[2].initialize).toHaveBeenCalledWith(testObj);
    });
  });
  describe('trackConversion function', () => {
    test('run trackConversion in module without params', async () => {
      await setAnalyticModulesMock([trackConversionModule]);
      analytics.Analytics.trackConversion();
      expect(mockedAnalyticModules[0].trackConversion).toHaveBeenCalled();
    });
    test('run trackConversion in module with params', async () => {
      await setAnalyticModulesMock([trackConversionModule]);
      analytics.Analytics.trackConversion(testStr);
      expect(mockedAnalyticModules[0].trackConversion).toHaveBeenCalledWith(testStr);
    });
    test('trackConversion is not run other events in module', async () => {
      await setAnalyticModulesMock([trackViewModule]);
      analytics.Analytics.trackConversion();
      expect(mockedAnalyticModules[0].trackView).not.toHaveBeenCalled();
    });
    test('trackConversion is not throw error when module does not support trackConversion', async () => {
      await setAnalyticModulesMock([trackViewModule]);
      expect(() => analytics.Analytics.trackConversion()).not.toThrow(Error);
    });
    test('run trackConversion in all modules without params', async () => {
      await setAnalyticModulesMock([trackConversionModule, trackConversionModule, trackConversionModule]);
      analytics.Analytics.trackConversion();
      expect(mockedAnalyticModules[0].trackConversion).toHaveBeenCalled();
      expect(mockedAnalyticModules[1].trackConversion).toHaveBeenCalled();
      expect(mockedAnalyticModules[2].trackConversion).toHaveBeenCalled();
    });
    test('run trackConversion in all modules with params', async () => {
      await setAnalyticModulesMock([trackConversionModule, trackConversionModule, trackConversionModule]);
      analytics.Analytics.trackConversion(testStr);
      expect(mockedAnalyticModules[0].trackConversion).toHaveBeenCalledWith(testStr);
      expect(mockedAnalyticModules[1].trackConversion).toHaveBeenCalledWith(testStr);
      expect(mockedAnalyticModules[2].trackConversion).toHaveBeenCalledWith(testStr);
    });
  });
  describe('setGlobalProperties function', () => {
    beforeEach(async () => {
      jest.resetModules();
      jest.unmock('../src/modules');
      analyticModules = await import('../src/modules');
      analytics = await import('../src/index');
    });
    test('setGlobalProperties - as string', () => {
      // eslint-disable-next-line
    const globalProperties = analytics.__get__('globalProperties');
      analytics.Analytics.setGlobalProperties('test', 'test');
      expect(globalProperties).toEqual(testObj);
    });
    test('setGlobalProperties - as object', () => {
    // eslint-disable-next-line
    const globalProperties = analytics.__get__('globalProperties');
      analytics.Analytics.setGlobalProperties(testObj);
      expect(globalProperties).toEqual(testObj);
    });
  });
  describe('Vue Analytics', () => {
    test('use as Plugin in Vue 2', () => {
      const vueInstance = { prototype: {} };
      analytics.VueAnalytics.install(vueInstance);
      expect(vueInstance.prototype.$analytics).toEqual(analytics.Analytics);
    });
  });
});
