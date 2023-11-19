"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const request_1 = __importDefault(require("request"));
const { url, options } = worker_threads_1.workerData;
try {
    (0, request_1.default)(url, options, (e, r) => {
        worker_threads_1.parentPort.postMessage(JSON.stringify({ e: e, r: r }));
    });
}
catch (e) {
    worker_threads_1.parentPort.postMessage(JSON.stringify({ e: Error("Request failed", { cause: e }), r: undefined }));
}
