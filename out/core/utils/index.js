"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
var injectedText_1 = require("./injectedText");
exports.INJECTED_TEXT = injectedText_1.INJECTED_TEXT;
/**
 * Live Server++ only do dirty read if it's supported
 */
exports.SUPPORTED_FILES = ['.js', '.html', '.css'];
/**
 * Live Server++ will inject extra js code.
 */
exports.INJECTABLE_FILES = ['.html'];
exports.isInjectableFile = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    return exports.INJECTABLE_FILES.includes(ext);
};
exports.isSupportedFile = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    return exports.SUPPORTED_FILES.includes(ext);
};
