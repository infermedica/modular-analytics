import analyticModules from './modules';

const globalProperties = {};

export const Analytics = {
  trackView(viewName, properties) {
    analyticModules.forEach((analyticModule) => {
      analyticModule.trackView && analyticModule.trackView(
        viewName, Object.assign({}, globalProperties, properties)
      );
    });
  },
  trackEvent(eventName, properties) {
    analyticModules.forEach((analyticModule) => {
      analyticModule.trackEvent && analyticModule.trackEvent(
        eventName, Object.assign({}, globalProperties, properties)
      );
    });
  },
  trackConversion(conversionLabel) {
    analyticModules.forEach((analyticModule) => {
      analyticModule.trackConversion && analyticModule.trackConversion(conversionLabel);
    });
  },
  setGlobalProperties(property, value) {
    if (typeof property === 'object') {
      Object.assign(globalProperties, property);
    } else if (typeof property === 'string') {
      globalProperties[property] = value;
    }
  }
};

export const VueAnalytics = {
  install: (Vue) => {
    Vue.$analytics = Analytics;

    Object.defineProperties(Vue.prototype, {
      $analytics: {
        get() {
          return Vue.$analytics;
        }
      }
    });
  }
};
