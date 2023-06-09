"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const oberknecht_utils_1 = require("oberknecht-utils");
const worker_threads_1 = require("worker_threads");
const path_1 = __importDefault(require("path"));
function request(url, options, callback) {
    return new Promise((resolve, reject) => {
        if (!(url ?? undefined) && !(options ?? undefined) && !(callback ?? undefined))
            throw Error("url, options and callback are undefined");
        let url_ = (0, oberknecht_utils_1.recreate)(url);
        let options_ = (0, oberknecht_utils_1.recreate)((0, oberknecht_utils_1.extendedTypeof)(options) !== "json" ? {} : options);
        let callback_;
        if ((0, oberknecht_utils_1.extendedTypeof)(callback) === "function")
            callback_ = callback;
        else if ((0, oberknecht_utils_1.extendedTypeof)(options) === "function")
            callback_ = options;
        const w = new worker_threads_1.Worker(path_1.default.resolve(__dirname, "../workers/request.worker"), {
            workerData: {
                url: url_,
                options: options_
            }
        });
        w.on("message", (response_) => {
            let response = JSON.parse(response_);
            let { e, r } = response;
            if (callback_)
                return callback_(e, r, e ?? r);
            if (e)
                return reject(e);
            resolve(r);
        });
    });
}
exports.request = request;
;
