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
      sendUID: false, // allow to send firebase UID, false by default 
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

You can use the event for all modules or decide which modules should be used for this event, e.g.:

```javascript
Analytics.trackEvent('Event name', {
  user_rating: 5
}, ['aplitude', 'googleTagManager'])
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

### Initializing `infermedicaAnalytics` module
#### In order to use `infermedicaAnalytics` module you must initialize it first.

You can decide if you want to use Firebase **anonymously** or as **identified user**. In order to use `infermedicaAnalytics` 
module of this package you should call `initialize()` method and pass it an object which matches the following type:

```typescript
type InitializeParams = IAnonymousInitializeParams | IAuthenticatedInitializeParams;

interface IAnonymousInitializeParams {
  firebaseConfig: FirebaseOptions,
  forceSignInAnonymously: true,
}

interface IAuthenticatedInitializeParams {
  firebaseAuth: Auth,
  forceSignInAnonymously: false,
}
```

If you want to let the library sign you in to firebase as anonymous user, you should call the `initialize()` method with an object corresponding to the `IAnonymousInitializeParams` `interface`, e.g.:

```javascript
import { Analytics } from '@infermedica/modular-analytics';

const firebaseConfig = { /* your firebase config */ };
Analytics.initialize({ firebaseConfig, forceSignInAnonymously: true });
```

In case you need to handle firebase-authentication on your side, do it and then initialize Analytics library by passing object corresponding to the `IAuthenticatedInitializeParams` `interface`, e.g.:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Analytics } from '@infermedica/modular-analytics';

const firebaseConfig = { /* your firebase config */ }; 

const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
Analytics.initialize({ firebaseAuth, forceSignInAnonymously: false });
```

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
