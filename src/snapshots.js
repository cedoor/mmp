import global from './global'
import { center, redraw, clear } from './map'
import { cloneObject } from './utils'

export function undo() {
        const h = global.history;
        if( h.index > 0 )
            loadSnapshot( h.snapshots[ --h.index ] );
    }

export function repeat() {
        const h = global.history;
        if( h.index < h.snapshots.length - 1 )
            loadSnapshot( h.snapshots[ ++h.index ] );
    }

export function mmapData() {
    return global.history.snapshots[ global.history.index ];
}

export function loadMmap( data ) {
    loadSnapshot( data );
    center();
    saveSnapshot();
}

export function saveSnapshot() {
    const h = global.history;
    if ( h.index < h.snapshots.length - 1 ) h.snapshots.splice( h.index + 1 );
    h.snapshots.push( mapClone() );
    h.index++;
}

function loadSnapshot( snapshot ) {
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
