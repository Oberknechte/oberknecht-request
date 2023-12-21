import { parentPort, workerData } from "worker_threads";
import axios from "axios";

const { url, options } = workerData;
try {
  axios[options.method?.toLowerCase?.() ?? "get"](url, options)
    .then((r) => {
      parentPort.postMessage(JSON.stringify({ r: r.data }));
    })
    .catch((e) => {
      parentPort.postMessage(JSON.stringify({ e: e }));
    });
} catch (e) {
  parentPort.postMessage(
    JSON.stringify({ e: Error("Request failed", { cause: e }) })
  );
}
