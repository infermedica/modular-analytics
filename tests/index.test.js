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

const createMyModule = (support = [], name = 'mock') => {
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
  test('track event is not called before response of initialize function', async (done) => {
    let response;
    const moduleMock = createMyModule(['initialize', 'trackEvent']);
    setTimeout(() => {
      expect(moduleMock.trackEvent).not.toHaveBeenCalled();
      expect(response).toBe(undefined);
      done();
    }, 299);
    response = await moduleMock.initialize();
    moduleMock.trackEvent();
  });
  test('track event is called after response of initialize function', async (done) => {
    let response;
    const moduleMock = createMyModule(['initialize', 'trackEvent']);
    setTimeout(() => {
      expect(moduleMock.trackEvent).toHaveBeenCalled();
      expect(response).toBe(testObj);
      done();
    }, 301);
    response = await moduleMock.initialize();
    moduleMock.trackEvent();
  });

  test('trackEvent - run all modules', () => {
    analytics.Analytics.trackEvent(testStr, testObj, moduleNames);
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.trackEvent) {
        expect(singleModule.trackEvent).toHaveBeenCalledWith(testStr, testObj);
      }
    });
  });
  test('trackEvent - run only passed modules', () => {
    analytics.Analytics.trackEvent(testStr, testObj, ['debug', 'amplitude']);
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.trackEvent) {
        const isCalled = singleModule.name !== 'googleTagManager' && singleModule.name !== 'infermedicaAnalytics';
        // eslint-disable-next-line
        isCalled
          ? expect(singleModule.trackEvent).toHaveBeenCalledWith(testStr, testObj)
          : expect(singleModule.trackEvent).not.toHaveBeenCalled();
      }
    });
  });
  test('trackEvent - with global properties as string, run all modules', () => {
    analytics.Analytics.setGlobalProperties('global', 'asString');
    analytics.Analytics.trackEvent(testStr, testObj, moduleNames);
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.trackEvent) {
        expect(singleModule.trackEvent).toHaveBeenCalledWith(testStr, { global: 'asString', ...testObj });
      }
    });
  });
  test('trackEvent - with global properties as object, run all modules', () => {
    analytics.Analytics.setGlobalProperties({ global: 'asObject' });
    analytics.Analytics.trackEvent(testStr, testObj, moduleNames);
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.trackEvent) {
        expect(singleModule.trackEvent).toHaveBeenCalledWith(testStr, { global: 'asObject', ...testObj });
      }
    });
  });

  test('trackView - run all modules', () => {
    analytics.Analytics.trackView(testStr, testObj, moduleNames);
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.trackView) {
        expect(singleModule.trackView).toHaveBeenCalledWith(testStr, testObj);
      }
    });
  });
  test('trackView - run only passed modules', () => {
    analytics.Analytics.trackView(testStr, testObj, ['debug', 'amplitude']);
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.trackView) {
        const isCalled = singleModule.name !== 'googleTagManager' && singleModule.name !== 'infermedicaAnalytics';
        // eslint-disable-next-line
        isCalled
          ? expect(singleModule.trackView).toHaveBeenCalledWith(testStr, testObj)
          : expect(singleModule.trackView).not.toHaveBeenCalled();
      }
    });
  });
  test('trackView - with global properties as string, run all modules', () => {
    analytics.Analytics.setGlobalProperties('global', 'asString');
    analytics.Analytics.trackView(testStr, testObj, moduleNames);
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.trackView) {
        expect(singleModule.trackView).toHaveBeenCalledWith(testStr, { global: 'asString', ...testObj });
      }
    });
  });
  test('trackView - with global properties as object, run all modules', () => {
    analytics.Analytics.setGlobalProperties({ global: 'asObject' });
    analytics.Analytics.trackView(testStr, testObj, moduleNames);
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.trackView) {
        expect(singleModule.trackView).toHaveBeenCalledWith(testStr, { global: 'asObject', ...testObj });
      }
    });
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
  test('initialize - run all modules without params', () => {
    analytics.Analytics.initialize();
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.initialize) {
        expect(singleModule.initialize).toHaveBeenCalled();
      }
    });
  });
  test('initialize - run all modules with params', () => {
    analytics.Analytics.initialize(testObj);
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.initialize) {
        expect(singleModule.initialize).toHaveBeenCalledWith(testObj);
      }
    });
  });
  test('trackConversion - run all modules without params', () => {
    analytics.Analytics.trackConversion();
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.trackConversion) {
        expect(singleModule.trackConversion).toHaveBeenCalled();
      }
    });
  });
  test('trackConversion - run all modules with params', () => {
    analytics.Analytics.trackConversion(testObj);
    analyticsModules.default.forEach((singleModule) => {
      if (singleModule.trackConversion) {
        expect(singleModule.trackConversion).toHaveBeenCalledWith(testObj);
      }
    });
  });
  test('Vue Analytics - use as Plugin in Vue 2', () => {
    const vueInstance = { prototype: {} };
    analytics.VueAnalytics.install(vueInstance);
    expect(vueInstance.prototype.$analytics).toEqual(analytics.Analytics);
  });
});
