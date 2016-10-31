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
        x : 100, y : 100,
        bgColor : '#8f7b78', textColor : '#e3e3e3',
        fontSize : 15, text : 'Node 2'
    });

    setTimeout(function(){
        mmap.createNode({
            x : 600, y : 100,
            bgColor : '#78878f', textColor : '#e3e3e3',
            fontSize : 17, text : 'Node 3'
        });
    }, 2000);

})( this, document, mmap );
