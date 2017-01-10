import { dispatch } from "d3"

// Export some d3-dispatch functions
export let call = ( e, ...p ) => dispatcher.call( e, ...p )
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
