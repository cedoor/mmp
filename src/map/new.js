import glob from '../global'
import * as node from '../node/index'
import * as map from './index'
import { call } from '../events'

/**
 * @name reset
 * @desc Replace old mind map with a new one.
*/
export default function() {
    glob.counter = 0
    glob.nodes.clear()
    node.addRoot()
    map.redraw()
    map.center()
    map.save()
    call('mmcreate')
}
