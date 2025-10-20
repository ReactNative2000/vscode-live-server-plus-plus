"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const vscode = __importStar(require("vscode"));
const stream_1 = require("stream");
const buffer_1 = require("buffer");
const index_1 = require("./utils/index");
// Stream version
exports.readFileStream = (filePath, encoding) => {
    const dirtyFile = getDirtyFileFromVscode(filePath);
    if (dirtyFile) {
        console.log('[Stream]Reading Dirty file:', filePath);
        const stream = new stream_1.Readable({ encoding });
        setImmediate(() => {
            stream.emit('open');
            stream.push(dirtyFile.getText());
            stream.push(null);
        });
        return stream;
    }
    console.log('[Stream]Reading file from disk: ', filePath);
    return fs.createReadStream(filePath, { encoding });
};
// Promise version -- Most probably will not be used.
exports.readFile = (filePath) => {
    const dirtyFile = getDirtyFileFromVscode(filePath);
    if (dirtyFile) {
        console.log('[Promise]Reading Dirty file: ', filePath);
        return readFileFromVscodeWorkspace(dirtyFile);
    }
    console.log('[Promise]Reading file from disk: ', filePath);
    return readFileFromFileSystem(filePath);
};
const readFileFromVscodeWorkspace = (filePath) => {
    return new Promise(async (resolve, reject) => {
        let doc;
        try {
            if (typeof filePath === 'string') {
                doc = await vscode.workspace.openTextDocument(filePath);
            }
            else {
                doc = filePath;
            }
            const text = doc.getText();
            return resolve(buffer_1.Buffer.from(text));
        }
        catch (error) {
            reject(error);
        }
    });
};
const readFileFromFileSystem = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, function (err, data) {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    });
};
// Private Utils
const getDirtyFileFromVscode = (filePath) => {
    return vscode.workspace.textDocuments.find(doc => doc.isDirty && doc.fileName === filePath && index_1.isSupportedFile(filePath));
};
