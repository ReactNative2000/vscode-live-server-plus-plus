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
class StatusbarService {
    constructor(liveServerPlusPlus) {
        this.liveServerPlusPlus = liveServerPlusPlus;
        this.statusbar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 200);
    }
    register() {
        this.init();
        this.liveServerPlusPlus.onDidGoLive(this.showOfflineStatusbar.bind(this));
        this.liveServerPlusPlus.onDidGoOffline(this.showLiveStatusbar.bind(this));
    }
    init() {
        this.placeStatusbar();
        this.showLiveStatusbar();
    }
    placeStatusbar(workingMsg = 'loading...') {
        this.statusbar.text = `$(pulse) ${workingMsg}`;
        this.statusbar.tooltip =
            'In case if it takes long time, try to close all browser window.';
        this.statusbar.command = undefined;
        this.statusbar.show();
    }
    showLiveStatusbar(event) {
        this.statusbar.text = '$(radio-tower) Go Live++';
        this.statusbar.command = 'extension.live-server++.open';
        this.statusbar.tooltip = 'Click to run live server++';
    }
    showOfflineStatusbar(event) {
        this.statusbar.text = `$(x) Port : ${event.LSPP.port}`;
        this.statusbar.command = 'extension.live-server++.close';
        this.statusbar.tooltip = 'Click to close server++';
    }
    dispose() {
        this.statusbar.dispose();
    }
}
exports.StatusbarService = StatusbarService;
