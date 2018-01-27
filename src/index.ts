import {OptionParameters} from "./map/options";
import * as pkg from "../package.json";
import Map, {MmpInstance} from "./map/map";

/**
 * The version of the library
 */
export let version = (<any>pkg).version;

/**
 * Return a mmp object with all mmp functions.
 * @param {string} id
 * @param {OptionParameters} options
 * @returns {Map}
 */
export function create(id: string, options?: OptionParameters) {
    return new Map(id, options);
}
