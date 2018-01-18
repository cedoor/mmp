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

        this.node.dimensions.width = name.clientWidth + 45;
        this.node.dimensions.height = name.clientHeight + 30;

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
