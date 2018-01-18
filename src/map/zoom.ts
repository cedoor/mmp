import * as d3 from "d3";
import Events from "./events";
import Map, {DomElements} from "./map";
import Node from "../node/node";
import {Map as D3Map} from "d3-collection";

export default class Zoom {

    d3Zoom: any;
    map: Map;
    dom: DomElements;
    events: Events;
    nodes: D3Map<Node>;

    constructor(map: Map) {
        this.map = map;
        this.dom = map.dom;
        this.events = map.events;
        this.nodes = map.nodes;

        this.d3Zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", () => {
            this.dom.g.attr("transform", d3.event.transform);
        });
    }

    /**
     * @name zoomIn
     */
    public zoomIn = () => {
        this.move(true);
    };

    /**
     * @name zoomOut
     */
    public zoomOut = () => {
        this.move(false);
    };

    /**
     * @name center
     * @desc Center the root node in the mind map.
     */
    public center = () => {
        let root = this.nodes.get(this.map.id + "_node_0"),
            x = parseInt(this.dom.container.style("width")) / 2 - root.coordinates.x,
            y = parseInt(this.dom.container.style("height")) / 2 - root.coordinates.y,
            zoomId = d3.zoomIdentity.translate(x, y);
        this.dom.svg.transition().duration(500).call(this.d3Zoom.transform, zoomId);
        this.events.call("mmcenter");
    };

    /**
     * @name move
     * @param {boolean} dir - Direction of the zoom
     * @desc Move the zoom in a direction ( true: in, false: out ).
     */
    private move(dir) {
        let k = d3.zoomTransform(this.dom.svg.node()).k;
        k += dir ? k / 5 : -k / 5;
        this.d3Zoom.scaleTo(this.dom.svg.transition().duration(100), k);
    }

}
