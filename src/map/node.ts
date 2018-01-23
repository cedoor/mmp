import * as d3 from "d3";
import Map from "./map";

export default class Node implements NodeProperties, UserNodeProperties {

    map: Map;

    id: string;
    parent: Node;
    k: number;
    dom: HTMLElement;

    name: string;
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

    /**
     * @param {NodeProperties} properties
     * @param {UserNodeProperties} userProperties
     * @param {Map} map
     */
    constructor(properties: NodeProperties, userProperties: UserNodeProperties, map: Map) {
        this.map = map;

        this.id = properties.id;
        this.parent = properties.parent;
        this.k = properties.k || d3.randomUniform(-20, 20)();

        this.name = userProperties.name;
        this.dimensions = userProperties.dimensions || {
            width: 0,
            height: 0
        };
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

    /**
     *
     * @returns {boolean}
     */
    select(): boolean {
        let selected = this.map.selectedNode,
            background = this.getDOMBackground();

        if (!background.style.stroke) {
            if (selected) {
                selected.getDOMBackground().style.stroke = "";
            }
            const color = d3.color(background.style.fill).darker(.5);
            background.style.stroke = color.toString();
            this.map.selectedNode = this;
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     */
    deselect() {
        this.getDOMBackground().style.stroke = "";
        this.map.selectedNode = this.map.nodes.get(this.map.id + "_node_0");
    }

    /**
     *
     * @returns {number}
     */
    getLevel(): number {
        let level = 0, parent = this.parent;

        while (parent) {
            level++;
            parent = parent.parent;
        }

        return level;
    }

    /**
     *
     * @returns {Node[]}
     */
    getChildren(): Node[] {
        return this.map.nodes.values().filter(node => node.parent && node.parent.id === this.id);
    }

    /**
     *
     * @returns {Node[]}
     */
    getDescendants(): Node[] {
        let nodes = [];
        this.getChildren().forEach((node: Node) => {
            nodes.push(node);
            nodes = nodes.concat(node.getDescendants());
        });
        return nodes;
    }

    /**
     * Return the x coordinate of a node based on parent x coordinate
     * @returns {number}
     */
    calculateXposition(): number {
        if (this.parent.isRoot()) {
            let root = this.map.nodes.get(this.map.id + "_node_0");
            return this.parent.coordinates.x + 200 * (root.getChildren().length % 2 === 0 ? -1 : 1);
        } else {
            return this.parent.coordinates.x + 200 * (this.parent.getOrientation() ? -1 : 1);
        }
    }

    /**
     * Return the y coordinate of a node based on parent y coordinate.
     * @return {number}
     */
    calculateYposition(): number {
        return this.parent.coordinates.y - d3.randomUniform(60, 100)();
    }

    /**
     * Return the orientation of a node in the map (true if left)
     * @return {boolean}
     */
    getOrientation(): boolean {
        if (!this.isRoot()) {
            let root = this.map.nodes.get(this.map.id + "_node_0");
            return this.coordinates.x < root.coordinates.x;
        }
    }

    getDOMText(): HTMLElement {
        return <HTMLElement>this.dom.childNodes[1].childNodes[0];
    }

    getDOMBackground(): HTMLElement {
        return <HTMLElement>this.dom.childNodes[0];
    }

    isRoot() {
        return this.id === this.map.id + "_node_0";
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
    dom?: HTMLElement;
}

export interface ExportNodeProperties extends UserNodeProperties {
    id: string;
    parent: string;
    k?: number;
}

export interface Coordinates {
    x: number;
    y: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface Image {
    src: string;
    size: number;
}