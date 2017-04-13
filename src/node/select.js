import * as d3 from 'd3'
import glob from '../global'
import { call } from '../events'
import { error, cloneObject } from '../utils'
import * as node from './index'

/**
 * @name select
 * @param {string} [key] - The key of node to select.
 * @return {Object} [node] - The selected node.
 * @desc Select a node or return the selected node.
*/
export function select( key ) {
    const s = glob.selected
    if ( typeof key === 'string' )
        if ( glob.nodes.has( key ) ) {
            let dom = node.dom( key ), bg = dom.childNodes[0]
            if ( bg.style['stroke'].length === 0 ) {
                if ( s && glob.nodes.has( s ) ) node.stroke( s, '')
                const color = d3.color( bg.style['fill'] ).darker( .5 )
                bg.style['stroke'] = color
                glob.selected = key
                call('nodeselect', dom, key, glob.nodes.get( key ) )
            }
        } else error('The node with the key '+ key +' don\'t exist')
    else return {
        key : s, value : cloneObject( glob.nodes.get( s ) )
    }
}

/**
 * @name clear
 * @desc Deselect current node and select the root without stroke.
*/
export function deselect() {
    select('node0')
    node.stroke('node0', '')
}

/**
 * @name selectTo
 * @param {string} dir - Direction ( up, down, left, right ).
 * @desc Move the node selection in the direction passed as parameter.
*/
export function selectTo( dir ) {
    const d = dir === 'up' || dir === 'left'
    if ( dir === 'up' || dir === 'down' ) moveSelectionOnLevel( d )
    else moveSelectionOnBranch( d )
}

/**
 * @name moveSelectionOnLevel
 * @param {string} dir - Direction ( up, down ).
 * @desc Move the node selection on the level of the current node.
*/
function moveSelectionOnLevel( dir ) {
    let sel = glob.nodes.get( glob.selected ),
        lev = node.level( sel ), or = node.orientation( sel.x ),
        key, tmp = Number.MAX_VALUE
    glob.nodes.each( function( n, k ) {
        let d = dir ? sel.y - n.y : n.y - sel.y
        if (
            lev === node.level( n ) && glob.selected !== k &&
            or === node.orientation( n.x ) &&
            d > 0 && d < tmp
        ) {
            tmp = d
            key = k
        }
    })
    if ( key !== undefined ) node.select( key )
}

/**
 * @name moveSelectionOnLevel
 * @param {string} dir - Direction ( left, right ).
 * @desc Move the node selection in a child node or in the parent node.
*/
function moveSelectionOnBranch( dir ) {
    let sel = glob.nodes.get( glob.selected ),
        root = glob.nodes.get('node0'),
        key, checks, tmp = Number.MIN_VALUE
    glob.nodes.each( function( n, k ) {
        if ( sel.x < root.x )
            checks = dir ? n.parent === glob.selected : sel.parent === k
        else if ( sel.x > root.x )
            checks = !dir ? n.parent === glob.selected : sel.parent === k
        else
            checks = ( dir ? n.x < root.x : n.x > root.x ) && n.parent === glob.selected
        if ( checks && n.y > tmp ) {
            tmp = n.y
            key = k
        }
    })
    if ( key !== undefined ) node.select( key )
}
