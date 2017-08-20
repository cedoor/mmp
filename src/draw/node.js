import * as d3 from "d3"

/**
 * @name background
 * @param {Object} node - Mind map node.
 * @desc Draw the background shape of the node.
*/
export function background( node ) {
    let n = node.value, text = this.nextSibling.childNodes[0],
        path = d3.path()
    const
        x = ( n.width = text.clientWidth + 45 )/2,
        y = ( n.height = text.clientHeight + 30 )/2,
        k = n.k = n.k || d3.randomUniform( -20, 20 )()

    path.moveTo( -x, k/3 )
    path.bezierCurveTo( -x, -y +10, -x + 10, -y, k, -y )
    path.bezierCurveTo( x - 10, -y, x, -y + 10, x, k/3 )
    path.bezierCurveTo( x, y - 10, x - 10, y, k, y )
    path.bezierCurveTo( -x + 10, y, -x, y - 10, -x, k/3 )
    path.closePath()

    return path
}
