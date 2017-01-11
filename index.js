
// mmap version
export { version } from './package.json'

export { default as init } from './src/init'
export { default as image } from './src/image'
export { on } from './src/dispatch'

import * as n from './src/node'
export let node = {
    add: n.addChildNode,
    remove: n.removeNode,
    select: n.select
}
