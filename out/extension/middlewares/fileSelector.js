"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const url = __importStar(require("url"));
const extensionConfig_1 = require("../utils/extensionConfig");
const LIVE_SERVER_ASSETS = path_1.default.join(__dirname, '../../core/assets');
exports.fileSelector = (req, res) => {
    let fileUrl = getReqFileUrl(req);
    if (fileUrl.startsWith('/_live-server_/')) {
        fileUrl = path_1.default.join(LIVE_SERVER_ASSETS, fileUrl.replace('/_live-server_/', ''));
        res.setHeader('cache-control', 'public, max-age=30672000');
    }
    else if (fileUrl.startsWith('/')) {
        fileUrl = `.${fileUrl}`;
    }
    req.file = fileUrl;
};
function getReqFileUrl(req) {
    const { pathname = '/' } = url.parse(req.url || '/');
    if (!path_1.default.extname(pathname)) {
        //TODO: THIS NEED TO FIX. WE HAVE TO LOOK INTO DISK
        return `.${path_1.default.join(pathname, extensionConfig_1.extensionConfig.indexFile.get())}`;
    }
    return pathname;
}
