"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const axios_1 = __importDefault(require("axios"));
const { url, options } = worker_threads_1.workerData;
try {
    axios_1.default[options.method?.toLowerCase?.() ?? "get"](url, options)
        .then((r) => {
        worker_threads_1.parentPort.postMessage(JSON.stringify({ r: r.data }));
    })
        .catch((e) => {
        worker_threads_1.parentPort.postMessage(JSON.stringify({ e: e }));
    });
}
catch (e) {
    worker_threads_1.parentPort.postMessage(JSON.stringify({ e: Error("Request failed", { cause: e }) }));
}
