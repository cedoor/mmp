import * as d3 from "d3"
import glob from '../global'
import { call } from '../events'
import { zoom, center } from './index'
import { addRoot, deselect } from '../node/index'
import Utils from '../utils'

/**
 * @name init
 * @param {Object} options - Mind map options.
 * @param {string} selector - Html id value of mind map container.
 * @desc Initial mmp function, set all parameters of the map.
*/
export function init( selector, options ) {

    // Create a backup of original global options
    glob.backup = Utils.cloneObject( glob, true )

    // If there are external options, then update the default options
    if ( options !== undefined )
        options.constructor === Object
            ? Utils.overwriteObject( glob.options, options )
            : Utils.error('mmp options are invalid')

    // Set the view of the map
    glob.container = d3.select('#'+ selector ).style('position', 'relative')
    glob.svg.main = glob.container.append('svg').style('position', 'absolute')
        .style('width', '100%').style('height', '100%')
        .style('top', 0).style('left', 0)
    glob.svg.main.append("rect")
        .attr("width", '100%').attr("height", '100%')
        .attr("fill", "white")
        .attr("pointer-events", "all")
        .on('click', deselect )
    glob.svg.mmp = glob.svg.main.append('g')

    glob.nodes = d3.map() // Set d3 map to manage the nodes of mind map
    glob.counter = 0 // Set a global counter for the identity of nodes
    glob.history.index = -1 // Set history mmp settings to manage the snapshots
    glob.history.snapshots = []

    // Set the optional settings
    if ( glob.options['center-onresize'] === true ) onresize = center
    if ( glob.options['zoom'] === true ) glob.svg.main.call( zoom )

    call('mmcreate', glob.container.node() )
    addRoot()
}
