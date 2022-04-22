/* eslint-disable no-underscore-dangle */
/* global __analytics */
document.body.innerHTML = '<script></script>';
Object.keys(__analytics).forEach((module) => {
  __analytics[module].isEnabled = true;
});

let analytics;
let analyticModules;
let mockedAnalyticModules;
let modulesSchema;
const testStr = 'test';
const testObj = { test: 'test' };
const moduleNames = ['mock0', 'mock1', 'mock2'];
const supportedModuleNames = ['mock0', 'mock1'];
const initializeModule = { support: ['initialize'] };
const trackConversionModule = { support: ['trackConversion'] };
const trackEventModule = { support: ['trackEvent'] };
const trackViewModule = { support: ['trackView'] };
const createMyModule = (support, name = 'mock') => {
  const template = {
    name,
    trackView: jest.fn(),
    trackEvent: jest.fn(),
    trackConversion: jest.fn(),
    initialize: jest.fn(() => new Promise((resolve) => {
      setTimeout(() => {
        resolve(testObj);
      }, 300);
    })),
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
  ({ default: mockedAnalyticModules } = analyticModules);
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
    test('run trackEvent in module with global properties, setGlobalProperties parameter as string', async () => {
      analytics.Analytics.setGlobalProperties('global', 'asString');
      analytics.Analytics.trackEvent(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackEvent).toHaveBeenCalledWith(testStr, { global: 'asString', ...testObj });
    });
    test('run trackEvent in module with global properties, setGlobalProperties parameter as object', async () => {
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
      modulesSchema.forEach((module, i) => {
        expect(mockedAnalyticModules[i].trackEvent).toHaveBeenCalledWith(testStr, testObj);
      });
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
      supportedModuleNames.forEach((moduleName, i) => {
        expect(mockedAnalyticModules[i].trackEvent).toHaveBeenCalledWith(testStr, testObj);
      });
      expect(mockedAnalyticModules[2].trackEvent).not.toHaveBeenCalledWith(testStr, testObj);
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
    test('run trackView with global properties, setGlobalProperties parameter as string', async () => {
      analytics.Analytics.setGlobalProperties('global', 'asString');
      analytics.Analytics.trackView(testStr, testObj, moduleNames);
      expect(mockedAnalyticModules[0].trackView).toHaveBeenCalledWith(testStr, { global: 'asString', ...testObj });
    });
    test('run trackView with global properties, setGlobalProperties parameter as object', async () => {
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
      modulesSchema.forEach((module, i) => {
        expect(mockedAnalyticModules[i].trackView).toHaveBeenCalledWith(testStr, testObj);
      });
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
      supportedModuleNames.forEach((moduleName, i) => {
        expect(mockedAnalyticModules[i].trackView).toHaveBeenCalledWith(testStr, testObj);
      });
      expect(mockedAnalyticModules[2].trackView).not.toHaveBeenCalledWith(testStr, testObj);
    });
  });
  describe('initialize function', () => {
    test('run initialize in module without params', async () => {
      await setAnalyticModulesMock([initializeModule]);
      analytics.Analytics.initialize();
      expect(mockedAnalyticModules[0].initialize).toHaveBeenCalled();
    });
    test('run initialize in module with params', async () => {
      await setAnalyticModulesMock([initializeModule]);
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
      modulesSchema = [initializeModule, initializeModule, initializeModule];
      await setAnalyticModulesMock(modulesSchema);
      analytics.Analytics.initialize();
      modulesSchema.forEach((module, i) => {
        expect(mockedAnalyticModules[i].initialize).toHaveBeenCalled();
      });
    });
    test('run initialize in all modules with params', async () => {
      modulesSchema = [initializeModule, initializeModule, initializeModule];
      await setAnalyticModulesMock(modulesSchema);
      analytics.Analytics.initialize(testObj);
      modulesSchema.forEach((module, i) => {
        expect(mockedAnalyticModules[i].initialize).toHaveBeenCalledWith(testObj);
      });
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
      modulesSchema = [trackConversionModule, trackConversionModule, trackConversionModule];
      await setAnalyticModulesMock(modulesSchema);
      analytics.Analytics.trackConversion();
      modulesSchema.forEach((module, i) => {
        expect(mockedAnalyticModules[i].trackConversion).toHaveBeenCalled();
      });
    });
    test('run trackConversion in all modules with params', async () => {
      modulesSchema = [trackConversionModule, trackConversionModule, trackConversionModule];
      await setAnalyticModulesMock(modulesSchema);
      analytics.Analytics.trackConversion(testStr);
      modulesSchema.forEach((module, i) => {
        expect(mockedAnalyticModules[i].trackConversion).toHaveBeenCalledWith(testStr);
      });
    });
  });
  describe('setGlobalProperties function', () => {
    beforeEach(async () => {
      jest.resetModules();
      jest.unmock('../src/modules');
      analyticModules = await import('../src/modules');
      analytics = await import('../src/index');
    });
    test('setGlobalProperties - passed parameter as string', () => {
      const globalProperties = analytics.__get__('globalProperties');
      analytics.Analytics.setGlobalProperties('test', 'test');
      expect(globalProperties).toEqual(testObj);
    });
    test('setGlobalProperties - passed parameter as object', () => {
      const globalProperties = analytics.__get__('globalProperties');
      analytics.Analytics.setGlobalProperties(testObj);
      expect(globalProperties).toEqual(testObj);
    });
  });
});
