/* global __analytics */
jest.useFakeTimers('modern');
jest.setSystemTime(new Date(2020, 3, 1));
let analyticModules;
let publishPayload;
const testProperties = { test: 'test', test2: 'test2', test3: 'test3' };
const expectedPayload = {
  events: [{
    attributes: { environment: undefined },
    data: {
      application: {},
      date: new Date(),
      event_details: {
        event_data: {
          data: [],
          type: '',
        },
        event_object: '',
        event_type: '',
      },
      user: {
        browser: 'browser',
        id: null,
        os: 'os',
        platform: 'platform',
      },
    },
  }],
  topic: 'test',
};
jest.mock('bowser', () => ({
  getParser: () => ({ getBrowser: () => 'browser', getOS: () => 'os', getPlatform: () => 'platform' }),
}));
jest.mock('axios', () => ({
  create: () => ({ post: (_, payload) => { publishPayload = payload; } }),
}));

beforeEach(() => {
  __analytics.infermedicaAnalytics.isEnabled = true;
  __analytics.infermedicaAnalytics.topic = 'test';
  delete expectedPayload.events[0].data.test;
  delete expectedPayload.events[0].data.test2;
  delete expectedPayload.events[0].data.test3;
  jest.resetModules();
});

describe('module/googleTagManager', () => {
  test('googleTagManager is disabled', async () => {
    __analytics.infermedicaAnalytics.isEnabled = false;
    analyticModules = await import('../../src/modules');
    expect(analyticModules).toEqual({ default: [] });
  });
  test('return correct name', async () => {
    analyticModules = await import('../../src/modules');
    const { name } = analyticModules.default[0];
    expect(name).toBe('infermedicaAnalytics');
  });
  test('track event, correct publish payload', async () => {
    expectedPayload.events[0].data = {
      ...expectedPayload.events[0].data,
      ...testProperties,
    };
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    await trackEvent('eventName', { event_details: {}, ...testProperties });
    expect(publishPayload).toEqual(expectedPayload);
  });
  test('track event, correct publish payload with dissalow properties', async () => {
    __analytics.infermedicaAnalytics.disallowProperties = ['test', 'test3'];
    expectedPayload.events[0].data = {
      ...expectedPayload.events[0].data,
      test2: 'test2',
    };
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    await trackEvent('eventName', { event_details: {}, ...testProperties });
    expect(publishPayload).toEqual(expectedPayload);
  });
  test('track event, correct publish payload with allow properties', async () => {
    __analytics.infermedicaAnalytics.allowProperties = ['test', 'test2'];
    __analytics.infermedicaAnalytics.disallowProperties = [];
    expectedPayload.events[0].data = {
      ...expectedPayload.events[0].data,
      test: 'test',
      test2: 'test2',
    };
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    await trackEvent('eventName', { event_details: {}, ...testProperties });
    expect(publishPayload).toEqual(expectedPayload);
  });
  // TODO tests for initialize func
});
