import * as d3 from "d3";
import Map from "../map/map";
import Node from "./node";
import Events from "../map/events";
import History from "../map/history";

export default class Drag {

    D3Drag: any;
    dragging: boolean;

    map: Map;
    history: History;
    events: Events;

    constructor(map: Map) {
        this.map = map;
        this.history = map.history;
        this.events = map.events;

        this.D3Drag = d3.drag()
            .on("start", (e: any) => this.started(e.value))
            .on("drag", (e: any) => this.dragged(e.value))
            .on("end", (e: any) => this.ended(e.value));
    }

    /**
     * @name started
     * @param {Node} node - Mind map node.
     * @desc
     * Select the node.
     */
    started(node: Node) {
        d3.event.sourceEvent.preventDefault();
        node.select();
    }

    /**
     * @name dragged
     * @param {Node} node - Mind map node.
     * @desc
     * Move the node dragged and if it isn't fixed all subnodes.
     */
    dragged(node: Node) {
        // const dy = d3.event.dy, dx = d3.event.dx,
        //     // Set new coordinates and save them
        //     x = node.coordinates.x += dx, y = node.coordinates.y += dy,
        //     // Check if old and new orientation are equal
        //     c = node.orientation(x) === node.orientation(x - dx);
        // // Move graphically the node in new coordinates
        // this.setAttribute("transform", "translate(" + [x, y] + ")");
        // // If the node isn't fixed move also subnodes
        // if (n.value.fixed) {
        //     let parent = n;
        //     node.subnodes(n.key, function (n) {
        //         const x = n.x += dx, y = n.y += dy;
        //         // If c is false change the orientation of subnodes
        //         if (!c) n.x += (parent.value.x - n.x) * 2;
        //         this.setAttribute("transform", "translate(" + [x, y] + ")");
        //     });
        // }
        // // Update all mind map branches
        // d3.selectAll(".branch").attr("d", node => new BranchShape(node).draw());
        // This is here and not in started function
        // because started function is also executed
        // when there is no drag events
        this.dragging = true;
    }

    /**
     * @name ended
     * @param {Node} node - Mind map node.
     * @desc
     * If the node was actually dragged change global value
     * and save the snapshot.
     */
    ended(node: Node) {
        if (this.dragging) {
            this.dragging = false;
            this.history.save();
            this.events.call("nodeupdate", this, node.id, node, "position");
        }
    }

}