import { inject } from 'vue'; // eslint-disable-line import/no-unresolved
import { Analytics } from './index';

export default {
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
