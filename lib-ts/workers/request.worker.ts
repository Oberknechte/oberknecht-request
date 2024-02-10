import { parentPort, workerData } from "worker_threads";
import axios from "axios";
import { filterByKeys } from "oberknecht-utils";

parentPort.on("message", (r) => {
  let requestData = r;
  const { method, funcArgs, id } = requestData;
  try {
    axios[method](...funcArgs)
      .then((r) => {
        let r_: Record<string, any> = filterByKeys(r, [
          "config",
          "data",
          "headers",
          "status",
          "statusText",
        ]);

        parentPort.postMessage({ id: id, r: r_ });
      })
      .catch((e) => {
        parentPort.postMessage({ id: id, e: e });
      });
  } catch (e) {
    parentPort.postMessage({
      id: id,
      e: Error("Request failed", { cause: e }),
    });
  }
});
