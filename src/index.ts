import {OptionParameters} from "./map/options";
import * as pkg from "../package.json";
import Map from "./map/map";

// mmp version
export let version = (<any>pkg).version;

// mmp instance
export function create(id: string, options?: OptionParameters) {
    return new Map(id, options);
}
