import * as d3 from "d3";
import Map from "../map/map";
import Node from "./node";
import BranchShape from "../shapes/branch";

export default class Drag {

    D3Drag: any;
    dragging: boolean;
    orientation: boolean;
    descendants: Node[];

    map: Map;

    constructor(map: Map) {
        this.map = map;

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

        this.orientation = node.getOrientation();
        this.descendants = node.getDescendants();

        node.select();
    }

    /**
     * @name dragged
     * @param {Node} node - Mind map node.
     * @desc
     * Move the node dragged and if it isn't fixed all subnodes.
     */
    dragged(node: Node) {
        let dy = d3.event.dy,
            dx = d3.event.dx;

        // Set new coordinates
        let x = node.coordinates.x += dx,
            y = node.coordinates.y += dy;

        // Check if old and new orientation are equal
        let newOrientation = node.getOrientation(),
            orientationIsChanged = newOrientation !== this.orientation;

        // Move graphically the node in new coordinates
        node.dom.setAttribute("transform", "translate(" + [x, y] + ")");

        // If the node is locked move also descendants
        if (node.locked) {
            let descendingX = node.coordinates.x;

            for (let node of this.descendants) {
                let x = node.coordinates.x += dx, y = node.coordinates.y += dy;

                if (orientationIsChanged) {
                    x = node.coordinates.x += (descendingX - node.coordinates.x) * 2;
                }

                node.dom.setAttribute("transform", "translate(" + [x, y] + ")");
            }

            if (orientationIsChanged) {
                this.orientation = newOrientation;
            }
        }
        // Update all mind map branches
        d3.selectAll("." + this.map.id + "_branch").attr("d", function (node: any) {
            return new BranchShape(node.value).draw();
        });
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
            this.map.history.save();
            this.map.events.call("nodeupdate", node.dom, node.id, node.getProperties(), "position");
        }
    }

}