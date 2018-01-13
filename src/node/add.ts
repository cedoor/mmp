import Global from "../global";
import Events from "../other/events";
import * as map from "../map/index";
import * as node from "./index";

/**
 * @name add
 * @return {Object} prop - The properties of node.
 * @desc Add a child node to selected node.
 */
export function add(prop) {
    let parent = Global.nodes.get(Global.selected),
        key = "node" + (++Global.counter),
        opt = Global.options.node,
        value = (<any>Object).assign({}, {
            "name": prop && prop["name"] || opt["name"],
            "background-color": prop && prop["background-color"] || opt["background-color"],
            "text-color": prop && prop["text-color"] || opt["text-color"],
            "branch-color": prop && prop["branch-color"] || parent["branch-color"] || opt["branch-color"],
            "image-src": prop && prop["image-src"] || opt["image-src"],
            "image-size": prop && prop["image-size"] || opt["image-size"],
            "font-size": prop && prop["font-size"] || opt["font-size"],
            "italic": prop && prop["italic"] || opt["italic"],
            "bold": prop && prop["bold"] || opt["bold"],
            "fixed": prop && prop["fixed"] || opt["fixed"],
            "x": prop && prop.x || node.calcX(parent.x),
            "y": prop && prop.y || node.calcY(parent.y),
            "parent": Global.selected
        });
    addToMap(key, value);
}

/**
 * @name addRoot
 * @desc Add the root node in the mind map.
 */
export function addRoot() {
    let value = (<any>Object).assign({
        x: parseInt(Global.container.style("width")) / 2,
        y: parseInt(Global.container.style("height")) / 2
    }, Global.options["root-node"]);
    addToMap("node" + Global.counter, value);
    node.deselect();
}

/**
 * @name addToMap
 * @param {string} k - The key of node.
 * @param {Object} v - The value of node.
 * @desc Add a node in the mind map.
 */
function addToMap(k, v) {
    Global.nodes.set(k, v);
    map.update();
    map.save();
    Events.call("nodecreate", node.getDom(k), k, v);
}
