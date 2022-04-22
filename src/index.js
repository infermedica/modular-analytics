// @ts-check
import { inject } from 'vue'; // eslint-disable-line import/no-unresolved
import analyticModules from './modules';

const globalProperties = {};

/**
 * @type {import('./main').IAnalytics}
 */
export const Analytics = {
  /**
   * @param {import("./main").InitializeParams} options
   */
  async initialize(options) {
    await Promise.all(analyticModules
      .map(async (analyticModule) => analyticModule.initialize
      && analyticModule.initialize(options)));
  },

  /**
   * @param {string} viewName
   * @param {object} properties
   * @param {Array} modules
   */
  trackView(viewName, properties, modules) {
    analyticModules.forEach((analyticModule) => {
      if ((modules && !modules.includes(analyticModule.name))
        || !('trackView' in analyticModule)) return;
      analyticModule.trackView(
        viewName, { ...globalProperties, ...properties },
      );
    });
  },

  /**
   * @param {string} eventName
   * @param {object} properties
   * @param {Array} modules
   */
  async trackEvent(eventName, properties, modules) {
    analyticModules.forEach((analyticModule) => {
      if ((modules && !modules.includes(analyticModule.name))
        || !('trackEvent' in analyticModule)) return;
      analyticModule.trackEvent(
        eventName, { ...globalProperties, ...properties },
      );
    });
  },

  /**
   * @param {string} conversionLabel
   */
  trackConversion(conversionLabel) {
    analyticModules.forEach((analyticModule) => analyticModule.trackConversion
      && analyticModule.trackConversion(conversionLabel));
  },

  /**
   * @param {string|object} property
   * @param {Record<string, unknown> | string} value
   */
  setGlobalProperties(property, value) {
    if (typeof property === 'object') {
      Object.assign(globalProperties, property);
    } else if (typeof property === 'string') {
      globalProperties[property] = value;
    }
  },
};

export const VueAnalytics = {
  install: (Vue) => {
    if (Vue.version.split('.').at(0) === '2') {
      Vue.$analytics = Analytics; // eslint-disable-line no-param-reassign
      Object.defineProperties(Vue.prototype, {
        $analytics: {
          get() {
            return Vue.$analytics;
          },
        },
      });
    } else {
      Vue.config.globalProperties.$analytics = Analytics; // eslint-disable-line no-param-reassign
      Vue.provide('$analytics', Analytics);
    }
  },
};

export function useAnalytics() {
  return inject('$analytics');
}

export default VueAnalytics;
