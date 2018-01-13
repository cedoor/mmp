import glob from "../global";
import Shape from "./shape";

export default class NodeShape extends Shape {

    constructor(node, dom) {
        super(node, dom);
    }

    /**
     * @name draw
     * @desc Draw the background shape of the node.
     */
    draw() {
        const name = this.getNameDOMElement();

        this.node.width = name.clientWidth + glob.options.node.padding[1];
        this.node.height = name.clientHeight + glob.options.node.padding[0];
        this.node.k = this.node.k || this.random(-20, 20)();

        const x = this.node.width / 2,
            y = this.node.height / 2,
            k = this.node.k;

        this.path.moveTo(-x, k / 3);
        this.path.bezierCurveTo(-x, -y + 10, -x + 10, -y, k, -y);
        this.path.bezierCurveTo(x - 10, -y, x, -y + 10, x, k / 3);
        this.path.bezierCurveTo(x, y - 10, x - 10, y, k, y);
        this.path.bezierCurveTo(-x + 10, y, -x, y - 10, -x, k / 3);
        this.path.closePath();

        return this.path;
    }

}
