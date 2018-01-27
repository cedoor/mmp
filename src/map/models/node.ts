import * as d3 from "d3";

/**
 *
 */
export default class Node implements NodeProperties {

    public id: string;
    public parent: Node;
    public k: number;
    public name: string;
    public dimensions: Dimensions;
    public coordinates: Coordinates;
    public image: Image;
    public backgroundColor: string;
    public textColor: string;
    public branchColor: string;
    public fontSize: number;
    public italic: boolean;
    public bold: boolean;
    public locked: boolean;

    public dom: HTMLElement;

    /**
     * @param {NodeProperties} properties
     */
    constructor(properties: NodeProperties) {
        this.id = properties.id;
        this.parent = properties.parent;
        this.name = properties.name;
        this.coordinates = properties.coordinates;
        this.backgroundColor = properties.backgroundColor;
        this.textColor = properties.textColor;
        this.branchColor = properties.branchColor;
        this.image = properties.image;
        this.fontSize = properties.fontSize;
        this.italic = properties.italic;
        this.bold = properties.bold;
        this.locked = properties.locked;

        this.dimensions = {
            width: 0,
            height: 0
        };
        this.k = d3.randomUniform(-20, 20)();
    }

    /**
     *
     * @returns {number}
     */
    public getLevel(): number {
        let level = 0, parent = this.parent;

        while (parent) {
            level++;
            parent = parent.parent;
        }

        return level;
    }

    public getDOMText(): HTMLElement {
        return <HTMLElement>this.dom.querySelector("div");
    }

    public getDOMBackground(): HTMLElement {
        return <HTMLElement>this.dom.childNodes[0];
    }

    public getProperties(): ExportNodeProperties {
        return {
            id: this.id,
            parent: this.parent ? this.parent.id : "",
            name: this.name,
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
            locked: this.locked,
            k: this.k
        };
    }

}

export interface UserNodeProperties {
    name: string;
    coordinates: Coordinates;
    image: Image;
    backgroundColor: string;
    textColor: string;
    branchColor: string;
    fontSize: number;
    italic: boolean;
    bold: boolean;
    locked: boolean;
}

export interface NodeProperties extends UserNodeProperties {
    id: string;
    parent: Node;
    k?: number;
}

export interface ExportNodeProperties extends UserNodeProperties {
    id: string;
    parent: string;
    k: number;
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