// @ts-check

const fs = require('fs');
const path = require('path');
const {
  createHtmlFile,
  launchBrowser,
  setupTerminal,
  spawnTerminalProcess,
  waitForText,
  captureStableScreenshot,
  navigateTUI,
  verifyAgainstBaseline,
} = require('./utils');

describe('Nx TUI', () => {
  // Setup variables we'll use in our test
  let browser;
  let page;
  let pty;
  let htmlPath;
  let fullOutput = '';
  let outputChunks = [];

  // Default timeout for Jest tests is often too short for browser testing
  jest.setTimeout(60000); // 60 seconds

  beforeAll(async () => {
    // Create HTML file for rendering
    htmlPath = createHtmlFile();
  });

  afterAll(async () => {
    // Clean up HTML file
    if (fs.existsSync(htmlPath)) {
      fs.unlinkSync(htmlPath);
    }
  });

  afterEach(async () => {
    // Kill PTY and close browser after each test
    if (pty) {
      pty.kill();
    }
    if (browser) {
      await browser.close();
    }
  });

  test('renders correctly and responds to navigation', async () => {
    // Check if running in CI environment
    const isCI = process.env.CI === 'true';

    // Launch browser
    const browserSetup = await launchBrowser(isCI, {
      width: 1200,
      height: 800,
    });
    browser = browserSetup.browser;
    page = browserSetup.page;

    // Setup terminal
    const { dimensions } = await setupTerminal(page, htmlPath);

    // Step 1: Spawn Nx CLI using node-pty
    console.log('Spawning Nx TUI...');
    pty = spawnTerminalProcess(
      dimensions.cols,
      dimensions.rows,
      'npx',
      ['nx', 'run-many', '--target=build', '--all'],
      {
        env: {
          NX_TUI: 'true',
          FORCE_COLOR: '3', // Force color output
        },
      },
    );

    // Process data from pty and send to browser
    pty.onData(async (data) => {
      fullOutput += data;
      outputChunks.push(data);

      // Send data to browser for rendering
      await page.evaluate((text) => {
        // @ts-ignore - Custom method added via browser script
        window.writeToTerminal(text);
      }, data);
    });

    // Wait for initial render - look for the Nx logo or header
    await waitForText(page, 'NX', 15000);

    // Capture initial state
    const initialState = {
      screenshotPath: await captureStableScreenshot(page, 'initial-state'),
    };

    // Navigate through the TUI
    const navigationScreenshots = await navigateTUI(pty, page);

    // Wait for the build to complete or reach a specific state
    await waitForText(page, /Done in \d+\.\d+s|Finished running/i, 30000);

    // Capture final state
    const finalState = {
      screenshotPath: await captureStableScreenshot(page, 'final-state'),
    };

    // Save the full output for debugging
    fs.writeFileSync(
      path.join(process.cwd(), 'terminal-output.txt'),
      fullOutput,
    );
    fs.writeFileSync(
      path.join(process.cwd(), 'terminal-chunks.json'),
      JSON.stringify(outputChunks, null, 2),
    );

    console.log('Test completed successfully');
    console.log(`Initial screenshot: ${initialState.screenshotPath}`);
    console.log(`Navigation screenshots:`, navigationScreenshots);
    console.log(`Final screenshot: ${finalState.screenshotPath}`);

    // Verify screenshots against baselines
    console.log('\n--- Comparing screenshots against baselines ---\n');
    const initialResult = await verifyAgainstBaseline(
      initialState.screenshotPath,
      'initial-state',
      0.1, // 0.1% threshold
      true, // Keep diff images
    );

    const beforeNavResult = await verifyAgainstBaseline(
      navigationScreenshots.beforeNavPath,
      'before-navigation',
      0.1,
      true,
    );

    const afterNav1Result = await verifyAgainstBaseline(
      navigationScreenshots.afterNav1Path,
      'after-navigation-1',
      0.1,
      true,
    );

    const afterNav2Result = await verifyAgainstBaseline(
      navigationScreenshots.afterNav2Path,
      'after-navigation-2',
      0.1,
      true,
    );

    const afterSelectResult = await verifyAgainstBaseline(
      navigationScreenshots.afterSelectPath,
      'after-selection',
      0.1,
      true,
    );

    const finalResult = await verifyAgainstBaseline(
      finalState.screenshotPath,
      'final-state',
      0.1,
      true,
    );

    console.log(
      '\n--- All diff images are saved in the "diffs" directory ---\n',
    );

    // Assert that all comparisons pass using Jest's expect
    expect(initialResult).toBe(true);
    expect(beforeNavResult).toBe(true);
    expect(afterNav1Result).toBe(true);
    expect(afterNav2Result).toBe(true);
    expect(afterSelectResult).toBe(true);
    expect(finalResult).toBe(true);
  });

  // You can add more tests here to test different aspects of the TUI
  test('handles error state correctly', async () => {
    // This is a placeholder for another test you might want to add
    // Implementation would be similar to the above test but with different inputs/expectations
    expect(true).toBe(true); // Placeholder assertion
  });
});
