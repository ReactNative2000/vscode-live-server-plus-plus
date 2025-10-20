"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LSPPError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
exports.LSPPError = LSPPError;
