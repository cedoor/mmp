import { dispatch } from "d3"

/**
 * @name call
 * @param {Object} e -
 * @param {Object} p -
 * @return
 * @desc .
*/
export let call = ( e, ...p ) => dispatcher.call( e, ...p )

/**
 * @name call
 * @param {Object} e -
 * @param {} cb -
 * @return
 * @desc .
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
