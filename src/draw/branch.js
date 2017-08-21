import * as d3 from "d3"
import glob from "../global"
import {level as nodeLevel} from "../node/index"

/**
 * @name drawBranch
 * @param {Object} node - Mind map node.
 * @desc Draw the branch of the node.
 */
export function branch(node) {
    let
        path = d3.path(),
        n = node.value,
        p = glob.nodes.get(n.parent)
    const
        level = nodeLevel(n),
        width = 22 - ( level < 5 ? level : 5 ) * 3,
        mx = ( p.x + n.x ) / 2,
        ory = p.y < n.y + n.height / 2 ? -1 : 1,
        orx = p.x > n.x ? -1 : 1,
        inv = orx * ory

    path.moveTo(p.x, p.y - width * .8)
    path.bezierCurveTo(
        mx - width * inv, p.y - width / 2,
        p.x - width / 2 * inv, n.y + n.height / 2 - width / 3,
        n.x - n.width / 3 * orx, n.y + n.height / 2 + 3
    )
    path.bezierCurveTo(
        p.x + width / 2 * inv, n.y + n.height / 2 + width / 3,
        mx + width * inv, p.y + width / 2,
        p.x, p.y + width * .8
    )
    path.closePath()

    return path
}
