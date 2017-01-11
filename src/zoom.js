import * as d3 from "d3"
import glob from './global'

// Export all d3-zoom functions
export let zoom = d3.zoom()
    .scaleExtent([0.5, 2])
    .on('zoom', zoomed )

function zoomed() {
    glob.svg.mmap.attr('transform', d3.event.transform )
}

export function zoomIn() {
    setZoom( true )
}

export function zoomOut() {
    setZoom( false )
}

function setZoom( inout ) {
    const main = glob.svg.main
    var k = d3.zoomTransform( main.node() ).k
    k += inout ? k/5 : -k/5
    zoom.scaleTo( main.transition().duration( 100 ), k )
}
