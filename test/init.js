const
    mmap = require('../build/mmap'),
    assert = require('assert')

describe('Initialization', () => {
    describe('#version', () => {
        it('Current version of mmap', () => {
            assert.equal( mmap.version, '0.1.3' )
        })
    })
    describe('#init()', () => {
        it('should return -1 when the value is not present', () => {
            mmap.init({
                'root-node': { 'name': 'Hello world' }
            })
            //console.log( mmap.node.select() )
            //assert.equal( , 'Hello world' )
        })
    })
})
