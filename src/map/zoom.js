import * as d3 from "d3"
import glob from '../global'
import { call } from '../events'

let zoom = d3.zoom().scaleExtent([ 0.5, 2 ]).on('zoom', zoomed )

// Export all d3-zoom functions
export default zoom

export function zoomIn() {
    setZoom( true )
}

export function zoomOut() {
    setZoom( false )
}

/**
 * @name center
 * @desc Center the root node in the mind map.
*/
export function center() {
    let root = glob.nodes.get('node0'),
        x = parseInt( glob.container.style('width') )/2 - root.x,
        y = parseInt( glob.container.style('height') )/2 - root.y,
        zoomId = d3.zoomIdentity.translate( x, y )
    glob.svg.main.transition().duration(500).call( zoom.transform, zoomId )
    call('mmcenter')
}

function zoomed() {
    glob.svg.mmap.attr('transform', d3.event.transform )
}

function setZoom( flag ) {
    const main = glob.svg.main
    var k = d3.zoomTransform( main.node() ).k
    k += flag ? k/5 : -k/5
    zoom.scaleTo( main.transition().duration( 100 ), k )
}
