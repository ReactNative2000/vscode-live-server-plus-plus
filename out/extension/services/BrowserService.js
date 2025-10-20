"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const open_1 = __importDefault(require("open"));
const extensionConfig_1 = require("../utils/extensionConfig");
const workSpaceUtils_1 = require("../utils/workSpaceUtils");
const getNormalizedBrowserName_1 = require("../utils/getNormalizedBrowserName");
const utils_1 = require("../../core/utils");
const urlJoin_1 = require("../utils/urlJoin");
class BrowserService {
    constructor(liveServerPlusPlus) {
        this.liveServerPlusPlus = liveServerPlusPlus;
    }
    register() {
        this.liveServerPlusPlus.onDidGoLive(this.openInBrowser.bind(this));
        this.liveServerPlusPlus.onServerError(this.openIfServerIsAlreadyRunning.bind(this));
    }
    openInBrowser(event) {
        const host = '127.0.0.1';
        const port = event.LSPP.port;
        const pathname = this.getPathname();
        const protocol = 'http:';
        const browserName = extensionConfig_1.extensionConfig.browser.get();
        if (!browserName)
            return;
        const openParams = [];
        if (browserName !== 'default') {
            openParams.push(getNormalizedBrowserName_1.getNormalizedBrowserName(browserName));
        }
        open_1.default(`${protocol}//${host}:${port}${pathname}`, { app: openParams });
    }
    getPathname() {
        const activeDoc = workSpaceUtils_1.workspaceUtils.getActiveDoc();
        if (!activeDoc || !utils_1.isInjectableFile(activeDoc))
            return '/';
        return urlJoin_1.urlJoin('/', activeDoc);
    }
    openIfServerIsAlreadyRunning(event) {
        if (event.code === 'serverIsAlreadyRunning') {
            this.openInBrowser(event);
        }
    }
}
exports.BrowserService = BrowserService;
