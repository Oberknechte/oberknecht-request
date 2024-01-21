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
                .filter((a) => ["delayBetweenRequests", "returnOriginalResponse"].includes(a))
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
            const w = new worker_threads_1.Worker(path_1.default.resolve(__dirname, "../workers/request.worker"), {
                workerData: {
                    url: url_,
                    method: method,
                    funcArgs: axiosFuncArgs,
                },
            });
            w.on("message", (response_) => {
                let response = JSON.parse(response_);
                let { e, r } = response;
                cb(r ?? e);
                w.terminate();
            });
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
