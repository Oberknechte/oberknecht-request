import { requestOptions } from "../types/request";
import { RequestCallback } from "request";
export declare function request(url: string, options?: requestOptions | RequestCallback, callback?: RequestCallback): Promise<import("request").Response>;
