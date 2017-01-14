import { dispatch } from "d3"

/**
 * @name call
 * @param {Object} e - The name of the event.
 * @param {Object} [p] - Optional parameters.
 * @desc  Invoke each registered callback for the specified event ( d3 function ).
*/
export let call = ( e, ...p ) => dispatcher.call( e, ...p )

/**
 * @name on
 * @param {Object} e - The name of the event.
 * @param {requestCallback} [cb] - Callback called on event.
 * @desc Adds, removes or gets the callback for the specified event ( d3 function ).
*/
export let on = ( e, cb ) => dispatcher.on( e, cb )

// All events of mmap
let dispatcher = dispatch(
    'mmcreate',
    'mmcenter',
    'nodedblclick',
    'nodeselect',
    'nodeupdate',
    'nodecreate',
    'noderemove'
)
