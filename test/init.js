describe('Tests', function() {

    var assert = chai.assert;

    describe('#version', function() {
        it('Current version of mmap', function() {
            assert.equal( mmap.version, '0.1.3' );
        });
    });

    describe('#mmap.init()', function() {
        it('should initialize the mind map', function() {
            mmap.init({
                'root-node': { 'name': 'Hello world' }
            });
            var selected = mmap.node.select();
            assert.equal( selected.value.name, 'Hello world' );
        });
    });

    describe('#mmap.node.add()', function() {
        it('should initialize the mind map', function() {
            mmap.node.add({'name': 'Child node'});
            mmap.node.select('node1');
            var selected = mmap.node.select();
            assert.equal( selected.key, 'node1' );
        });
    });
})
