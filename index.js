
// mmap version
export { version } from './package.json'

export { default as init } from './src/init'
export { default as image } from './src/image'
export { on } from './src/dispatch'
export { undo, repeat } from './src/snapshots'

export {
    reset as new,
    center,
    load,
    data
} from './src/map'

import * as n from './src/node'
export let node = {
    add: n.addChild,
    remove: n.remove,
    select: n.select,
    update: n.update
}
