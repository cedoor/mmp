import * as d3 from "d3";
import Map from "../map";
import Node from "../models/node";
import {Event} from "./events";

/**
 * Manage the drag events of the nodes.
 */
export default class Drag {

    private map: Map;

    private dragBehavior: any;
    private dragging: boolean;
    private orientation: boolean;
    private descendants: Node[];

    /**
     * Get the associated map instance and initialize the d3 drag behavior.
     * @param {Map} map
     */
    constructor(map: Map) {
        this.map = map;

        this.dragBehavior = d3.drag()
            .on("start", (node: Node) => this.started(node))
            .on("drag", (node: Node) => this.dragged(node))
            .on("end", (node: Node) => this.ended(node));
    }

    /**
     * Return the d3 drag behavior
     * @returns dragBehavior
     */
    public getDragBehavior(): any {
        return this.dragBehavior;
    }

    /**
     * Select the node and calculate node position data for dragging.
     * @param {Node} node
     */
    private started(node: Node) {
        d3.event.sourceEvent.preventDefault();

        this.orientation = this.map.nodes.getOrientation(node);
        this.descendants = this.map.nodes.getDescendants(node);

        this.map.nodes.selectNode(node.id);
    }

    /**
     * Move the dragged node and if it is locked all their descendants.
     * @param {Node} node
     */
    private dragged(node: Node) {
        let dy = d3.event.dy,
            dx = d3.event.dx;

        // Set new coordinates
        let x = node.coordinates.x += dx,
            y = node.coordinates.y += dy;

        // Check if old and new orientation are equal
        let newOrientation = this.map.nodes.getOrientation(node),
            orientationIsChanged = newOrientation !== this.orientation;

        // Move graphically the node in new coordinates
        node.dom.setAttribute("transform", "translate(" + [x, y] + ")");

        // If the node is locked move also descendants
        if (node.locked) {
            let root = node.coordinates;

            for (let node of this.descendants) {
                let x = node.coordinates.x += dx, y = node.coordinates.y += dy;

                if (orientationIsChanged) {
                    x = node.coordinates.x += (root.x - node.coordinates.x) * 2;
                }

                node.dom.setAttribute("transform", "translate(" + [x, y] + ")");
            }

            if (orientationIsChanged) {
                this.orientation = newOrientation;
            }
        }

        // Update all mind map branches
        d3.selectAll("." + this.map.id + "_branch").attr("d", (node: Node) => {
            return <any>this.map.draw.drawBranch(node);
        });

        // This is here and not in the started function because started function
        // is also executed when there is no drag events
        this.dragging = true;
    }

    /**
     * If the node was actually dragged change the state of dragging and save the snapshot.
     * @param {Node} node
     */
    private ended(node: Node) {
        if (this.dragging) {
            this.dragging = false;
            this.map.history.save();
            this.map.events.call(Event.nodeUpdate, node.dom, node.getProperties());
        }
    }

}