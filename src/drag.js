import * as d3 from "d3"
import global from './global'
import { selectNode, setNodeCoords, subnodes } from './node'
import { saveSnapshot } from './snapshots'
import { orientation } from './utils'
import { drawBranch } from './draw'

export const drag = d3.drag().on('drag', dragged ).on('start', function( n ) {
    selectNode( n.key );
}).on('end', function() {
    if ( global.dragged ) {
        global.dragged = false;
        saveSnapshot();
    }
});

function dragged( n ) {
    const dy = d3.event.dy, dx = d3.event.dx,
    x = n.value.x += dx, y = n.value.y += dy, parent = n,
    sameOrientation = orientation( x ) === orientation( x - dx );
    setNodeCoords( this, x, y );
    if ( n.value.fixed ) subnodes( n.key, function( n ) {
        const x = n.x += dx, y = n.y += dy;
        if ( !sameOrientation ) n.x += ( parent.value.x - n.x )*2;
        setNodeCoords( this, x, y );
    });
    d3.selectAll('.branch').attr('d', drawBranch );
    global.dragged = true;
}
