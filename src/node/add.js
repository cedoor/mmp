import glob from '../global'
import { call as callEvent } from '../events'
import { save as saveSnapshot } from '../map/snapshots'
import * as map from '../map/index'
import { dom, calcX, calcY } from './utils'
import { clear } from './index'

/**
 * @name addChild
 * @return {Object} prop - The properties of node.
 * @desc Add a child node to selected node.
*/
export default function( prop ) {
    let parent = glob.nodes.get( glob.selected ),
        key = 'node' + ( ++glob.counter ),
        opt = glob.options.node,
        value = Object.assign( {}, {
            'name': prop && prop['name'] || opt['name'],
            'background-color': prop && prop['background-color'] || opt['background-color'],
            'text-color': prop && prop['text-color'] || opt['text-color'],
            'branch-color': prop && prop['branch-color'] || parent['branch-color'] || opt['branch-color'],
            'font-size': prop && prop['font-size'] || opt['font-size'],
            'italic': prop && prop['italic'] || opt['italic'],
            'bold': prop && prop['bold'] || opt['bold'],
            'fixed': prop && prop['fixed'] || opt['fixed'],
            'x': prop && prop.x || calcX( parent.x ),
            'y': prop && prop.y || calcY( parent.y ),
            'parent': glob.selected
        })
    add( key, value )
}

/**
 * @name addRoot
 * @desc Add the root node in the mind map.
*/
export function addRoot() {
    let value = Object.assign({
        x : parseInt( glob.container.style('width') )/2,
        y : parseInt( glob.container.style('height') )/2
    }, glob.options['root-node'])
    add('node' + glob.counter, value )
    clear()
}

/**
 * @name add
 * @param {string} k - The key of node.
 * @param {Object} v - The value of node.
 * @desc Add a node in the mind map.
*/
function add( k, v ) {
    glob.nodes.set( k, v )
    map.update()
    callEvent('nodecreate', dom( k ), k, v )
    saveSnapshot()
}
