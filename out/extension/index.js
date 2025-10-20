"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = __importStar(require("vscode"));
const LiveServerPlusPlus_1 = require("../core/LiveServerPlusPlus");
const NotificationService_1 = require("./services/NotificationService");
const middlewares_1 = require("./middlewares");
const extensionConfig_1 = require("./utils/extensionConfig");
const BrowserService_1 = require("./services/BrowserService");
const workSpaceUtils_1 = require("./utils/workSpaceUtils");
const StatusbarService_1 = require("./services/StatusbarService");
function activate(context) {
    const liveServerPlusPlus = new LiveServerPlusPlus_1.LiveServerPlusPlus(getLSPPConfig());
    liveServerPlusPlus.useMiddleware(middlewares_1.fileSelector, middlewares_1.setMIME);
    liveServerPlusPlus.useService(NotificationService_1.NotificationService, BrowserService_1.BrowserService, StatusbarService_1.StatusbarService);
    const openServer = vscode.commands.registerCommand(getCmdWithPrefix('open'), () => {
        liveServerPlusPlus.reloadConfig(getLSPPConfig());
        liveServerPlusPlus.goLive();
    });
    const closeServer = vscode.commands.registerCommand(getCmdWithPrefix('close'), () => {
        liveServerPlusPlus.shutdown();
    });
    context.subscriptions.push(openServer);
    context.subscriptions.push(closeServer);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
function getCmdWithPrefix(commandName) {
    return `extension.live-server++.${commandName}`;
}
function getLSPPConfig() {
    const LSPPconfig = { cwd: workSpaceUtils_1.workspaceUtils.cwd };
    LSPPconfig.port = extensionConfig_1.extensionConfig.port.get();
    LSPPconfig.subpath = extensionConfig_1.extensionConfig.root.get();
    LSPPconfig.debounceTimeout = extensionConfig_1.extensionConfig.timeout.get();
    LSPPconfig.indexFile = extensionConfig_1.extensionConfig.indexFile.get();
    LSPPconfig.reloadingStrategy = extensionConfig_1.extensionConfig.reloadingStrategy.get();
    return LSPPconfig;
}
