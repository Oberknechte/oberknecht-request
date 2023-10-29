import {
  extendedTypeof,
  jsonModifiers,
  recreate,
  sleep,
} from "oberknecht-utils";
import {
  globalOptions as globalOptionsType,
  requestOptions,
} from "../types/request";
import { Worker } from "worker_threads";
import path from "path";
import { RequestCallback, RequestResponse, Response } from "request";
let globalCallbacks: Function[] = [];
let globalOptions = {};
let requestTimes = [];
let delayBetweenRequests = 0;
let requestNum = -1;

export function request(
  url: string,
  options?: requestOptions | RequestCallback,
  callback?: RequestCallback,
  globalOptionsAdd?: globalOptionsType
) {
  const myRequestNum = requestNum++;
  return new Promise<RequestResponse>(async (resolve, reject) => {
    if (
      !(url ?? undefined) &&
      !(options ?? undefined) &&
      !(callback ?? undefined) &&
      !globalOptionsAdd
    )
      throw Error("url, options and callback are undefined");

    requestTimes = requestTimes.slice(0, 50);
    requestTimes.push(Date.now());

    let url_ = recreate(url);
    let options_: requestOptions = recreate(
      extendedTypeof(options) !== "json" ? {} : options
    );
    let callback_: RequestCallback;

    if (globalOptionsAdd) {
      if (globalOptionsAdd.callbackOptions?.callback)
        globalCallbacks.push(globalOptionsAdd.callbackOptions.callback);

      if (globalOptionsAdd.options)
        jsonModifiers.concatJSON([globalOptions, globalOptionsAdd.options]);

      if (globalOptionsAdd.delayBetweenRequests)
        delayBetweenRequests = globalOptionsAdd.delayBetweenRequests;

      if (globalOptionsAdd.returnAfter) return resolve({} as Response);
    }

    jsonModifiers.concatJSON([options_, globalOptions]);

    if ((delayBetweenRequests ?? 0) > 0) {
      if (
        requestTimes.length > 1 &&
        Date.now() - requestTimes.at(-2) < delayBetweenRequests
      )
        await sleep(
          delayBetweenRequests *
            requestTimes
              .slice(0, -2)
              .filter((a) => Date.now() - a < delayBetweenRequests).length
        );
    }

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
