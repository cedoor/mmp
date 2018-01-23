import Shape from "./shape";
import {Path} from "d3-path";

/**
 * Represents the node shape. Extends the shape class.
 */
export default class NodeShape extends Shape {

    /**
     * Extends the shape class.
     * @param node
     */
    constructor(node) {
        super(node);
    }

    /**
     * Draw the background shape of the node.
     * @returns {Path}
     */
    draw(): Path {
        let text = this.node.getDOMText();

        this.node.dimensions.width = text.clientWidth + 45;
        this.node.dimensions.height = text.clientHeight + 30;

        const x = this.node.dimensions.width / 2,
            y = this.node.dimensions.height / 2,
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
