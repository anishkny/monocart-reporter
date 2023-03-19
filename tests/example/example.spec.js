const { test, expect } = require('@playwright/test');
const Util = require('../common/util.js');

/**
 * add extra information for case
 * @owner Kevin
 * @jira MCR-16888
 * @testrail 2125
 */
test('case before suite', () => {

});

/**
 * @testrail 2126
 */
test('Test login page @fast', async () => {

});

/**
 * @testrail 2127
 */
test('Test full report', async () => {

});

/**
 * add extra information for suite
 * @owner Mark
 * @jira MCR-16900
 */
test.describe('suite group 1 @beta', () => {

    // https://playwright.dev/docs/test-fixtures
    // First argument must use the object destructuring pattern: fixtures
    /**
     * @owner Mark
     * @jira MCR-16933
     * @testrail 2128
     */
    test('@smoke case info', ({ browserName }, testInfo) => {

        /**
         * override assert step title "expect.toBe" to
         * @title my custom assert step title
         * @annotations important
         */
        expect(testInfo).toBe(test.info());

    });

    /**
     * @testrail 2129
     */
    test('@regression case steps @slow', async () => {

        const result1 = await test.step('step 1', () => {
            return 'result';
        });

        const result2 = await test.step('step 2', () => {
            return 'result';
        });

        expect(result1).toBe(result2);

        // @owner Steve
        await test.step('step @slow (500ms)', () => {
            return new Promise((resolve) => {
                setTimeout(resolve, 500);
            });
        });

        test.step('step soft assertion failed', () => {
            expect.soft(1).toBe(2);
        });

    });

    test.describe('suite sub group', () => {
        test('case first', async () => {
            // ...
        });

        // https://playwright.dev/docs/test-annotations#custom-annotations
        test('custom annotations', () => {
            test.info().annotations.push({
                type: 'issues',
                description: ['MCR-666', 'MCR-888']
            });
            test.info().annotations.push({
                type: 'markdown',
                description: '[monocart-reporter/issues](https://github.com/cenfun/monocart-reporter/issues)'
            });
        });

        /**
         * @description It's also possible to add custom metadata in the form of annotations to your tests. Annotations are key/value pairs accessible via test.info().annotations. Many reporters show annotations, for example 'html'.
Playwright Test supports test annotations to deal with failures, flakiness, skip, focus and tag tests:
- test.skip() marks the test as irrelevant. Playwright Test does not run such a test. Use this annotation when the test is not applicable in some configuration.
- test.fail() marks the test as failing. Playwright Test will run this test and ensure it does indeed fail. If the test does not fail, Playwright Test will complain.
- test.fixme() marks the test as failing. Playwright Test will not run this test, as opposed to the fail annotation. Use fixme when running the test is slow or crashes.
- test.slow() marks the test as slow and triples the test timeout.
         */
        test('skipped test annotations', () => {
            test.info().annotations.push({
                type: 'issue', description: '#123'
            });
            test.info().annotations.push({
                type: 'issue', description: '[#456](https://github.com/cenfun/monocart-reporter)'
            });
            test.info().annotations.push({
                type: 'issue', description: 'https://github.com/cenfun/monocart-reporter'
            });
            test.info().annotations.push({
                type: 'issue'
            });
            test.info().annotations.push({
                type: 'empty'
            });
            test.skip(true, 'I am not interested in this test');
        });

        /**
         * @annotations issue [link](https://github.com/cenfun/monocart-reporter)
         * @jira MCR-16933
         */

        test('annotations from comments', () => {

        });

        /**
         * @owner Mark
         * @jira MCR-16936
         */


        test('case failed', () => {

            console.log('stdout: failed case log');

            console.error('stderr: failed case error');

            console.log(test.info().config.reporter);

            expect('passed').toBe('failed');
        });

        test('case fail - not yet ready', () => {

            test.fail();
            console.log('failed');
        });

        test('case fixme - not yet ready', () => {
            test.fixme();
            console.log('fixme');
        });

        test('case last', async () => {
            // ...
        });
    });

    test('case skipped by test.skip()', () => {
        test.skip();
        console.log('skipped');
    });

    test.skip('case skipped case', () => {
        expect('skipped').toBe('skipped');
    });

    test('case two', async () => {
        // ...
    });
});

test.describe('suite group 2', () => {

    test('case flaky', ({ browserName }, testInfo) => {

        console.log(`retry: ${testInfo.retry}`);
        expect(testInfo.retry).toBe(1);

    });

    test('case timeout 3000', async () => {
        test.setTimeout(3000);
        await Util.delay(10 * 1000);
    });

    test('case one @smoke@fast', async () => {
        // ...
    });

    test('case two @regression@custom_tag', async () => {
        // ...
    });
});


test('@smoke case after suite', () => {

});
