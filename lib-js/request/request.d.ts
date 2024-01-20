import { globalOptions as globalOptionsType, requestCallback, requestOptions, requestResponse } from "../types/request";
export declare function request(url: string, options?: requestOptions | typeof requestCallback, callback?: typeof requestCallback, globalOptionsAdd?: globalOptionsType): Promise<requestResponse>;
