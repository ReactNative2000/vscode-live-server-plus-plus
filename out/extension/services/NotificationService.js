"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const showPopUpMsg_1 = require("../utils/showPopUpMsg");
class NotificationService {
    constructor(liveServerPlusPlus) {
        this.liveServerPlusPlus = liveServerPlusPlus;
    }
    register() {
        this.liveServerPlusPlus.onDidGoLive(this.showLSPPOpened.bind(this));
        this.liveServerPlusPlus.onDidGoOffline(this.showLSPPClosed.bind(this));
        this.liveServerPlusPlus.onServerError(this.showServerErrorMsg.bind(this));
    }
    showLSPPOpened(event) {
        showPopUpMsg_1.showPopUpMsg(`Server is started at ${event.LSPP.port}`);
    }
    showLSPPClosed(event) {
        showPopUpMsg_1.showPopUpMsg(`Server is closed`);
    }
    showServerErrorMsg(event) {
        if (event.code === 'serverIsAlreadyRunning') {
            //shhhh! keep silent. bcz we'll open the browser with running port :D
            return;
        }
        if (event.code === 'cwdUndefined') {
            return showPopUpMsg_1.showPopUpMsg('Please open a workspace', { msgType: 'error' });
        }
        showPopUpMsg_1.showPopUpMsg(event.message || 'Something went wrong', { msgType: 'error' });
    }
}
exports.NotificationService = NotificationService;
