import * as d3 from "d3"
import glob from './global'
import { call as callEvent } from './events'
import * as map from './map/index'
import * as node from './node/index'
import { default as shortcuts } from './shortcuts'
import { overwriteObject, error } from './utils'

/**
 * @name init
 * @param {Object} options - Mind map options.
 * @desc Initial mmap function, set all parameters of the map.
*/
export default function( options ) {

    // Set the view of the map
    glob.container = d3.select('#mmap')
    glob.svg.main = glob.container.append('svg')
        .attr('width', '100%').attr('height', '100%')
        .call( map.zoom )
    glob.svg.main.append("rect")
        .attr("width", '100%').attr("height", '100%')
        .attr("fill", "white")
        .attr("pointer-events", "all")
        .on('click', node.clear )
    glob.svg.mmap = glob.svg.main.append('g')

    // Use d3 map to manage the nodes of mind map
    glob.nodes = d3.map()

    // If there are external options, then update the default options
    if ( options !== undefined )
        options.constructor === Object
            ? overwriteObject( glob.options, options )
            : error('mmap options invalid')

    // Set the optional settings
    if ( glob.options['center-onresize'] === true ) onresize = map.center
    if ( glob.options['shortcuts'] !== false ) shortcuts()

    callEvent('mmcreate')
    node.addRoot()
}
