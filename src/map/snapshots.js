import glob from '../global'
import { cloneObject, error } from '../utils'
import { call } from '../events'
import { center, redraw } from './index'
import { deselect } from '../node/index'

/**
 * @name data
 * @param {Object} [snapshot] - A snapshot of mind map.
 * @return {Object} [snapshot] - Last snapshot of the mind map.
 * @desc
 * Load the snapshot passed as parameter or return
 * last snapshot of the current mind map.
*/
export function data( snapshot ) {
    // ** external snapshot to control **
    if ( check( snapshot ) ) {
        load( snapshot )
        center()
        save()
    } else return glob.history.snapshots[ glob.history.index ]
}

/**
 * @name undo
 * @desc Undo last changes.
*/
export function undo() {
    let h = glob.history
    if ( h.index > 0 ) {
        load( h.snapshots[ --h.index ] )
        call('mmundo')
    }
}

/**
 * @name repeat
 * @desc Repeat last changes.
*/
export function repeat() {
    let h = glob.history
    if ( h.index < h.snapshots.length - 1 ) {
        load( h.snapshots[ ++h.index ] )
        call('mmrepeat')
    }
}

/**
 * @name save
 * @desc Save the current snapshot of the mind map.
*/
export function save() {
    let h = glob.history
    if ( h.index < h.snapshots.length - 1 ) h.snapshots.splice( h.index + 1 )
    h.snapshots.push( mapClone() )
    h.index++
}

/**
 * @name load
 * @param {Object} snapshot - Last snapshot of the mind map.
 * @desc Return last snapshot of the mind map.
*/
function load( snapshot ) {
    glob.nodes.clear()
    snapshot.forEach( function( node ) {
        glob.nodes.set( node.key, cloneObject( node.value ) )
    })
    redraw()
    setCounter()
    deselect()
}

/**
 * @name mapClone
 * @return {Object} nodes - Copy of nodes.
 * @desc Return a copy of all nodes without necessary properties.
*/
function mapClone() {
    return glob.nodes.entries().map( function( node ) {
        let value = cloneObject( node.value )
        delete value.width
        delete value.height
        return { key : node.key, value : value }
    })
}

/**
 * @name setCounter
 * @desc Set the right value of global counter.
*/
function setCounter() {
    let keys = glob.nodes.keys().map( k => parseInt( k.substring(4) ) )
    glob.counter = Math.max( ...keys )
}

/**
 * @name check
 * @param {Object} snapshot - A snapshot of mind map.
 * @return {boolean} result
 * @desc Check the snapshot structure and return true if it is authentic.
*/
function check( snapshot ) {
    return snapshot !== undefined ?
        snapshot.constructor === Array &&
        snapshot[0].key === 'node0' &&
        checkNodes( snapshot ) ? true
        : error('The loaded mind map is incorrect')
    : false
}

/**
 * @name checkNodes
 * @param {Object} snapshot - A snapshot of mind map.
 * @return {boolean} result
 * @desc Check the snapshot nodes and return true if they are authentic.
*/
function checkNodes( snapshot ) {
    for ( let node of snapshot ) {
        if (
            typeof node.key !== 'string' ||
            node.value.constructor !== Object
            // ... to improve?
        ) return false
    }
    return true
}
