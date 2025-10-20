'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
exports.extensionConfig = {
    port: {
        get: () => getSettings('port'),
        set: (portNo) => setSettings('port', portNo)
    },
    browser: {
        get: () => getSettings('browser'),
        set: (value) => setSettings('browser', value)
    },
    root: {
        get: () => getSettings('root') || '/',
        set: (value) => setSettings('root', value)
    },
    timeout: {
        get: () => getSettings('timeout'),
        set: (value) => setSettings('timeout', value)
    },
    indexFile: {
        get: () => getSettings('indexFile'),
        set: (value) => setSettings('indexFile', value)
    },
    reloadingStrategy: {
        get: () => getSettings('reloadingStrategy'),
        set: (value) => setSettings('reloadingStrategy', value)
    }
};
function getSettings(settingsName) {
    return vscode_1.workspace.getConfiguration('liveServer++').get(settingsName);
}
function setSettings(settingsName, settingsValue, isGlobal = false) {
    return vscode_1.workspace
        .getConfiguration('liveServer++')
        .update(settingsName, settingsValue, isGlobal);
}
