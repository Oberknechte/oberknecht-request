/// <reference types="request" />
import { requestCallback, requestOptions } from "../types/request";
export declare function request(url: string, options: requestOptions | typeof requestCallback, callback?: typeof requestCallback): Promise<import("request").Response>;
