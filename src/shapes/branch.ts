import Shape from "./shape";

export default class BranchShape extends Shape {

    constructor(node) {
        super(node);
    }

    /**
     * @name draw
     * @desc Draw the branch of the node.
     */
    draw(): any {
        const parent = this.node.parent,
            level = this.node.getLevel(),
            width = 22 - (level < 5 ? level : 5) * 3,
            mx = (parent.coordinates.x + this.node.coordinates.x) / 2,
            ory = parent.coordinates.y < this.node.coordinates.y + this.node.dimensions.height / 2 ? -1 : 1,
            orx = parent.coordinates.x > this.node.coordinates.x ? -1 : 1,
            inv = orx * ory;

        this.path.moveTo(parent.coordinates.x, parent.coordinates.y - width * .8);
        this.path.bezierCurveTo(
            mx - width * inv, parent.coordinates.y - width / 2,
            parent.coordinates.x - width / 2 * inv, this.node.coordinates.y + this.node.dimensions.height / 2 - width / 3,
            this.node.coordinates.x - this.node.dimensions.width / 3 * orx, this.node.coordinates.y + this.node.dimensions.height / 2 + 3
        );
        this.path.bezierCurveTo(
            parent.coordinates.x + width / 2 * inv, this.node.coordinates.y + this.node.dimensions.height / 2 + width / 3,
            mx + width * inv, parent.coordinates.y + width / 2,
            parent.coordinates.x, parent.coordinates.y + width * .8
        );
        this.path.closePath();

        return this.path;
    }

}

