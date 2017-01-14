import glob from '../global'
import { call } from '../events'
import { error } from '../utils'
import * as map from '../map/index'
import * as node from './index'

/**
 * @name remove
 * @return {boolean} error - False.
 * @desc Remove the selected node.
*/
export function remove() {
    const key = glob.selected
    if( key !== 'node0' ) {
        glob.nodes.remove( key )
        node.subnodes( key, ( n, k ) => {
            glob.nodes.remove( k )
        })
        node.select('node0')
        map.redraw()
        map.save()
        call('noderemove', this, key )
    } else return error('The root node can not be deleted')
}
