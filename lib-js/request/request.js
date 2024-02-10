"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
let globalCallbacks = [];
// @ts-ignore
let globalOptions = { options: {} };
let requestTimes = [];
let requestNum = -1;
let workers = {};
// {worker: <Worker>, num: <number>, callback: <Function>}[]
let callbacks = {};
let num = 0;
let workerNum = 0;
let closeCheckIntervals = {};
function request(url, options, callback, globalOptionsAdd) {
    const myRequestNum = requestNum++;
    return new Promise(async (resolve, reject) => {
        if (!(url ?? undefined) &&
            !(options ?? undefined) &&
            !(callback ?? undefined) &&
            !globalOptionsAdd)
            throw Error("url, options and callback are undefined");
        requestTimes = requestTimes.slice(0, 50);
        requestTimes.push(Date.now());
        let url_ = (0, oberknecht_utils_1.recreate)(url);
        let options_ = (0, oberknecht_utils_1.recreate)((0, oberknecht_utils_1.extendedTypeof)(options) !== "json" ? {} : options);
        let callback_;
        if (globalOptionsAdd) {
            if (globalOptionsAdd.callbackOptions?.callback)
                globalCallbacks.push(globalOptionsAdd.callbackOptions.callback);
            if (globalOptionsAdd.options)
                globalOptions.options = oberknecht_utils_1.jsonModifiers.concatJSON([
                    globalOptions.options,
                    globalOptionsAdd.options,
                ]);
            Object.keys(globalOptionsAdd)
                // .filter((a) =>
                //   ["delayBetweenRequests", "returnOriginalResponse"].includes(a)
                // )
                .forEach((a) => {
                globalOptions[a] = globalOptionsAdd[a];
            });
            if (globalOptionsAdd.returnAfter)
                return resolve({});
        }
        options_ = oberknecht_utils_1.jsonModifiers.concatJSON([
            options_,
            globalOptions.options,
        ]);
        if ((globalOptions.delayBetweenRequests ?? 0) > 0) {
            if (requestTimes.length > 1 &&
                Date.now() - requestTimes.at(-2) < globalOptions.delayBetweenRequests)
                await (0, oberknecht_utils_1.sleep)(globalOptions.delayBetweenRequests *
                    requestTimes
                        .slice(0, -2)
                        .filter((a) => Date.now() - a < globalOptions.delayBetweenRequests).length);
        }
        if ((0, oberknecht_utils_1.extendedTypeof)(callback) === "function")
            callback_ = callback;
        else if ((0, oberknecht_utils_1.extendedTypeof)(options) === "function")
            callback_ = options;
        globalCallbacks.forEach((globalCallback) => {
            globalCallback({
                where: "before",
                url: url,
                options: options_,
            });
        });
        let method = axios_1.default?.[options_?.method?.toLowerCase?.()]
            ? options_.method.toLowerCase()
            : "get";
        let axiosFuncArgs;
        switch (method) {
            case "patch":
            case "put":
            case "post": {
                let body = options_.body;
                if (body)
                    delete options_.body;
                axiosFuncArgs = [url, body, options_];
                break;
            }
            default: {
                axiosFuncArgs = [url, options_];
            }
        }
        if (globalOptions.noWorker) {
            axios_1.default[method](...axiosFuncArgs)
                .then((r) => {
                cb(r);
            })
                .catch((e) => {
                cb(e);
            });
        }
        else {
            const id = (num++).toString();
            let workerID = Object.keys(workers).filter((a) => Object.keys(workers[a].ids ?? {}).length <=
                (globalOptions.maxRequestsPerWorker ?? 100))[0];
            let workerDat = workers?.[workerID];
            if (!workerID) {
                workerID = (workerNum++).toString();
                workerDat = workers[workerID] = {
                    worker: new worker_threads_1.Worker(path_1.default.resolve(__dirname, "../workers/request.worker"), {}),
                    ids: {},
                    callback: (response_) => {
                        let response = JSON.parse(response_);
                        let { e, r } = response;
                        if (workerDat.ids[response.id])
                            delete workerDat.ids[response.id];
                        if (callbacks[response.id])
                            callbacks[response.id]?.(r ?? e), delete callbacks[response.id];
                        if (!closeCheckIntervals[workerID])
                            closeCheckIntervals[workerID] = setInterval(() => {
                                checkCloseWorker(workerDat, workerID);
                            }, globalOptions.checkCloseWorkerInterval ?? 3000);
                    },
                };
                workerDat.worker.on("message", (a) => {
                    workerDat.callback(a);
                });
            }
            workerDat.ids[id] = {};
            callbacks[id] = cb;
            sendWait(workerDat, id, url_, method, axiosFuncArgs);
        }
        function cb(r) {
            let e;
            let rd;
            if (r instanceof Error || r.stack) {
                e = r;
                r = undefined;
            }
            else {
                rd = globalOptions.returnOriginalResponse ? r : r.data;
            }
            globalCallbacks.forEach((globalCallback) => {
                globalCallback({
                    where: "after",
                    url: url,
                    options: options_,
                    response: rd,
                });
            });
            if (rd)
                resolve(rd);
            if (callback_)
                return callback_(e, rd, e ?? rd);
            if (e && !callback_)
                return reject(e);
        }
    });
}
exports.request = request;
function sendWait(workerDat, id, url, method, funcArgs) {
    workerDat.worker.postMessage(JSON.stringify({
        id: id,
        url: url,
        method: method,
        funcArgs: funcArgs,
    }));
}
function checkCloseWorker(workerDat, workerID) {
    if (Object.keys(workerDat.ids).length === 0 &&
        Object.keys(workers).length > (globalOptions.keepWorkerActiveNum ?? 0)) {
        workerDat.worker
            .terminate()
            .finally(() => {
            clearInterval(closeCheckIntervals[workerID]);
            delete workers[workerID];
        })
            .catch(() => { });
    }
}
