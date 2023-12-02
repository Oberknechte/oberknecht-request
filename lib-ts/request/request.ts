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
import axios from "axios";
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
        globalOptions = jsonModifiers.concatJSON([
          globalOptions,
          globalOptionsAdd.options,
        ]);

      if (globalOptionsAdd.delayBetweenRequests)
        delayBetweenRequests = globalOptionsAdd.delayBetweenRequests;

      if (globalOptionsAdd.returnAfter) return resolve({} as Response);
    }

    options_ = jsonModifiers.concatJSON([options_, globalOptions]);

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

    axios[options_.method ?? "get"](url, options_)
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
      } else {
        rd = r.data;
      }

      globalCallbacks.forEach((globalCallback) => {
        globalCallback({
          where: "after",
          url: url,
          options: options_,
          response: rd,
        });
      });

      if (rd) resolve(rd);
      if (callback_) return callback_(e, rd, e ?? rd);
      if (e && !callback_) return reject(e);
    }
  });
}
