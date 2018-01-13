import glob from "../global";
import {addRoot} from "../node";
import Events from "../other/events";
import * as map from "./index";

/**
 * @name reset
 * @desc Replace old mind map with a new one.
 */
export function reset() {
    glob.counter = 0;
    glob.nodes.clear();
    map.redraw();
    Events.call("mmcreate", glob.container.node());
    addRoot();
    map.center();
    map.save();
}
