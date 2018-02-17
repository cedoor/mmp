import {UserNodeProperties} from "./models/node";
import Utils from "../utils/utils";
import Map from "./map";
import * as d3 from "d3";

/**
 * Manage default map options.
 */
export default class Options implements OptionParameters {

    private map: Map;

    public fontFamily: string;
    public centerOnResize: boolean;
    public drag: boolean;
    public zoom: boolean;

    public node: UserNodeProperties;
    public rootNode: UserNodeProperties;

    /**
     * Initialize all options.
     * @param {OptionParameters} parameters
     * @param {Map} map
     */
    constructor(parameters: OptionParameters = {}, map: Map) {
        this.map = map;

        this.fontFamily = parameters.fontFamily || "Arial, Helvetica, sans-serif";
        this.centerOnResize = parameters.centerOnResize || true;
        this.drag = parameters.drag || true;
        this.zoom = parameters.zoom || true;

        // Default node properties
        this.node = Utils.mergeObjects({
            name: "Node",
            coordinates: {
                x: 0,
                y: 0
            },
            image: {
                src: "",
                size: 60
            },
            colors: {
                name: "#787878",
                background: "#f9f9f9",
                branch: "#577a96"
            },
            font: {
                size: 16,
                style: "normal",
                weight: "normal"
            },
            locked: true
        }, parameters.node, true) as UserNodeProperties;

        // Default root node properties
        this.rootNode = Utils.mergeObjects({
            name: "Root node",
            coordinates: {
                x: 0,
                y: 0
            },
            image: {
                src: "",
                size: 70
            },
            colors: {
                name: "#787878",
                background: "#f0f6f5",
                branch: ""
            },
            font: {
                size: 20,
                style: "normal",
                weight: "normal"
            },
            locked: false
        }, parameters.rootNode, true) as UserNodeProperties;
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

        this.update();

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

    private update() {
        // Update centerOnResize behavior
        if (this.centerOnResize === true) {
            d3.select(window).on("resize." + this.map.id, () => {
                this.map.zoom.center();
            });
        } else {
            d3.select(window).on("resize." + this.map.id, null);
        }
        // Update zoom behavior
        if (this.map.options.zoom === true) {
            this.map.dom.svg.call(this.map.zoom.getZoomBehavior());
        } else {
            this.map.dom.svg.on(".zoom", null);
        }
        // Redraw map to update drag behavior
        this.map.draw.clear();
        this.map.draw.update();
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