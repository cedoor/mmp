import glob from './global'
import { undo, repeat } from './map/snapshots'
import { center, reset, zoomIn, zoomOut } from './map/index'
import { fromObjectToArray } from './utils'
import * as node from './node/index'

/**
 * @name shortcuts
 * @desc Set all shortcuts of the mind map.
*/
export default function() {
    let map = {}, shortcuts = fromObjectToArray( glob.options.shortcuts )
    // Order the array based on the number of keys
    shortcuts = shortcuts.sort( ( a, b ) => b[1].length - a[1].length )
    // ...
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

function exec( f ) {
    let functions = {
        'repeat': repeat,
        'undo': undo,
        'center': center,
        'new': reset,
        'zoom-in': zoomIn,
        'zoom-out': zoomOut,
        'add-node': node.add,
        'remove-node': node.remove,
        'move-node-up': () => node.moveTo('up'),
        'move-node-down': () => node.moveTo('down'),
        'move-node-left': () => node.moveTo('left'),
        'move-node-right': () => node.moveTo('right'),

    }
    functions[ f ]()
}

function checkKeys( map, keys ) {
    for ( let p in keys ) if ( ! map[ keys[p] ] ) return false
    return true
}

// function moveSelectionOnLevel( dir ) {
//     const sel = glob.nodes.get( glob.selected ),
//     lev = node.level( sel ), or = node.orientation( sel.x );
//     var key, tmp = Number.MAX_VALUE;
//     glob.nodes.each( function( n, k ) {
//         const d = dir ? sel.y - n.y : n.y - sel.y,
//         sameLevel = lev === node.level( n ),
//         sameNode = glob.selected === k,
//         sameOrientation = or === node.orientation( n.x );
//         if ( sameOrientation && sameLevel && !sameNode &&  d > 0 && d < tmp ) {
//             tmp = d;
//             key = k;
//         }
//     });
//     if ( key !== undefined ) node.select( key );
// }
//
// function moveSelectionOnBranch( dir ) {
//     const sel = glob.nodes.get( glob.selected ),
//     root = glob.nodes.get('node0');
//     var key, checks, tmp = Number.MIN_VALUE;
//     glob.nodes.each( function( n, k ) {
//         if ( sel.x < root.x )
//             checks = dir ? n.parent === glob.selected : sel.parent === k;
//         else if ( sel.x > root.x )
//             checks = !dir ? n.parent === glob.selected : sel.parent === k;
//         else checks = ( dir ? n.x < root.x : n.x > root.x ) && n.parent === glob.selected;
//         if ( checks && n.y > tmp ) {
//             tmp = n.y;
//             key = k;
//         }
//     });
//     if ( key !== undefined ) node.select( key );
// }
//
// function moveSelection( dir ) {
//     const d = dir === 'up' || dir === 'left';
//     if ( dir === 'up' || dir === 'down' ) moveSelectionOnLevel( d );
//     else moveSelectionOnBranch( d );
// }
//
