"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getNormalizedBrowserName(browserName) {
    if (browserName === 'chrome') {
        const chromes = {
            darwin: 'google chrome',
            linux: 'google-chrome',
            win32: 'chrome'
        };
        return chromes[process.platform];
    }
    return browserName;
}
exports.getNormalizedBrowserName = getNormalizedBrowserName;
