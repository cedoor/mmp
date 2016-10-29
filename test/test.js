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

    mmap.createNode({
        x : 1000,
        y : 1000 - 100,
        fill : '#c7b6a5'
    });

    mmap.createNode({
        x : 1000,
        y : 1000 + 100,
        fill : '#a5b4c7'
    });

})( this, document, mmap );
