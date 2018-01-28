import * as d3 from "d3";
import Events from "./handlers/events";
import Zoom from "./handlers/zoom";
import Draw from "./handlers/draw";
import Options, {OptionParameters} from "./options";
import History from "./handlers/history";
import Drag from "./handlers/drag";
import Nodes from "./handlers/nodes";

/**
 * Initialize all handlers and return a mmp object.
 */
export default class Map {

    public id: string;
    public dom: DomElements;

    public options: Options;
    public history: History;
    public events: Events;
    public zoom: Zoom;
    public draw: Draw;
    public drag: Drag;
    public nodes: Nodes;

    private instance: MmpInstance;

    /**
     * Create all handler instances, set some map behaviors and return a mmp instance.
     * @param {string} id
     * @param {OptionParameters} options
     * @returns {MmpInstance}
     */
    constructor(id: string, options?: OptionParameters) {
        this.id = id;

        this.dom = {};
        this.events = new Events();
        this.options = new Options(options);
        this.zoom = new Zoom(this);
        this.history = new History(this);
        this.drag = new Drag(this);
        this.draw = new Draw(this);
        this.nodes = new Nodes(this);

        this.draw.create();

        if (this.options.centerOnResize === true) {
            d3.select(window).on("resize." + this.id, () => {
                this.zoom.center();
            });
        }

        if (this.options.zoom === true) {
            this.dom.svg.call(this.zoom.getZoomBehavior());
        }

        this.nodes.addRootNode();

        return <any>this.createMmpInstance();
    }

    /**
     * Remove permanently mmp instance.
     */
    private remove = () => {
        this.dom.svg.remove();

        let props = Object.keys(this.instance);
        for (let i = 0; i < props.length; i++) {
            delete this.instance[props[i]];
        }
    };

    /**
     * Return a mmp instance with all mmp library functions.
     * @return {MmpInstance} mmpInstance
     */
    private createMmpInstance(): MmpInstance {
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
            addNode: this.nodes.addNode,
            selectNode: this.nodes.selectNode
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
    selectNode: Function;
}

export interface DomElements {
    container?: any;
    svg?: any;
    g?: any;
}
