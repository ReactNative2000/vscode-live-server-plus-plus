"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mime_types_1 = require("mime-types");
const path = __importStar(require("path"));
exports.setMIME = (req, res) => {
    const extname = path.extname(req.file);
    req.contentType = String(mime_types_1.contentType(extname));
    res.setHeader('content-type', String(mime_types_1.contentType(extname)));
};
