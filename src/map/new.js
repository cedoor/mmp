import glob from '../global'
import { addRoot } from '../node/index'
import { call } from '../events'
import * as map from './index'

/**
 * @name reset
 * @desc Replace old mind map with a new one.
*/
export function reset() {
    glob.counter = 0
    glob.nodes.clear()
    map.redraw()
    call('mmcreate', glob.container.node() )
    addRoot()
    map.center()
    map.save()
}
