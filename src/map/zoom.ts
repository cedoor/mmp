import * as d3 from "d3";
import Map from "./map";

export default class Zoom {

    d3Zoom: any;

    map: Map;

    constructor(map: Map) {
        this.map = map;

        this.d3Zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", () => {
            this.map.dom.g.attr("transform", d3.event.transform);
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
        let root = this.map.nodes.get(this.map.id + "_node_0"),
            x = parseInt(this.map.dom.container.style("width")) / 2 - root.coordinates.x,
            y = parseInt(this.map.dom.container.style("height")) / 2 - root.coordinates.y,
            zoomId = d3.zoomIdentity.translate(x, y);
        this.map.dom.svg.transition().duration(500).call(this.d3Zoom.transform, zoomId);
        this.map.events.call("mmcenter");
    };

    /**
     * @name move
     * @param {boolean} dir - Direction of the zoom
     * @desc Move the zoom in a direction ( true: in, false: out ).
     */
    private move(dir) {
        let k = d3.zoomTransform(this.map.dom.svg.node()).k;
        k += dir ? k / 5 : -k / 5;
        this.d3Zoom.scaleTo(this.map.dom.svg.transition().duration(100), k);
    }

}
