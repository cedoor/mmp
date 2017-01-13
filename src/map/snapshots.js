import glob from '../global'
import { cloneObject } from '../utils'
import { center, redraw } from './index'
import { clear } from '../node/index'

export function undo() {
        const h = glob.history;
        if( h.index > 0 )
            load( h.snapshots[ --h.index ] );
    }

export function repeat() {
    const h = glob.history;
    if( h.index < h.snapshots.length - 1 )
        load( h.snapshots[ ++h.index ] )
}

/**
 * @name data
 * @return {Object} snapshot - Last snapshot of the mind map.
 * @desc Return last snapshot of the mind map.
*/
export function data() {
    return glob.history.snapshots[ glob.history.index ]
}

export function save() {
    const h = glob.history;
    if ( h.index < h.snapshots.length - 1 ) h.snapshots.splice( h.index + 1 );
    h.snapshots.push( mapClone() );
    h.index++;
}

export function load( snapshot ) {
    glob.nodes.clear()
    snapshot.forEach( function( node ) {
        glob.nodes.set( node.key, cloneObject( node.value ) )
    })
    redraw()
    setCounter()
    clear()
    center()
    save()
}

function mapClone() {
    return glob.nodes.entries().map( function( node ) {
        const value = cloneObject( node.value );
        delete value.width;
        delete value.height;
        return { key : node.key, value : value };
    });
}

function setCounter() {
    const getIntOfKey = k => parseInt( k.substring(4) ),
    keys = glob.nodes.keys().map( getIntOfKey );
    glob.counter = Math.max(...keys);
}
