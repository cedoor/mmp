import * as d3 from "d3";
import Map from "../map";
import {Event} from "./events";
import {ZoomBehavior} from "d3-zoom";

/**
 * Manage the zoom events of the map.
 */
export default class Zoom {

    private map: Map;

    private zoomBehavior: ZoomBehavior<any, any>;

    /**
     * Get the associated map instance and initialize the d3 zoom behavior.
     * @param {Map} map
     */
    constructor(map: Map) {
        this.map = map;

        this.zoomBehavior = d3.zoom().scaleExtent([0.5, 2]).on("zoom", () => {
            this.map.dom.g.attr("transform", d3.event.transform);
        });
    }

    /**
     * Zoom in the map.
     * @param {number} duration
     */
    public zoomIn = (duration?: number) => {
        this.move(true, duration);
    };

    /**
     * Zoom out the map.
     * @param {number} duration
     */
    public zoomOut = (duration?: number) => {
        this.move(false, duration);
    };

    /**
     * Center the root node in the mind map.
     * @param {number} duration
     * @param {number} type
     */
    public center = (type?: "zoom" | "position", duration: number = 500) => {
        let root = this.map.nodes.getRoot(),
            w = parseInt(this.map.dom.container.style("width")),
            h = parseInt(this.map.dom.container.style("height")),
            x = w / 2 - root.coordinates.x,
            y = h / 2 - root.coordinates.y,
            svg = this.map.dom.svg.transition().duration(duration);

        switch (type) {
            case "zoom":
                this.zoomBehavior.scaleTo(svg, 1);
                break;
            case "position":
                this.zoomBehavior.translateTo(svg, w / 2 -x, h / 2 - y);
                break;
            default:
                this.zoomBehavior.transform(svg, d3.zoomIdentity.translate(x, y));
        }

        this.map.events.call(Event.center);
    };

    /**
     * Return the d3 zoom behavior.
     * @returns {ZoomBehavior} zoom
     */
    public getZoomBehavior(): ZoomBehavior<any, any> {
        return this.zoomBehavior;
    }

    /**
     * Move the zoom in a direction (true: in, false: out).
     * @param {boolean} direction
     * @param {number} duration
     */
    private move(direction: boolean, duration: number = 50) {
        let svg = this.map.dom.svg.transition().duration(duration);

        this.zoomBehavior.scaleBy(svg, direction ? 4/3 : 3/4);
    }

}
