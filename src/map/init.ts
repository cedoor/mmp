import * as d3 from "d3";
import Global from "../global";
import Events from "../other/events";
import {center, zoom} from ".";
import {addRoot, deselect} from "../node";
import Utils from "../other/utils";

/**
 * @name init
 * @param {Object} options - Mind map options.
 * @param {string} selector - Html id value of mind map container.
 * @desc Initial mmp function, set all parameters of the map.
 */
export function init(selector, options) {

    // Create a backup of original global options
    // Global.backup = Utils.cloneObject(Global, true);

    Global.svg = Global.history = {};

    Global.options = {
        "font-family": "Arial, Helvetica, sans-serif",
        "center-onresize": true,
        "drag": true,
        "zoom": true,
        // Default node properties
        "node": {
            // Variable values
            "name": "Node",
            "background-color": "#f9f9f9",
            "text-color": "#808080",
            "branch-color": "#c2d7aa",
            "image-src": "",
            "image-size": 60,
            "font-size": 16,
            "italic": false,
            "bold": false,
            "fixed": true,
            // Common constant values
            "padding": [30, 45]
        },
        // Default root node properties
        "root-node": {
            "name": "Root node",
            "background-color": "#f0f6f5",
            "text-color": "#828c82",
            "image-src": "",
            "image-size": 70,
            "font-size": 20,
            "italic": false,
            "bold": false,
            "fixed": false
        }
    };

    // If there are external options, then update the default options
    if (options !== undefined)
        options.constructor === Object
            ? Utils.overwriteObject(Global.options, options)
            : Utils.error("mmp options are invalid");

    // Set the view of the map
    Global.container = d3.select("#" + selector).style("position", "relative");
    Global.svg.main = Global.container.append("svg").style("position", "absolute")
        .style("width", "100%").style("height", "100%")
        .style("top", 0).style("left", 0);
    Global.svg.main.append("rect")
        .attr("width", "100%").attr("height", "100%")
        .attr("fill", "white")
        .attr("pointer-events", "all")
        .on("click", deselect);
    Global.svg.mmp = Global.svg.main.append("g");

    Global.nodes = d3.map(); // Set d3 map to manage the nodes of mind map
    Global.counter = 0; // Set a global counter for the identity of nodes
    Global.history.index = -1; // Set history mmp settings to manage the snapshots
    Global.history.snapshots = [];

    // Set the optional settings
    if (Global.options["center-onresize"] === true) onresize = center;
    if (Global.options["zoom"] === true) Global.svg.main.call(zoom);

    Events.call("mmcreate", Global.container.node());
    addRoot();
}
