import { extendedTypeof, recreate } from "oberknecht-utils";
import { globalCallbackOptions, requestOptions } from "../types/request";
import { Worker } from "worker_threads";
import path from "path";
import { RequestCallback, RequestResponse } from "request";
let globalCallbacks: Function[] = [];

export function request(
  url: string,
  options?: requestOptions | RequestCallback,
  callback?: RequestCallback,
  globalCallbackOptions?: globalCallbackOptions
) {
  if (globalCallbackOptions) {
    if (globalCallbackOptions.callback)
      globalCallbacks.push(globalCallbackOptions.callback);

    if (globalCallbackOptions.returnAfter) return;
  }

  return new Promise<RequestResponse>((resolve, reject) => {
    if (
      !(url ?? undefined) &&
      !(options ?? undefined) &&
      !(callback ?? undefined)
    )
      throw Error("url, options and callback are undefined");

    let url_ = recreate(url);
    let options_ = recreate(extendedTypeof(options) !== "json" ? {} : options);
    let callback_: RequestCallback;

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
