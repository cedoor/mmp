import glob from "../global"
import Shape from "./shape"
import * as node from "../node/index"

export default class BranchShape extends Shape {

    constructor(node) {
        super(node)
    }

    /**
     * @name draw
     * @desc Draw the branch of the node.
     */
    draw() {
        const p = glob.nodes.get(this.node.parent),
            level = node.level(this.node),
            width = 22 - ( level < 5 ? level : 5 ) * 3,
            mx = ( p.x + this.node.x ) / 2,
            ory = p.y < this.node.y + this.node.height / 2 ? -1 : 1,
            orx = p.x > this.node.x ? -1 : 1,
            inv = orx * ory

        this.path.moveTo(p.x, p.y - width * .8)
        this.path.bezierCurveTo(
            mx - width * inv, p.y - width / 2,
            p.x - width / 2 * inv, this.node.y + this.node.height / 2 - width / 3,
            this.node.x - this.node.width / 3 * orx, this.node.y + this.node.height / 2 + 3
        )
        this.path.bezierCurveTo(
            p.x + width / 2 * inv, this.node.y + this.node.height / 2 + width / 3,
            mx + width * inv, p.y + width / 2,
            p.x, p.y + width * .8
        )
        this.path.closePath()

        return this.path
    }

}

