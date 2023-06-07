import { parentPort, workerData } from "worker_threads";
import request from "request";

const { url, options } = workerData;
request(url, options, (e, r) => {
    parentPort.postMessage(JSON.stringify({ "e": e, "r": r }));
});