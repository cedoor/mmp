import * as d3 from "d3";
import Utils from "../other/utils";
import Global from "../global";
import Events from "../other/events";
import * as node from "./index";

/**
 * @name select
 * @param {string} [key] - The key of node to select.
 * @return {Object} [node] - The selected node.
 * @desc Select a node or return the selected node.
 */
export function select(key) {
    const s = Global.selected;
    if (typeof key === "string")
        if (Global.nodes.has(key)) {
            let dom = node.getDom(key), bg = dom.childNodes[0];
            if ((<any>bg).style["stroke"].length === 0) {
                if (s && Global.nodes.has(s)) node.stroke(s, "");
                const color = d3.color((<any>bg).style["fill"]).darker(.5);
                (<any>bg).style["stroke"] = color;
                Global.selected = key;
                Events.call("nodeselect", dom, key, Global.nodes.get(key));
            }
        } else Utils.error("The node with the key " + key + " don't exist");
    else return {
        key: s, value: Utils.cloneObject(Global.nodes.get(s))
    };
}

/**
 * @name clear
 * @desc Deselect current node and select the root without stroke.
 */
export function deselect() {
    select("node0");
    node.stroke("node0", "");
}

/**
 * @name selectTo
 * @param {string} dir - Direction ( up, down, left, right ).
 * @desc Move the node selection in the direction passed as parameter.
 */
export function selectTo(dir) {
    const d = dir === "up" || dir === "left";
    if (dir === "up" || dir === "down") moveSelectionOnLevel(d);
    else moveSelectionOnBranch(d);
}

/**
 * @name moveSelectionOnLevel
 * @param {string} dir - Direction ( up, down ).
 * @desc Move the node selection on the level of the current node.
 */
function moveSelectionOnLevel(dir) {
    let sel = Global.nodes.get(Global.selected),
        lev = node.getLevel(sel), or = node.orientation(sel.x),
        key, tmp = Number.MAX_VALUE;
    Global.nodes.each(function (n, k) {
        let d = dir ? sel.y - n.y : n.y - sel.y;
        if (
            lev === node.getLevel(n) && Global.selected !== k &&
            or === node.orientation(n.x) &&
            d > 0 && d < tmp
        ) {
            tmp = d;
            key = k;
        }
    });
    if (key !== undefined) node.select(key);
}

/**
 * @name moveSelectionOnLevel
 * @param {string} dir - Direction ( left, right ).
 * @desc Move the node selection in a child node or in the parent node.
 */
function moveSelectionOnBranch(dir) {
    let sel = Global.nodes.get(Global.selected),
        root = Global.nodes.get("node0"),
        key, checks, tmp = Number.MIN_VALUE;
    Global.nodes.each(function (n, k) {
        if (sel.x < root.x)
            checks = dir ? n.parent === Global.selected : sel.parent === k;
        else if (sel.x > root.x)
            checks = !dir ? n.parent === Global.selected : sel.parent === k;
        else
            checks = (dir ? n.x < root.x : n.x > root.x) && n.parent === Global.selected;
        if (checks && n.y > tmp) {
            tmp = n.y;
            key = k;
        }
    });
    if (key !== undefined) node.select(key);
}
