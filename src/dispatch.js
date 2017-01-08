import * as d3 from "d3"

export const event = d3.dispatch(
    'mmcreate',
    'mmcenter',
    'nodedblclick',
    'nodeselect',
    'nodeupdate',
    'nodecreate',
    'noderemove'
)

export function on( e, cb ) {
    event.on( e, cb )
}
