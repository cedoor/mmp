
export { version } from './package.json'

export { default as init } from './src/init'
export { on } from './src/dispatch'

import * as n from './src/node'
export const node = {
    add: n.addChildNode,
    remove: n.removeNode,
    select: n.selectNode
}
