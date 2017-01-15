import glob from './global'
import * as map from './map/index'
import * as node from './node/index'
import { fromObjectToArray } from './utils'

/**
 * @name shortcuts
 * @desc Set all shortcuts of the mind map.
*/
export default function() {
    let map = {}, shortcuts = fromObjectToArray( glob.options.shortcuts )
    // Order the array based on the number of keys
    shortcuts = shortcuts.sort( ( a, b ) => b[1].length - a[1].length )
    // Catch keys, check if they are a correct shortcut
    // and exec the associated function
    window.onkeyup = e => map[ e.keyCode ] = false
    window.onkeydown = function( e ) {
        map[ e.keyCode ] = true
        for ( let i in shortcuts ) {
            let keys = shortcuts[i][1], f = shortcuts[i][0]
            if ( checkKeys( map, keys ) ) {
                exec( f )
                return false
            }
        }
    }
}

/**
 * @name checkKeys
 * @param {Object} map - Pressed keys.
 * @param {Object} keys - Shortcut keys.
 * @desc Check if the key combination is present in map.
*/
function checkKeys( map, keys ) {
    for ( let p in keys ) if ( ! map[ keys[p] ] ) return false
    return true
}

/**
 * @name exec
 * @param {string} f - Type of shortcut.
 * @desc Execute the function associated with the type of shortcut.
*/
function exec( f ) {
    let functions = {
        'repeat': map.repeat,
        'undo': map.undo,
        'center': map.center,
        'new': map.reset,
        'zoom-in': map.zoomIn,
        'zoom-out': map.zoomOut,
        'add-node': node.add,
        'remove-node': node.remove,
        'move-node-up': () => node.moveTo('up'),
        'move-node-down': () => node.moveTo('down'),
        'move-node-left': () => node.moveTo('left'),
        'move-node-right': () => node.moveTo('right'),
        'move-selection-up': () => node.selectTo('up'),
        'move-selection-down': () => node.selectTo('down'),
        'move-selection-left': () => node.selectTo('left'),
        'move-selection-right': () => node.selectTo('right'),
    }
    functions[ f ]()
}
