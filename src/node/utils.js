import * as d3 from 'd3'
import glob from '../global'

/**
 * @name orientation
 * @param {number} x - The key of the parent node.
 * @return {boolean} orientation
 * @desc Return the orientation of a node in the mind map ( true: on left )
*/
export function orientation( x ) {
    let root = glob.nodes.get('node0')
    return x < root.x ? true : x > root.x ? false : undefined
}

/**
 * @name insertImage
 * @param {number} x - The key of the parent node.
 * @return {boolean} orientation
 * @desc Return the orientation of a node in the mind map ( true: on left )
*/
export function insertImage( dom, node ) {
    let img = new Image(), d = d3.select( dom ), href = node['image-src']
    img.src = href
    img.onload = function() {
        let h = node['image-size'],
            w = this.width * h / this.height
        d.append('image')
            .attr('href', href ).attr('height', h )
            .attr('y', - ( h + node.height/2 + 5 ) )
            .attr('x', - w/2 )
    }
    img.onerror = function() {
        d.append('image').attr('href', '')
    }
}

/**
 * @name dom
 * @param {string} k - The key of node.
 * @return {Object} dom
 * @desc Return the dom node of a mind map node.
*/
export let dom = k => document.getElementById( k )

/**
 * @name level
 * @param {Object} n - The node.
 * @return {number} level - The level of node.
 * @desc Find the level of a node.
*/
export function level( n ) {
    let p = n.parent, level = 0
    while ( p ) {
        level++
        p = glob.nodes.get( p ).parent
    }
    return level
}

/**
 * @name children
 * @param {string} k - The key of node.
 * @return {Object} children - The children of node.
 * @desc Return only the children of a node and not all subnodes.
*/
export function children( k ) {
    return glob.nodes.values().filter( n => n.parent === k )
}

/**
 * @name subnodes
 * @param {string} key - The key of the parent node.
 * @param {requestCallback} cb - A callback.
 * @desc Iterate all subnodes of a node and exec a callback for each subnode.
*/
export function subnodes( key, cb ) {
    glob.nodes.each( function( n, k ) {
        if ( n.parent === key ) {
            cb.call( document.getElementById( k ), n, k )
            subnodes( k, cb )
        }
    })
}

/**
 * @name stroke
 * @param {Object} n - The node.
 * @param {string} [v] - The value of stroke color.
 * @return {string} value - The value of stroke color.
 * @desc Set color of node stroke if v is defined and return its value.
*/
export function stroke( n, v ) {
    let bg = dom( n ).childNodes[0]
    return typeof v === 'string' ? bg.style['stroke'] = v : bg.style['stroke']
}

/**
 * @name calcX
 * @param {number} x - x coordinate of parent node.
 * @return {number} x - x coordinate of child node.
 * @desc Return the x coordinate of a node based on parent x coordinate.
*/
export function calcX( x ) {
    let or = orientation( x ),
        dir = or === true ? -1 : or === false ? 1 :
              children('node0').length % 2 === 0 ? -1 : 1
    return x + 200 * dir
}

/**
 * @name calcY
 * @param {number} y - y coordinate of parent node.
 * @return {number} y - y coordinate of child node.
 * @desc Return the y coordinate of a node based on parent y coordinate.
 * { To do more sophisticated }
*/
export function calcY( y ) {
    return y - d3.randomUniform( 60, 100 )()
}
