import * as d3 from 'd3'
import global from './global'
import { call } from './dispatch'
import { zoom } from './zoom'
import { default as drag } from './drag'
import * as snapshots from './snapshots'
import * as draw from './draw'
import { addRoot, nodeStroke, select } from './node'
import { fontStyle, fontWeight } from './utils'

export function data() {
    return global.history.snapshots[ global.history.index ];
}

export function load( data ) {
    snapshots.load( data );
    center();
    snapshots.save();
}

export function newMap() {
    global.counter = 0;
    global.nodes.clear();
    addRoot();
    redraw();
    center();
    snapshots.save();
    call('mmcreate');
}

export function clear() {
    select('node0')
    nodeStroke('node0', '')
}

export function center() {
    const root = global.nodes.get('node0'), center = {
        x : parseInt( global.container.style('width') )/2,
        y : parseInt( global.container.style('height') )/2
    },
    zoomId = d3.zoomIdentity.translate( center.x - root.x, center.y - root.y );
    global.svg.main.transition().duration(500).call( zoom.transform, zoomId );
    call('mmcenter');
}

export function redraw() {
    d3.selectAll('.node, .branch').remove();
    update();
}

export function update() {
    const map = global.nodes.entries(),
    nodes = global.svg.mmap.selectAll('.node').data( map ),
    branches = global.svg.mmap.selectAll('.branch').data( map.slice(1) );

    const node = nodes.enter().append('g')
        .style('cursor', 'pointer')
        .attr('class', 'node')
        .attr('id', n => n.key )
        .attr('transform', n => 'translate(' + n.value.x + ',' + n.value.y + ')')
        .call( drag )
        .on('dblclick', function( n ) {
            d3.event.stopPropagation();
            call('nodedblclick', this, n.key, n.value );
        });

    node.append('text').text( n => n.value.name )
        .style('font-family', 'sans-serif')
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .style('fill', n => n.value['text-color'])
        .style('font-size', n => n.value['font-size'])
        .style('font-style', n => fontStyle( n.value.italic ) )
        .style('font-weight', n => fontWeight( n.value.bold ));

    node.insert('path', 'text')
        .style('fill', n => n.value['background-color'])
        .style('stroke-width', 3 )
        .attr('d', draw.background );

    branches.enter().insert('path', 'g')
        .style('fill', n => n.value['branch-color'])
        .style('stroke', n => n.value['branch-color'])
        .attr('class', 'branch')
        .attr('id', n => 'branchOf' + n.key )
        .attr('d', draw.branch );

    nodes.exit().remove();
    branches.exit().remove();
}
