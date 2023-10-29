import { extendedTypeof, jsonModifiers, recreate } from "oberknecht-utils";
import {
  globalOptions as globalOptionsType,
  requestOptions,
} from "../types/request";
import { Worker } from "worker_threads";
import path from "path";
import { RequestCallback, RequestResponse, Response } from "request";
let globalCallbacks: Function[] = [];
let globalOptions = {};

export function request(
  url: string,
  options?: requestOptions | RequestCallback,
  callback?: RequestCallback,
  globalOptionsAdd?: globalOptionsType
) {
  return new Promise<RequestResponse>((resolve, reject) => {
    if (
      !(url ?? undefined) &&
      !(options ?? undefined) &&
      !(callback ?? undefined) &&
      !globalOptionsAdd
    )
      throw Error("url, options and callback are undefined");

    let url_ = recreate(url);
    let options_ = recreate(extendedTypeof(options) !== "json" ? {} : options);
    let callback_: RequestCallback;

    if (globalOptionsAdd) {
      if (globalOptionsAdd.callbackOptions?.callback)
        globalCallbacks.push(globalOptionsAdd.callbackOptions.callback);

      if (globalOptionsAdd.options)
        jsonModifiers.concatJSON([globalOptions, globalOptionsAdd.options]);

      if (globalOptionsAdd.returnAfter) return resolve({} as Response);
    }

    jsonModifiers.concatJSON([options_, globalOptions]);

    if (extendedTypeof(callback) === "function")
      callback_ = callback as RequestCallback;
    else if (extendedTypeof(options) === "function")
      callback_ = options as RequestCallback;

    globalCallbacks.forEach((globalCallback) => {
      globalCallback({
        where: "before",
        url: url,
        options: options_,
      });
    });

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
  });
}
