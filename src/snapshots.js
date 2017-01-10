import global from './global'
import { redraw, clear } from './map'
import { cloneObject } from './utils'

export function undo() {
        const h = global.history;
        if( h.index > 0 )
            load( h.snapshots[ --h.index ] );
    }

export function repeat() {
        const h = global.history;
        if( h.index < h.snapshots.length - 1 )
            load( h.snapshots[ ++h.index ] );
    }

export function save() {
    const h = global.history;
    if ( h.index < h.snapshots.length - 1 ) h.snapshots.splice( h.index + 1 );
    h.snapshots.push( mapClone() );
    h.index++;
}

export function load( snapshot ) {
    global.nodes.clear();
    snapshot.forEach( function( node ) {
        global.nodes.set( node.key, cloneObject( node.value ) );
    });
    redraw();
    setCounter();
    clear();
}

function mapClone() {
    return global.nodes.entries().map( function( node ) {
        const value = cloneObject( node.value );
        delete value.width;
        delete value.height;
        return { key : node.key, value : value };
    });
}

function setCounter() {
    const getIntOfKey = k => parseInt( k.substring(4) ),
    keys = global.nodes.keys().map( getIntOfKey );
    global.counter = Math.max(...keys);
}
