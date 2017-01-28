describe('Tests', function() {

    var assert = chai.assert;

    describe('#mmap.init()', function() {
        it('Init', function() {
            mmap.init();
        });
    });

    describe('#mmap.select()', function() {
        it('should initialize the mind map', function() {
            var selected = mmap.node.select();
            assert.equal( selected.value.name, 'Root node');
        });
    });

})
