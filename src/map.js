import * as d3 from 'd3'
import glob from './global'
import { call as callEvent } from './dispatch'
import { zoom } from './zoom'
import { default as drag } from './drag'
import * as snapshots from './snapshots'
import * as draw from './draw'
import * as node from './node'
import { fontStyle, fontWeight } from './utils'

/**
 * @name data
 * @return {Object} snapshot - Last snapshot of the mind map.
 * @desc Return last snapshot of the mind map.
*/
export function data() {
    return glob.history.snapshots[ glob.history.index ]
}

/**
 * @name load
 * @param {Object} snapshot - A snapshot of the mind map.
 * @desc Replace old mind map with the snapshot loaded.
*/
export function load( snapshot ) {
    snapshots.load( snapshot )
    center()
    snapshots.save()
}

/**
 * @name reset
 * @desc Replace old mind map with a new one.
*/
export function reset() {
    glob.counter = 0
    glob.nodes.clear()
    node.addRoot()
    redraw()
    center()
    snapshots.save()
    callEvent('mmcreate')
}

/**
 * @name clear
 * @desc Deselect current node and select the root without stroke.
*/
export function clear() {
    node.select('node0')
    node.stroke('node0', '')
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
    callEvent('mmcenter')
}

/**
 * @name redraw
 * @desc Remove dom elements and recreate them.
*/
export function redraw() {
    d3.selectAll('.node, .branch').remove()
    update()
}

/**
 * @name update
 * @desc Update mind map with new nodes.
*/
export function update() {
    let nodeValues = glob.nodes.entries(),
        nodes = glob.svg.mmap.selectAll('.node').data( nodeValues ),
        branches = glob.svg.mmap.selectAll('.branch').data( nodeValues.slice(1) ),

    node = nodes.enter().append('g')
        .style('cursor', 'pointer')
        .attr('class', 'node')
        .attr('id', n => n.key )
        .attr('transform', n => 'translate(' + n.value.x + ',' + n.value.y + ')')
        .call( drag )
        .on('dblclick', function( n ) {
            d3.event.stopPropagation()
            callEvent('nodedblclick', this, n.key, n.value )
        });

    node.append('text').text( n => n.value.name )
        .style('font-family', 'sans-serif')
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .style('fill', n => n.value['text-color'])
        .style('font-size', n => n.value['font-size'])
        .style('font-style', n => fontStyle( n.value.italic ) )
        .style('font-weight', n => fontWeight( n.value.bold ) )

    node.insert('path', 'text')
        .style('fill', n => n.value['background-color'])
        .style('stroke-width', 3 )
        .attr('d', draw.background )

    branches.enter().insert('path', 'g')
        .style('fill', n => n.value['branch-color'])
        .style('stroke', n => n.value['branch-color'])
        .attr('class', 'branch')
        .attr('id', n => 'branchOf' + n.key )
        .attr('d', draw.branch )

    nodes.exit().remove()
    branches.exit().remove()
}
