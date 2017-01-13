import * as d3 from 'd3'
import glob from '../global'
import { call as callEvent } from '../events'
import { error, cloneObject } from '../utils'
import { dom, stroke } from './index'

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
            let node = dom( key ), bg = node.childNodes[0]
            if ( bg.style['stroke'].length === 0 ) {
                if ( s && glob.nodes.has( s ) ) stroke( s, '')
                const color = d3.color( bg.style['fill'] ).darker( .5 )
                bg.style['stroke'] = color
                if ( s !== key ) {
                    glob.selected = key
                    callEvent('nodeselect', node, key, glob.nodes.get( key ) )
                }
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
export function clear() {
    select('node0')
    stroke('node0', '')
}
