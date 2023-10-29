import { globalOptions as globalOptionsType, requestOptions } from "../types/request";
import { RequestCallback, Response } from "request";
export declare function request(url: string, options?: requestOptions | RequestCallback, callback?: RequestCallback, globalOptionsAdd?: globalOptionsType): Promise<Response>;
