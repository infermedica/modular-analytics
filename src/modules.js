/* global __analytics */
// Note there has been special combination of if statement applied here so the unused code can be eliminated
// during dead code elimination process, while editing/refactoring this file please take care,
// so that the elimination process still works.
// Also note that each analytics cannot be split into separate files, as it will break code elimination.
const names = {
  DEBUG: 'debug',
  GOOGLE_TAG_MANAGE: 'googleTagManager',
  GOOGLE_ANALYTICS: 'googleAnalytics',
  AMPLITUDE: 'amplitude',
  INFERMEDICA_ANALYTICS: 'infermedicaAnalytics',
};
const analyticModules = [];
const filterProperties = (properties, allowProperties = [], disallowProperties = []) => Object.keys(
  properties,
)
  .filter(
    (key) => (allowProperties.length < 1 || allowProperties.includes(key)),
  )
  .filter((key) => (disallowProperties.length < 1
    || !disallowProperties.includes(key)))
  .reduce((object, key) => ({ ...object, [key]: properties[key] }), {});

// --- Debug module ---
/* eslint-disable no-console */
function debugModule() {
  console.log('Analytics (initialization)');

  return {
    name: names.DEBUG,
    trackView(viewName) {
      console.log('Analytics (trackView):', viewName);
    },
    trackEvent(eventName, properties) {
      console.log('Analytics (trackEvent):', eventName, properties);
    },
  };
}

if (__analytics.debug.isEnabled) analyticModules.push(debugModule());
/* eslint-enable */

// --- Google Tag Manager ---
function googleTagManager() {
  /* eslint-disable */
    // @formatter:off
    (function(s,o,g,a,m){a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(document,'script','https://www.googletagmanager.com/gtag/js');
    // @formatter:on
    /* eslint-enable */

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => {
    window.dataLayer.push(args);
  };
  window.gtag('js', new Date());

  if (__analytics.googleAnalytics.isEnabled) {
    window.gtag('config', __analytics.googleAnalytics.key, {
      send_page_view: false,
      anonymize_ip: true,
    });
  }

  if (__analytics.googleAdWords.isEnabled) {
    window.gtag(
      'config',
      __analytics.googleAdWords.key,
      { anonymize_ip: true },
    );
  }

  return {
    name: names.GOOGLE_TAG_MANAGE,
    trackView() {
      window.gtag('event', 'page_view');
    },
    trackEvent(eventName) {
      window.gtag('event', eventName, {
        event_category: 'Event',
      });
    },
    trackConversion(conversionLabel) {
      if (__analytics.googleAdWords.isEnabled) {
        window.gtag('event', 'conversion', {
          send_to: `${__analytics.googleAdWords.key}/${conversionLabel}`,
        });
      }
    },
  };
}
if (__analytics.googleTagManager.isEnabled) analyticModules.push(googleTagManager());

// --- Google Analytics ---
function googleAnalyticsModule() {
  /* eslint-disable */
    // @formatter:off
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    // @formatter:on
    /* eslint-enable */

  window.ga(
    'create',
    __analytics.googleAnalytics.key,
    window.location.hostname,
  );
  window.ga('set', 'anonymizeIp', true);

  return {
    name: names.GOOGLE_ANALYTICS,
    trackView(viewName) {
      window.ga('send', 'pageview', viewName || window.location.pathname);
    },
    trackEvent(eventName) {
      window.ga('send', 'event', {
        eventCategory: 'Event',
        eventAction: eventName,
      });
    },
  };
}
if (!__analytics.googleTagManager.isEnabled && __analytics.googleAnalytics.isEnabled) {
  analyticModules.push(googleAnalyticsModule());
}

// --- Amplitude ---
function amplitudeModule() {
  /* eslint-disable */
    // @formatter:off
    (function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script");r.type="text/javascript"
    ;r.integrity="sha384-d/yhnowERvm+7eCU79T/bYjOiMmq4F11ElWYLmt0ktvYEVgqLDazh4+gW9CKMpYW";r.crossOrigin="anonymous"
    ;r.async=true;r.src="https://cdn.amplitude.com/libs/amplitude-5.2.2-min.gz.js";r.onload=function(){
    if(!e.amplitude.runQueuedFunctions){console.log("[Amplitude] Error: could not load SDK")}}
    ;var i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i);function s(e,t){
    e.prototype[t]=function(){this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));return this}}
    var o=function(){this._q=[];return this};var a=["add","append","clearAll","prepend","set","setOnce","unset"]
    ;for(var u=0;u<a.length;u++){s(o,a[u])}n.Identify=o;var c=function(){this._q=[];return this}
    ;var l=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"];for(var p=0;p<l.length;p++){
    s(c,l[p])}n.Revenue=c;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut",
    "setVersionName","setDomain","setDeviceId","setGlobalUserProperties","identify","clearUserProperties","setGroup",
    "logRevenueV2","regenerateDeviceId","groupIdentify","onInit","logEventWithTimestamp","logEventWithGroups",
    "setSessionId","resetSessionId"];function v(e){function t(t){e[t]=function(){e._q.push([t].concat(
    Array.prototype.slice.call(arguments,0)))}}for(var n=0;n<d.length;n++){t(d[n])}}v(n);
    n.getInstance=function(e){e=(!e||e.length===0?"$default_instance":e).toLowerCase();if(!n._iq.hasOwnProperty(e)){
    n._iq[e]={_q:[]};v(n._iq[e])}return n._iq[e]};e.amplitude=n})(window,document);
    // @formatter:on
    /* eslint-enable */

  window.amplitude.getInstance().init(__analytics.amplitude.key, null, {
    forceHttps: true,
    domain: window.location.hostname,
    trackingOptions: {
      carrier: false,
      dma: false,
      ip_address: false,
    },
  });

  return {
    name: names.AMPLITUDE,
    trackView(viewName) {
      window.amplitude.getInstance()
        .logEvent('Page Viewed', { page: viewName });
    },
    trackEvent(eventName, properties) {
      const allowProperties = __analytics.amplitude?.allowProperties;
      const disallowProperties = __analytics.amplitude?.disallowProperties;
      const filteredProperties = filterProperties(
        properties,
        allowProperties,
        disallowProperties,
      );
      const payload = Object.keys(filteredProperties)
        .reduce((object, key) => (
          filteredProperties[key]
            ? { ...object, [key]: filteredProperties[key] }
            : object
        ), {});

      window.amplitude.getInstance().logEvent(eventName, payload);
    },
  };
}
if (__analytics.amplitude.isEnabled) analyticModules.push(amplitudeModule());

