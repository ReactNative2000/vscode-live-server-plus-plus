Extension testing with @vscode/test-electron
===========================================

This document explains how to run extension tests locally using `@vscode/test-electron`.

1. Install deps

```bash
npm ci
npm install --prefix test/playwright || true
```

2. Run extension tests

Use `@vscode/test-electron` runner. Example (adjust `version` and `extensionDevelopmentPath` paths):

```js
const path = require('path');
const { runTests } = require('@vscode/test-electron');

(async () => {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '..');
    const extensionTestsPath = path.resolve(__dirname, 'out', 'test');
    await runTests({
      version: '1.77.0',
      extensionDevelopmentPath,
      extensionTestsPath
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exit(1);
  }
})();
```

Notes
- This repo previously used the deprecated `vscode` package. The tests should be migrated to use `@vscode/test-electron`.
