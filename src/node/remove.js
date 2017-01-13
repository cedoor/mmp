import glob from '../global'
import { call as callEvent } from '../events'
import { save as saveSnapshot, redraw } from '../map/index'
import { error } from '../utils'
import { select, subnodes } from './index'

/**
 * @name remove
 * @return {boolean} error - False.
 * @desc Remove the selected node.
*/
export default function () {
    const key = glob.selected
    if( key !== 'node0' ) {
        glob.nodes.remove( key )
        subnodes( key, ( n, k ) => {
            glob.nodes.remove( k )
        })
        select('node0')
        redraw()
        saveSnapshot()
        callEvent('noderemove', this, key )
    } else return error('The root node can not be deleted')
}
