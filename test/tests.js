describe('Tests', function() {

    var assert = chai.assert;

    describe('#mmap.version()', function() {
        it('Current version of mmap', function() {
            assert.equal( mmap.version, '0.1.3' );
        });
    });

    describe('#mmap.select()', function() {
        it('should initialize the mind map', function() {
            var selected = mmap.node.select();
            assert.equal( selected.value.name, 'Root node');
        });
    });

})
