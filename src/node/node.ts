import * as d3 from "d3";
import Image from "./image";
import Coordinates from "./coordinates";
import Dimensions from "./dimensions";
import Map from "../map/map";

export default class Node implements NodeProperties, UserNodeProperties {

    map: Map;

    id: string;

    parent: Node;

    name: string;

    k: number;

    dimensions: Dimensions;
    coordinates: Coordinates;

    image: Image;

    backgroundColor: string;
    textColor: string;
    branchColor: string;

    fontSize: number;
    italic: boolean;
    bold: boolean;

    locked: boolean;

    constructor(properties: NodeProperties, userProperties: UserNodeProperties, map: Map) {
        this.map = map;

        this.id = properties.id;
        this.parent = properties.parent;
        this.k = properties.k || d3.randomUniform(-20, 20)();

        this.name = userProperties.name;
        this.dimensions = userProperties.dimensions;
        this.coordinates = userProperties.coordinates || {
            x: this.calculateXposition(),
            y: this.calculateYposition()
        };
        this.backgroundColor = userProperties.backgroundColor;
        this.textColor = userProperties.textColor;
        this.branchColor = userProperties.branchColor;
        this.image = userProperties.image;
        this.fontSize = userProperties.fontSize;
        this.italic = userProperties.italic;
        this.bold = userProperties.bold;
        this.locked = userProperties.locked;
    }

    select() {
        this.map.selectedNode = this;
    }

    // TODO: test
    getLevel(): number {
        let level = 0, parent = this.parent;

        while (parent) {
            level++;
            parent = parent.parent;
        }

        return level;
    }

    getChildren() {
        return this.map.nodes.values().filter(node => node.parent && node.parent.id === this.id);
    }

    /**
     * @name calculateXposition
     * @return {number} x - x coordinate of child node.
     * @desc Return the x coordinate of a node based on parent x coordinate.
     */
    calculateXposition() {
        let or = this.getOrientation(),
            dir = or === true ? -1 : or === false ? 1 :
                this.map.nodes.get(this.map.id + "_node_0").getChildren().length % 2 === 0 ? -1 : 1;
        return this.parent.coordinates.x + 200 * dir;
    }

    /**
     * @name calculateYposition
     * @return {number} y - y coordinate of child node.
     * @desc Return the y coordinate of a node based on parent y coordinate.
     * { To do more sophisticated }
     */
    calculateYposition() {
        return this.parent.coordinates.y - d3.randomUniform(60, 100)();
    }

    /**
     * @name orientation
     * @return {boolean} orientation
     * @desc Return the orientation of a node in the mind map ( true: on left )
     */
    getOrientation(): boolean {
        let root = this.map.nodes.get(this.map.id + "_node_0");

        if (this.coordinates) {
            return this.coordinates.x < root.coordinates.x;
        }
    }

    getProperties(): ExportNodeProperties {
        return {
            id: this.id,
            parent: this.parent ? this.parent.id : null,
            name: this.name,
            k: this.k,
            coordinates: {
                x: this.coordinates.x,
                y: this.coordinates.y
            },
            image: {
                src: this.image.src,
                size: this.image.size
            },
            backgroundColor: this.backgroundColor,
            textColor: this.textColor,
            branchColor: this.branchColor,
            fontSize: this.fontSize,
            italic: this.italic,
            bold: this.bold,
            locked: this.locked
        };
    }

}

export interface UserNodeProperties {
    name?: string;
    dimensions?: Dimensions;
    coordinates?: Coordinates;
    image?: Image;
    backgroundColor?: string;
    textColor?: string;
    branchColor?: string;
    fontSize?: number;
    italic?: boolean;
    bold?: boolean;
    locked?: boolean;
}

export interface NodeProperties {
    id: string;
    parent?: Node;
    k?: number;
}

export interface ExportNodeProperties extends UserNodeProperties {
    id: string;
    parent: string;
    k?: number;
}