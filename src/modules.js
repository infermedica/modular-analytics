import axios from "axios";
import Bowser from "bowser";
import firebase from "firebase/app";
import 'firebase/auth';
/* global __analytics */
// Note there has been special combination of if statement applied here so the unused code can be eliminated
// during dead code elimination process, while editing/refactoring this file please take care,
// so that the elimination process still works.
// Also note that each analytics cannot be split into separate files, as it will break code elimination.
const analyticModules = [];
const filterProperties = (allowProperties = [], disallowProperties = [], properties) => {
  let eventProperties = properties;
  if(allowProperties.length > 0 ) {
    eventProperties =  Object.keys(eventProperties)
      .reduce((object, key) => (allowProperties.includes(key)
          ? {...object, [key]: eventProperties[key]}
          : object
      ), {});
  }
  if(disallowProperties.length > 0 ) {
    eventProperties =  Object.keys(eventProperties)
      .reduce((object, key) => (disallowProperties.includes(key)
          ? object
          : {...object, [key]: eventProperties[key]}
      ), {});
  }
  return eventProperties;
}

// --- Debug module ---
if (__analytics.debug?.isEnabled) {
  const debugModule = function () {
    console.log('Analytics (initialization)');

    return {
      name: 'debug',
      trackView(viewName) {
        console.log('Analytics (trackView):', viewName);
      },
      trackEvent(eventName, properties) {
        console.log('Analytics (trackEvent):', eventName, properties);
      }
    };
  };

  analyticModules.push(debugModule());
}


// --- Google Tag Manager ---
if (__analytics.googleTagManager?.isEnabled) {
  const googleAnalyticsModule = function () {
    /* eslint-disable */
    // @formatter:off
    (function(s,o,g,a,m){a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(document,'script','https://www.googletagmanager.com/gtag/js');
    // @formatter:on
    /* eslint-enable */

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (){window.dataLayer.push(arguments);}
    window.gtag('js', new Date());

    if (__analytics.googleAnalytics.isEnabled) {
      window.gtag('config', __analytics.googleAnalytics.key, {
        send_page_view: false,
        anonymize_ip: true
      });
    }

    if (__analytics.googleAdWords.isEnabled) {
      window.gtag('config', __analytics.googleAdWords.key, {anonymize_ip: true});
    }

    return {
      name: 'googleTagManager',
      trackView(viewName) {
        window.gtag('event', 'page_view');
      },
      trackEvent(eventName, properties) {
        window.gtag('event', eventName, {
          event_category: 'Event'
        });
      },
      trackConversion(conversionLabel) {
        if (__analytics.googleAdWords.isEnabled) {
          window.gtag('event', 'conversion', {
            send_to: __analytics.googleAdWords.key + '/' + conversionLabel
          });
        }
      }
    };
  };

  analyticModules.push(googleAnalyticsModule());
}


// --- Google Analytics ---
else if (__analytics.googleAnalytics?.isEnabled) {
  const googleAnalyticsModule = function () {
    /* eslint-disable */
    // @formatter:off
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    // @formatter:on
    /* eslint-enable */

    window.ga('create', __analytics.googleAnalytics.key, window.location.hostname);
    window.ga('set', 'anonymizeIp', true);

    return {
      name: 'googleAnalytics',
      trackView(viewName) {
        window.ga('send', 'pageview', viewName || window.location.pathname);
      },
      trackEvent(eventName, properties) {
        window.ga('send', 'event', {
          eventCategory: 'Event',
          eventAction: eventName
        });
      }
    };
  };

  analyticModules.push(googleAnalyticsModule());
}


// --- Amplitude ---
if (__analytics.amplitude?.isEnabled) {
  const amplitudeModule = function () {
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
        ip_address: false
      }
    });

    return {
      name: 'amplitude',
      trackView(viewName) {
        window.amplitude.getInstance().logEvent('Page Viewed', {page: viewName});
      },
      trackEvent(eventName, properties) {
        const allowProperties = __analytics.amplitude?.allowProperties;
        const disallowProperties = __analytics.amplitude?.disallowProperties;
        const filteredProperties = filterProperties(allowProperties, disallowProperties, properties);
        const payload = JSON.parse(JSON.stringify(filteredProperties));

        window.amplitude.getInstance().logEvent(eventName, payload);
      }
    };
  };

  analyticModules.push(amplitudeModule());
}


// --- Infermedica Analytics ---
if(__analytics.infermedicaAnalytics?.isEnabled) {
  const infermedicaModule = function () {
    const baseURL = __analytics.infermedicaAnalytics?.baseURL || 'https://analytics-proxy.test.infermedica.com/';
    const {environment, firebaseConfig} = __analytics.infermedicaAnalytics;
    const browser = Bowser.getParser(window.navigator.userAgent);
    const headers = {
      'infer-application-id': __analytics.infermedicaAnalytics?.appId
    }
    const analyticsApi = axios.create({
      baseURL,
      headers
    });
    const publish = async function(data) {
      const publishURL = '/api/v1/publish';
      const attributes = {
        environment,
      }
      const {topic, ...properties} = data;
      const events = [
        {
          data,
          attributes
        }
      ];
      const payload = JSON.stringify({
        topic: topic || __analytics.infermedicaAnalytics.topic,
        events,
      });

      await analyticsApi.post(publishURL, payload);
    }

    const firebaseData = {};
    firebase.initializeApp(firebaseConfig);
    (async function () {
      try {
        await firebase.auth().signInAnonymously();
      }
      catch (error) {
        console.error(error);
      }
    })();
    const eventQueue = [];
    firebase.auth().onAuthStateChanged(async (user) => {
      if(!user) return;
      firebaseData.uid = user.uid;
      firebaseData.token = await user.getIdToken();
      analyticsApi.defaults.headers.Authorization = `Bearer ${firebaseData.token}`
      eventQueue.forEach((event) => {
        const {user} = event;
        publish({ ...event, user: {...user, id: firebaseData.uid }});
      })
    })

    return {
      name: 'infermedicaAnalytics',
      trackEvent(eventName, properties) {
        // prevent to send event without event_details
        if (!properties.event_details) {
          return;
        }
        const allowProperties = __analytics.infermedicaAnalytics?.allowProperties;
        const disallowProperties = __analytics.infermedicaAnalytics?.disallowProperties;
        const filteredProperties = filterProperties(allowProperties, disallowProperties, properties);
        const date = new Date();
        const { uid } = firebaseData;
        const {user, application} = filteredProperties;
        const data = {
          ...filteredProperties,
          date,
          application: {
            ...application,
          },
          user: {
            ...user,
            id: uid,
            browser: browser.getBrowser(),
            os: browser.getOS(),
            platform: browser.getPlatform(),
          },
          event_details: {
            event_type: '',
            event_object: '',
            event_data: {
              type: '',
              data: [],
            },
            ...filteredProperties.event_details,
          }
        }
        if(!uid) {
          eventQueue.push(data);
          return;
        }
        publish(data);
      }
    }
  }

  analyticModules.push(infermedicaModule());
}


export default analyticModules;
