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
const path = __importStar(require("path"));
const extensionConfig_1 = require("./extensionConfig");
exports.workspaceUtils = {
    get activeWorkspace() {
        const workspaces = vscode.workspace.workspaceFolders;
        if (workspaces && workspaces.length) {
            return workspaces[0];
        }
        return null;
    },
    getActiveDoc({ relativeToWorkSpace = true } = {}) {
        const { activeTextEditor } = vscode.window;
        if (!this.activeWorkspace || !activeTextEditor)
            return null;
        const activeDocUrl = activeTextEditor.document.uri.fsPath;
        const workspaceUrl = this.activeWorkspace.uri.fsPath;
        const isParentPath = isParent(workspaceUrl).of(activeDocUrl);
        if (!isParentPath)
            return null;
        return relativeToWorkSpace ? activeDocUrl.replace(this.cwd, '') : activeDocUrl;
    },
    get cwd() {
        const workspace = this.activeWorkspace;
        if (workspace) {
            return path.join(workspace.uri.fsPath, extensionConfig_1.extensionConfig.root.get());
        }
        return null;
    }
};
function isParent(parentPath) {
    return {
        of: (childPath) => {
            return childPath.startsWith(parentPath);
        }
    };
}
