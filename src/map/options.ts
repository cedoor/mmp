import {UserNodeProperties} from "../node/node";

export default class Options implements OptionParameters {

    fontFamily: string;

    centerOnResize: boolean;
    drag: boolean;
    zoom: boolean;

    node: UserNodeProperties;
    rootNode: UserNodeProperties;

    constructor(parameters: OptionParameters = {}) {
        this.fontFamily = parameters.fontFamily || "Arial, Helvetica, sans-serif";
        this.centerOnResize = parameters.centerOnResize || true;
        this.drag = parameters.drag || true;
        this.zoom = parameters.zoom || true;

        // Default node properties
        this.node = parameters.node || {
            // Variable values
            name: "Node",
            dimensions: {
                width: 0,
                height: 0
            },
            image: {
                src: "",
                size: 60
            },
            backgroundColor: "#f9f9f9",
            textColor: "#808080",
            branchColor: "#c2d7aa",
            fontSize: 16,
            italic: false,
            bold: false,
            locked: true
        };

        // Default root node properties
        this.rootNode = parameters.rootNode || {
            name: "Root node",
            dimensions: {
                width: 0,
                height: 0
            },
            image: {
                src: "",
                size: 70
            },
            backgroundColor: "#f0f6f5",
            textColor: "#828c82",
            fontSize: 20,
            italic: false,
            bold: false,
            locked: false
        };
    }

}

export interface OptionParameters {
    fontFamily?: string;
    centerOnResize?: boolean;
    drag?: boolean;
    zoom?: boolean;
    node?: UserNodeProperties;
    rootNode?: UserNodeProperties;
}