"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const axios_1 = __importDefault(require("axios"));
const oberknecht_utils_1 = require("oberknecht-utils");
worker_threads_1.parentPort.on("message", (r) => {
    let requestData = JSON.parse(r);
    const { method, funcArgs, id } = requestData;
    try {
        axios_1.default[method](...funcArgs)
            .then((r) => {
            let r_ = (0, oberknecht_utils_1.filterByKeys)(r, [
                "config",
                "data",
                "headers",
                "status",
                "statusText",
            ]);
            worker_threads_1.parentPort.postMessage(JSON.stringify({ id: id, r: r_ }));
        })
            .catch((e) => {
            worker_threads_1.parentPort.postMessage(JSON.stringify({ id: id, e: e }));
        });
    }
    catch (e) {
        worker_threads_1.parentPort.postMessage(JSON.stringify({ id: id, e: Error("Request failed", { cause: e }) }));
    }
});
