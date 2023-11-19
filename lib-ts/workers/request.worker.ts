import { parentPort, workerData } from "worker_threads";
import request from "request";

const { url, options } = workerData;
try {
  request(url, options, (e, r) => {
    parentPort.postMessage(JSON.stringify({ e: e, r: r }));
  });
} catch (e) {
  parentPort.postMessage(
    JSON.stringify({ e: Error("Request failed", { cause: e }), r: undefined })
  );
}
