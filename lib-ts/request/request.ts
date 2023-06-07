import { extendedTypeof, recreate } from "oberknecht-utils";
import { requestCallback, requestOptions } from "../types/request";
import { Worker } from "worker_threads";
import path from "path";
import { RequestResponse } from "request";

export function request(url: string, options: requestOptions | typeof requestCallback, callback?: typeof requestCallback) {
    return new Promise<RequestResponse>((resolve, reject) => {
        if (!(url ?? undefined) && !(options ?? undefined) && !(callback ?? undefined)) throw Error("url, options and callback are undefined");

        let url_ = recreate(url);
        let options_ = recreate(extendedTypeof(options) !== "json" ? {} : options);
        let callback_: typeof requestCallback;

        if (extendedTypeof(callback) === "function") callback_ = callback as typeof requestCallback; else if (extendedTypeof(options) === "function") callback_ = options as typeof requestCallback;

        const w = new Worker(path.resolve(__dirname, "../workers/request.worker"), {
            workerData: {
                url: url_,
                options: options_
            }
        });

        w.on("message", (response_) => {
            let response = JSON.parse(response_);
            let { e, r } = response;

            if (callback_) return callback_(e, r, e ?? r);
            if (e) return reject(e);
            resolve(r);
        });
    });
};