/* global __analytics */
jest.useFakeTimers('modern');
jest.setSystemTime(new Date(2020, 3, 1));
let analyticModules;
const testProperties = { test: 'test', test2: 'test2', test3: 'test3' };
const expectedPayload = {
  events: [{
    attributes: { environment: 'test' },
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
        id: null,
        browser: 'browser',
        os: 'os',
        platform: { type: 'platform' },
      },
    },
  }],
  topic: 'test',
};
jest.mock('ua-parser-js', () => (
  () => ({
    browser: 'browser',
    os: 'os',
    device: { type: 'platform' },
  })
));

const mockPost = jest.fn((_, request) => request);
jest.doMock('axios', () => ({
  create: () => ({ post: mockPost }),
}));

beforeEach(() => {
  __analytics.infermedicaAnalytics.allowProperties = ['test', 'test2', 'test3'];
  __analytics.infermedicaAnalytics.environment = 'test';
  __analytics.infermedicaAnalytics.isEnabled = true;
  __analytics.infermedicaAnalytics.topic = 'test';
  delete expectedPayload.events[0].data.test;
  delete expectedPayload.events[0].data.test2;
  delete expectedPayload.events[0].data.test3;
  expectedPayload.topic = 'test';
  expectedPayload.events[0].attributes.environment = 'test';
  jest.resetModules();
});

describe('module/infermedicaAnalytics', () => {
  test('return [] when infermedicaAnalytics is disabled', async () => {
    __analytics.infermedicaAnalytics.isEnabled = false;
    ({ default: analyticModules } = await import('../../src/modules'));
    expect(analyticModules).toEqual([]);
  });
  test('track event, correct publish payload', async () => {
    expectedPayload.events[0].data = {
      ...expectedPayload.events[0].data,
      ...testProperties,
    };
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    await trackEvent('eventName', { event_details: {}, ...testProperties });
    expect(mockPost).toHaveReturnedWith(expectedPayload);
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
    expect(mockPost).toHaveReturnedWith(expectedPayload);
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
    expect(mockPost).toHaveReturnedWith(expectedPayload);
  });
  test('track event, with custom environment', async () => {
    __analytics.infermedicaAnalytics.environment = 'custom environment';
    expectedPayload.events[0].data = {
      ...expectedPayload.events[0].data,
      ...testProperties,
    };
    expectedPayload.events[0].attributes.environment = 'custom environment';
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    await trackEvent('eventName', { event_details: {}, ...testProperties });
    expect(mockPost).toHaveReturnedWith(expectedPayload);
  });
  test('track event, with custom topic', async () => {
    __analytics.infermedicaAnalytics.topic = 'custom topic';
    expectedPayload.events[0].data = {
      ...expectedPayload.events[0].data,
      ...testProperties,
    };
    expectedPayload.topic = 'custom topic';
    analyticModules = await import('../../src/modules');
    const { trackEvent } = analyticModules.default[0];
    await trackEvent('eventName', { event_details: {}, ...testProperties });
    expect(mockPost).toHaveReturnedWith(expectedPayload);
  });
  // TODO tests for initialize func
});
