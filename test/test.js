/**
 * @author Omar Desogus
 * @license GNU GENERAL PUBLIC LICENSE
 *
 * @description
 * Tests of mmap library
 *
 */
(function( window, document, mmap ) {

    mmap.events.on('mmcreate', function(){
        console.info('Mindmap created!');
    });

    mmap.init('.mmap');

    const textInput = document.getElementsByClassName('sidebar')[0].childNodes[1];

    textInput.onblur = function() {
        if( textInput.value === '' ) mmap.updateNode('name', textInput.value = 'Node');
    }

    textInput.onkeyup = function( e ) {
        e.key === "Enter" ? textInput.blur() : mmap.updateNode('name', textInput.value );
    };

    mmap.events.on('nodeselect', function( n ) {
        textInput.value = n.name;
    });

    mmap.events.on('nodedblclick', function( n ) {
        textInput.focus();
    });

    window.test = {};

})( this, document, mmap );
