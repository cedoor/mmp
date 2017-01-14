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
    addRoot()
    map.redraw()
    map.center()
    map.save()
    call('mmcreate')
}
