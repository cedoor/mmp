import {UserNodeProperties} from "./models/node";
import Utils from "../utils/utils";

/**
 * Manage default map options.
 */
export default class Options implements OptionParameters {

    public fontFamily: string;
    public centerOnResize: boolean;
    public drag: boolean;
    public zoom: boolean;

    public node: UserNodeProperties;
    public rootNode: UserNodeProperties;

    /**
     * Initialize all options.
     * @param {OptionParameters} parameters
     */
    constructor(parameters: OptionParameters = {}) {
        this.fontFamily = parameters.fontFamily || "Arial, Helvetica, sans-serif";
        this.centerOnResize = parameters.centerOnResize || true;
        this.drag = parameters.drag || true;
        this.zoom = parameters.zoom || true;

        // Default node properties
        this.node = parameters.node || {
            name: "Node",
            coordinates: {
                x: 0,
                y: 0
            },
            image: {
                src: "",
                size: 60
            },
            backgroundColor: "#f9f9f9",
            textColor: "#787878",
            branchColor: "#577a96",
            fontSize: 16,
            italic: false,
            bold: false,
            locked: true
        };

        // Default root node properties
        this.rootNode = parameters.rootNode || {
            name: "Root node",
            coordinates: {
                x: 0,
                y: 0
            },
            image: {
                src: "",
                size: 70
            },
            backgroundColor: "#f0f6f5",
            textColor: "#787878",
            branchColor: "",
            fontSize: 20,
            italic: false,
            bold: false,
            locked: false
        };
    }

    /**
     * Set option parameters and return them updated.
     * @param {OptionParameters} parameters
     * @returns {OptionParameters} parameters
     */
    public set = (parameters: OptionParameters): OptionParameters => {
        parameters = Utils.mergeObjects(this.get(), parameters);

        this.fontFamily = parameters.fontFamily;
        this.centerOnResize = parameters.centerOnResize;
        this.drag = parameters.drag;
        this.zoom = parameters.zoom;
        this.node = parameters.node;
        this.rootNode = parameters.rootNode;

        return this.get();
    };

    /**
     * Return current option parameters.
     * @returns {OptionParameters} parameters
     */
    private get(): OptionParameters {
        return {
            fontFamily: this.fontFamily,
            centerOnResize: this.centerOnResize,
            drag: this.drag,
            zoom: this.zoom,
            node: Utils.cloneObject(this.node) as UserNodeProperties,
            rootNode: Utils.cloneObject(this.rootNode) as UserNodeProperties
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