// @ts-check
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
      analyticModule.trackView(viewName, { ...globalProperties, ...properties });
    });
  },

  /**
   * @param {string} eventName
   * @param {object} properties
   * @param {Array} modules
   */
  async trackEvent(eventName, properties, modules) {
    const responses = [];

    analyticModules.forEach((analyticModule) => {
      const moduleRegistered = modules && modules.includes(analyticModule.name);
      const hasTrackEvent = ('trackEvent' in analyticModule);

      if (!moduleRegistered || !hasTrackEvent) return;
      const response = analyticModule.trackEvent(eventName, { ...globalProperties, ...properties });
      responses.push(response);
    });

    const awaited = await Promise.all(responses);
    return awaited;
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

export default Analytics;
