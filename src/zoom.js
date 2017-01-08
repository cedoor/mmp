import * as d3 from "d3"
import global from './global'

export const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', function() {
    global.svg.mmap.attr('transform', d3.event.transform );
});

export function zoomIn() {
    setZoom( true );
}

export function zoomOut() {
    setZoom( false );
}

function setZoom( inout ) {
    const main = global.svg.main;
    var k = d3.zoomTransform( main.node() ).k;
    k += inout ? k/5 : -k/5;
    zoom.scaleTo( main.transition().duration( 100 ), k );
}
