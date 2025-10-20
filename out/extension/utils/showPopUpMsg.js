"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function showPopUpMsg(msg, config) {
    const { msgType = 'info' } = config || {};
    if (msgType === 'error') {
        return vscode_1.window.showErrorMessage(msg);
    }
    if (msgType === 'info') {
        return vscode_1.window.showInformationMessage(msg);
    }
    if (msgType === 'warn') {
        return vscode_1.window.showWarningMessage(msg);
    }
}
exports.showPopUpMsg = showPopUpMsg;
