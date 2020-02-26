import { timeouts } from '../constants.json';

import uiConnected from '../setup/conditions/uiConnected';

jest.setTimeout(timeouts.test);

describe('useTrackDimension', () => {
  let driver;
  let pageObjects;

  beforeEach(async () => {
    const setup = await setupWebDriver({
      props: {
        onTelemetry: event => {
          const { data, dimensions, duration, error, name, type } = event;

          name !== 'init' &&
            (window.WebChatTest.telemetryMeasurements || (window.WebChatTest.telemetryMeasurements = [])).push({
              data,
              dimensions,
              duration,
              error,
              name,
              type
            });
        }
      }
    });

    driver = setup.driver;
    pageObjects = setup.pageObjects;

    await driver.wait(uiConnected(), timeouts.directLine);
  });

  test('should track string dimension', async () => {
    await pageObjects.runHook('useTrackDimension', [], trackDimension => trackDimension('hello', 'aloha'));
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent('ping'));

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements.length)).resolves.toBe(1);

    await pageObjects.runHook('useTrackDimension', [], trackDimension => trackDimension('hello'));
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent('ping2'));

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toMatchInlineSnapshot(`
      Array [
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "hello": "aloha",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "name": "ping",
          "type": "event",
        },
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "name": "ping2",
          "type": "event",
        },
      ]
    `);
  });

  test('should not track invalid dimension name', async () => {
    await pageObjects.runHook('useTrackDimension', [], trackDimension => trackDimension(123, 'hello'));
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent('ping'));

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toMatchInlineSnapshot(`
      Array [
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "name": "ping",
          "type": "event",
        },
      ]
    `);
  });

  test('should not track invalid dimension value', async () => {
    await pageObjects.runHook('useTrackDimension', [], trackDimension => trackDimension('hello', 123));
    await pageObjects.runHook('useTrackEvent', [], trackEvent => trackEvent('ping'));

    await expect(driver.executeScript(() => window.WebChatTest.telemetryMeasurements)).resolves.toMatchInlineSnapshot(`
      Array [
        Object {
          "data": null,
          "dimensions": Object {
            "capability:downscaleImage:workerType": "web worker",
            "prop:locale": "en-US",
            "prop:speechRecognition": "false",
            "prop:speechSynthesis": "false",
          },
          "duration": null,
          "error": null,
          "name": "ping",
          "type": "event",
        },
      ]
    `);
  });
});
