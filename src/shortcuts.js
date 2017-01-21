import glob from './global'
import * as map from './map/index'
import * as node from './node/index'
import { fromObjectToArray } from './utils'

/**
 * @name shortcuts
 * @desc Set all shortcuts of the mind map.
*/
export default function() {
    let pressed = new Set(), shortcuts = fromObjectToArray( glob.options.shortcuts )
    // Order the array based on the number of keys
    shortcuts = shortcuts.sort( ( a, b ) => b[1].length - a[1].length )
    // Catch keys, check if they are a correct shortcut
    // and exec the associated function
    window.onkeyup = e => pressed.delete( e.keyCode )
    window.onkeydown = function( e ) {
        pressed.add( e.keyCode )
        for ( let s of shortcuts ) {
            let keys = s[1], f = s[0]
            if ( checkKeys( pressed, keys ) ) return !! exec( f )
        }
    }
}

/**
 * @name checkKeys
 * @param {Object} pressed - Pressed keys.
 * @param {Object} keys - Shortcut keys.
 * @desc Check if the key combination is present in pressed set.
*/
function checkKeys( pressed, keys ) {
    for ( let k of keys ) if ( ! pressed.has( k ) ) return false
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
        ['move-node-up']() { node.moveTo('up') },
        ['move-node-down']() { node.moveTo('down') },
        ['move-node-left']() { node.moveTo('left') },
        ['move-node-right']() { node.moveTo('right') },
        ['move-selection-up']() { node.selectTo('up') },
        ['move-selection-down']() { node.selectTo('down') },
        ['move-selection-left']() { node.selectTo('left') },
        ['move-selection-right']() { node.selectTo('right') }
    }
    functions[ f ]()
}
