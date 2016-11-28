/**
 * @author Omar Desogus
 * @license GNU GENERAL PUBLIC LICENSE
 *
 * @description
 * Tests of mmap library
 *
 */
(function( window, document, mmap ) {

    /** Init **/

    mmap.init('.mmap',{

    });

    /** Nodes **/

    function createNode() {
        mmap.createNode({
            name : 'A casual node'
        });
    }

    function removeNode() {
        mmap.removeNode();
    }

    /** Map **/

    function centerMap() {
        mmap.centerMap();
    }


    window.test = {
        createNode : createNode,
        removeNode : removeNode,
        centerMap : centerMap
    }

})( this, document, mmap );
