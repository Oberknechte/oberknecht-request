import { globalCallbackOptions, requestOptions } from "../types/request";
import { RequestCallback } from "request";
export declare function request(url: string, options?: requestOptions | RequestCallback, callback?: RequestCallback, globalCallbackOptions?: globalCallbackOptions): Promise<import("request").Response>;
