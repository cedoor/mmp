import * as d3 from "d3"
import glob from './global'
import { zoom } from './zoom'
import { call } from './dispatch'
import { center, clear } from './map'
import { createRootNode } from './node'
import { default as shortcuts } from './shortcuts'
import {
    overwriteProperties,
    error
} from './utils'

/**
 * @name init
 * @description
 *
 */
export default function( selector, options ) {

    glob.container = d3.select( selector );

    glob.svg.main = glob.container.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .call( zoom );

    glob.svg.main.append("rect")
        .attr("width", '100%')
        .attr("height", '100%')
        .attr("fill", "white")
        .attr("pointer-events", "all")
        .on('click', clear );

    glob.svg.mmap = glob.svg.main.append('g');
    glob.nodes = d3.map();

    // If opt is correct update the default options
    if ( options !== undefined )
        options.constructor === Object
            ? overwriteProperties( glob.options, options )
            : error('mmap options invalid');

    if ( glob.options['center-onresize'] === true ) onresize = center;
    if ( glob.options['shortcuts'] === true ) shortcuts();

    call('mmcreate');

    createRootNode();
}
