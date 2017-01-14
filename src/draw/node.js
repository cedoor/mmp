import * as d3 from "d3"

/**
 * @name background
 * @param {Object} node - Mind map node.
 * @desc Draw the background shape of the node.
*/
export function background( node ) {
    let n = node.value, path = d3.path()
    const
        x = ( n.width = this.nextSibling.getBBox().width + 45 )/2,
        y = ( n.height = this.nextSibling.getBBox().height + 30 )/2,
        k = n.k = n.k || d3.randomUniform( -20, 20 )()

    path.moveTo( -x, k/3 )
    path.bezierCurveTo( -x, -y +10, -x + 10, -y, k, -y )
    path.bezierCurveTo( x - 10, -y, x, -y + 10, x, k/3 )
    path.bezierCurveTo( x, y - 10, x - 10, y, k, y )
    path.bezierCurveTo( -x + 10, y, -x, y - 10, -x, k/3 )
    path.closePath()

    return path
}
