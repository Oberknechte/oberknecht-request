import { globalOptions as globalOptionsType, requestCallback, requestOptions } from "../types/request";
import axios from "axios";
export declare function request(url: string, options?: requestOptions | typeof requestCallback, callback?: typeof requestCallback, globalOptionsAdd?: globalOptionsType): Promise<axios.AxiosResponse<any, any>>;
