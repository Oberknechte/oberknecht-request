"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
// import { RequestCallback, RequestResponse, Response } from "request";
const axios_1 = __importDefault(require("axios"));
let globalCallbacks = [];
let globalOptions = {};
let requestTimes = [];
let delayBetweenRequests = 0;
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
                globalOptions = oberknecht_utils_1.jsonModifiers.concatJSON([
                    globalOptions,
                    globalOptionsAdd.options,
                ]);
            if (globalOptionsAdd.delayBetweenRequests)
                delayBetweenRequests = globalOptionsAdd.delayBetweenRequests;
            if (globalOptionsAdd.returnAfter)
                return resolve({});
        }
        options_ = oberknecht_utils_1.jsonModifiers.concatJSON([
            options_,
            globalOptions,
        ]);
        if ((delayBetweenRequests ?? 0) > 0) {
            if (requestTimes.length > 1 &&
                Date.now() - requestTimes.at(-2) < delayBetweenRequests)
                await (0, oberknecht_utils_1.sleep)(delayBetweenRequests *
                    requestTimes
                        .slice(0, -2)
                        .filter((a) => Date.now() - a < delayBetweenRequests).length);
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
        axios_1.default[axios_1.default?.[options_?.method?.toLowerCase?.()] ? options_.method.toLowerCase() : "get"](url, options_)
            .then((r) => {
            cb(r);
        })
            .catch((e) => {
            cb(e);
        });
        function cb(r) {
            let e;
            let rd;
            if (r instanceof Error) {
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
        /**
          const w = new Worker(path.resolve(__dirname, "../workers/request.worker"), {
            workerData: {
              url: url_,
              options: options_,
            },
          });
        
          w.on("message", (response_) => {
            let response = JSON.parse(response_);
            let { e, r } = response;
          
            globalCallbacks.forEach((globalCallback) => {
              globalCallback({
                where: "after",
                url: url,
                options: options_,
                response: r,
                error: e,
              });
            });
          
            w.terminate();
            resolve(r);
            if (callback_) return callback_(e, r, e ?? r);
            if (e) return reject(e);
          });
         */
    });
}
exports.request = request;