// --- Infermedica Analytics ---
function infermedicaModule() {
  const {
    appId,
    environment,
    useFirebase,
    baseURL = 'https://analytics-proxy.infermedica.com/',
    publishURL = '/api/v1/publish',
  } = __analytics.infermedicaAnalytics;

  const headers = { 'infer-application-id': appId };
  let analyticsApi = null;
  let userAgentInfo = null;
  let auth = null;
  let eventQueue = [];
  let firebaseUser = null;

  const publish = async (data) => {
    const attributes = {
      environment,
    };
    const { topic } = data;
    const events = [
      {
        data,
        attributes,
      },
    ];
    const payload = {
      topic: topic || __analytics.infermedicaAnalytics.topic,
      events,
    };
    if (useFirebase) {
      const token = await firebaseUser.getIdToken();
      analyticsApi.defaults.headers.Authorization = `Bearer ${token}`;
    }
    await analyticsApi.post(publishURL, payload);
  };

  const getUid = () => (useFirebase && __analytics.infermedicaAnalytics?.sendUID
    ? firebaseUser?.uid
    : null);

  const initializeUserAgentInfo = async () => {
    if (userAgentInfo === null) {
      const { default: UAParser } = await import('ua-parser-js');
      userAgentInfo = UAParser();
    }
    return Promise.resolve(userAgentInfo);
  };

  const initializeAxios = async () => {
    if (analyticsApi === null) {
      const { default: axios } = await import('axios');

      analyticsApi = axios.create({
        baseURL,
        headers,
      });
    }
  };

  return {
    name: names.INFERMEDICA_ANALYTICS,
    /**
       * @param {import('./main').InitializeParams} options
       */
    initialize: async (options = {}) => {
      await Promise.all([initializeAxios(), initializeUserAgentInfo()]);

      // Use directly from __analytics to support tree shaking
      if (__analytics.infermedicaAnalytics.useFirebase) {
        const initializeFirebase = async () => {
          const {
            forceSignInAnonymously,
            firebaseAuth,
            firebaseConfig,
            firebaseAppName,
          } = options;

          const { onAuthStateChanged } = await import('firebase/auth');
          if (firebaseAuth && !forceSignInAnonymously) {
            auth = firebaseAuth;
          } else if (firebaseConfig && forceSignInAnonymously) {
            const [{ signInAnonymously, getAuth }, { initializeApp }] = await Promise.all([
              import('firebase/auth'),
              import('firebase/app'),
            ]);
            const firebaseApp = initializeApp(firebaseConfig, firebaseAppName);
            auth = getAuth(firebaseApp);
            await signInAnonymously(auth);
          }

          onAuthStateChanged(auth, async (authUser) => {
            if (!authUser) return;
            firebaseUser = authUser;
            eventQueue.forEach((event) => {
              const { user } = event;
              publish({
                ...event,
                user: {
                  ...user,
                  id: getUid(),
                },
              });
            });
            eventQueue = [];
          });
        };
        initializeFirebase();
      }
    },
    /**
       * @param { string } eventName
       * @param { object } properties
       */
    async trackEvent(eventName, properties) {
      // prevent to send event without event_details
      if (!properties.event_details) {
        return;
      }
      await Promise.all([initializeAxios(), initializeUserAgentInfo()]);
      const allowProperties = __analytics.infermedicaAnalytics?.allowProperties;
      const disallowProperties = __analytics.infermedicaAnalytics?.disallowProperties;
      const filteredProperties = filterProperties(
        properties,
        allowProperties,
        disallowProperties,
      );
      const date = new Date();
      const { user, application } = filteredProperties;

      const {
        browser, os, device: platform, ua: user_agent, // eslint-disable-line camelcase
      } = userAgentInfo;

      const userAgentInfoWithFallback = {
        browser: {
          ...browser,
          name: browser.name ?? '',
          version: browser.version ?? '',
        },
        os: {
          ...browser.os,
          name: os.name ?? '',
        },
        platform: {
          ...platform,
          // Providing 'desktop' as default type value as ua-parser-js adds device.type only when explicitly defined in UA, e.g. 'Mobile Safari'
          // More context - https://github.com/faisalman/ua-parser-js/issues/182#issuecomment-263115448
          type: platform.type ?? 'desktop',
        },
        user_agent, // eslint-disable-line camelcase
      };

      const data = {
        ...filteredProperties,
        date,
        application: {
          ...application,
        },
        user: {
          ...user,
          id: getUid(),
          ...userAgentInfoWithFallback,
        },
        event_details: {
          event_type: '',
          event_object: '',
          event_data: {
            type: '',
            data: [],
          },
          ...filteredProperties.event_details,
        },
      };
      if (useFirebase && !firebaseUser) {
        eventQueue.push(data);
        return;
      }
      await publish(data);
    },
  };
}
if (__analytics.infermedicaAnalytics.isEnabled) analyticModules.push(infermedicaModule());

export default analyticModules;
