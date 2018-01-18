import * as d3 from "d3";
import Events from "./events";
import Zoom from "./zoom";
import Draw from "./draw";
import Node, {NodeProperties, UserNodeProperties} from "../node/node";
import {Map as D3Map} from "d3-collection";
import Options, {OptionParameters} from "./options";
import History from "./history";
import Drag from "../node/drag";

export default class Map {

    id: string;
    counter: number;
    dom: DomElements;

    options: Options;
    history: History;
    events: Events;
    zoom: Zoom;
    draw: Draw;
    drag: Drag;

    nodes: D3Map<Node>;
    selectedNode: Node;

    instance: MmpInstance;

    /**
     * @name constructor
     * @param {string} id - Html id value of mind map container.
     * @param {OptionParameters} options - Mind map options.
     * @desc Set all parameters of the map.
     */
    constructor(id: string, options?: OptionParameters) {
        this.id = id;
        // Set d3 map to manage the nodes of mind map
        this.nodes = d3.map();
        // Set a global counter for the identity of nodes
        this.counter = 0;

        this.dom = {};
        this.events = new Events();
        this.options = new Options(options);
        this.drag = new Drag(this);
        this.draw = new Draw(this);
        this.zoom = new Zoom(this);
        this.history = new History(this);

        this.draw.create();

        // Set the optional settings
        if (this.options.centerOnResize === true) {
            d3.select(window).on("resize." + this.id, () => {
                this.zoom.center();
            });
        }

        if (this.options.zoom === true) {
            this.dom.svg.call(this.zoom.d3Zoom);
        }

        this.events.call("mmcreate", this.dom.container.node());

        this.addRootNode();

        return <any>this.createMmpInstance();
    }

    addRootNode() {
        let userProperties: UserNodeProperties = this.options.rootNode,
            properties: NodeProperties = {
                id: this.id + "_node_" + this.counter
            };

        userProperties.coordinates = {
            x: parseInt(this.dom.container.style("width")) / 2,
            y: parseInt(this.dom.container.style("height")) / 2
        };

        let node: Node = new Node(properties, userProperties, this);

        node.select();

        this.nodes.set(properties.id, node);

        this.counter++;

        this.draw.update();

        this.history.save();

        this.events.call("nodecreate", document.getElementById(properties.id), properties.id, userProperties);

        this.deselectNode();
    }

    addNode = (userProperties: UserNodeProperties = {}) => {
        let properties: NodeProperties = {
            id: this.id + "_node_" + this.counter,
            parent: this.selectedNode
        };

        let node: Node = new Node(properties, {...this.options.node, ...userProperties}, this);

        this.nodes.set(properties.id, node);

        this.counter++;

        this.draw.update();

        this.history.save();

        this.events.call("nodecreate", document.getElementById(properties.id), properties.id, properties);
    };

    updateNode = (node: Node = this.selectedNode, property: string, value: any) => {
        node[property] = value;
    };

    deselectNode() {

    }

    remove = () => {
        this.dom.svg.remove();

        let props = Object.keys(this.instance);
        for (let i = 0; i < props.length; i++) {
            delete this.instance[props[i]];
        }
    };

    /**
     * @name createMmpInstance
     * @return {MmpInstance} mmpInstance - A mmp instance.
     * @desc Return a mmp instance with all mmp library functions.
     */
    createMmpInstance(): MmpInstance {
        return this.instance = {
            on: this.events.on,
            remove: this.remove,
            new: this.history.new,
            data: this.history.data,
            undo: this.history.undo,
            redo: this.history.redo,
            zoomIn: this.zoom.zoomIn,
            zoomOut: this.zoom.zoomOut,
            center: this.zoom.center,
            addNode: this.addNode
        };
    }

}

export interface MmpInstance {
    on: Function;
    remove: Function;
    new: Function;
    data: Function;
    undo: Function;
    redo: Function;
    zoomIn: Function;
    zoomOut: Function;
    center: Function;
    addNode: Function;
}

export interface DomElements {
    container?: any;
    svg?: any;
    g?: any;
}
