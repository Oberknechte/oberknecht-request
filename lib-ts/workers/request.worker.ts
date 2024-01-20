import { parentPort, workerData } from "worker_threads";
import axios from "axios";
import { filterByKeys } from "oberknecht-utils";

const { options, method, funcArgs } = workerData;
try {
  axios[method](...funcArgs)
    .then((r) => {
      let r_ = filterByKeys(r, [
        "config",
        "data",
        "headers",
        "status",
        "statusText",
      ]);
      parentPort.postMessage(JSON.stringify({ r: r_ }));
    })
    .catch((e) => {
      parentPort.postMessage(JSON.stringify({ e: e }));
    });
} catch (e) {
  parentPort.postMessage(
    JSON.stringify({ e: Error("Request failed", { cause: e }) })
  );
}
