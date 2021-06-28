# Infermedica Modular Analytics

This package provides a common interface for sending data to web analytics tools like Google Analytics or Amplitude.
Only basic functionality of tracking page views and events is currently supported.

## Installation

```bash
$ npm install --save-dev @infermedica/modular-analytics
```

## Configuration

The analytics interfaces has to be configured in Webpack configuration file through `webpack.DefinePlugin`:

```javascript
new webpack.DefinePlugin({
  __analytics: JSON.stringify({
    debug: {
      isEnabled: true
    },
    googleAnalytics: {
      isEnabled: true,
      key: '<your-key>'
    },
    googleAdWords: {
      isEnabled: true,
      key: '<your-key>'
    },
    googleTagManager: {
      isEnabled: true
    },
    amplitude: {
      isEnabled: true,
      key: '<your-key>',
      allowProprties: [], // optional
      disallowProperties: ['application', 'user', 'section', 'event_details'], // optional
    },
    infermedicaAnalytics: {
      isEnabled: true,
      topic: '<your-topic>',
      environment: process.env.NODE_ENV,
      firebaseConfig: {
        apiKey: '<your-firebase-api-key>',
        authDomain: '<your-firebase-auth-domain>',
        appId: '<your-firebase-app-id>',
      },
      allowProperties: ['application', 'user', 'section', 'event_details'], // optional
      disallowProperties: [], // optional
    },
  })
})
```

You can use the above configuration to enable or disable individual modules. Use `isEnabled` to specify if particular
module should be included in a final build.

Please note that `isEnabled` must be a boolean value (but you can still compute it from other variables), so Webpack's
tree shaking algorithm can correctly detect and remove unused modules.

## Usage

To use the module, you need to import the `Analytics` object and call its methods.

```javascript
import {Analytics} from '@infermedica/modular-analytics';
```

### Page view tracking

To track page views, use:

```javascript
Analytics.trackView();
```

or:

```javascript
Analytics.trackView('View Name');
```

### Event tracking

To track events, use:

```javascript
Analytics.trackEvent('Event name');
```

You can also pass additional properties, e.g.:

```javascript
Analytics.trackEvent('Event name', {
  user_rating: 5
});
```

You can use the event for all modules or decide with modules should be used for this event, e.g.:

```javascript
Analytics.trackEvent('Event name', {
  user_rating: 5
}, ['aplitude', 'googleTagManager'])
```

You can disable event for all modules, e.g.:
```javascript
Analytics.trackEvent('Event name', {
  user_rating: 5
}, ['aplitude', 'googleTagManager'], true)
```
### Conversion tracking

To track events, use:

```javascript
Analytics.trackConversion('conversion-label');
```

The "conversion-label" will be passed to gtag function as follow:
```
window.gtag('event', 'conversion', {send_to: __analytics.googleAdWords.key + '/' + conversionLabel});
```

### Setting global properties

You can set global properties that will be automatically added to each tracked event:

```javascript
Analytics.setGlobalProperties('instance', 'my-page.example.com');
```

Multiple properties can be set at once, e.g.:

```javascript
Analytics.setGlobalProperties({
  instance: 'my-page.example.com',
  interface_language: 'en',
});
```

Note that global properties can be overridden by parameters passed to `trackEvent` calls.

### Usage with Vue.js

This package can be used as a Vue.js plugin:

```javascript
import {VueAnalytics} from '@infermedica/modular-analytics';

Vue.use(VueAnalytics);
```

You can access it anywhere via `Vue.$analytics`:

```javascript
Vue.$analytics.setGlobalProperties(...);
Vue.$analytics.trackView(...);
Vue.$analytics.trackEvent(...);
```

or with `this.$analytics` inside of Vue.js components:

```javascript
this.$analytics.setGlobalProperties(...);
this.$analytics.trackView(...);
this.$analytics.trackEvent(...);
```

## Supported analytics tools

Currently the following providers are supported:
* Google Analytics
* Google Tag Manager (Analytics & AdWords)
* Amplitude
* Infermedica Analytic

Other analytics tools are easy to integrate with this module and we might add their support in the future.

## Contribution

We're happy to accept pull requests with additional integrations. Feel free to raise an issue if you have any
questions or suggestions.

## License

MIT Copyright (c) Infermedica
