/**
 * @author Omar Desogus
 * @license GNU GENERAL PUBLIC LICENSE
 *
 * @description
 * Tests of mmap library
 *
 */
(function( window, document, mmap ) {

    // DOM elements

    const nodeName = document.getElementById('node-name');
    const fontSize = document.getElementById('font-size');
    const backgroundColor = document.getElementsByClassName('btn-color')[0];
    const linkColor = document.getElementsByClassName('btn-color')[1];
    const textColor = document.getElementsByClassName('btn-color')[2];

    fontSize.onkeyup = fontSize.onclick = function() {
        mmap.updateNode('font-size', fontSize.value );
    }

    nodeName.onblur = function() {
        if( nodeName.value === '' ) mmap.updateNode('name', nodeName.value = 'Node');
    }

    nodeName.onkeyup = function( e ) {
        e.key === "Enter" ? nodeName.blur() : mmap.updateNode('name', nodeName.value );
    };

    // mmap events

    mmap.events.on('mmcreate', function(){
        console.info('Mindmap created!');
    });

    mmap.events.on('nodeselect', function( n ) {
        nodeName.value = n.name;
        fontSize.value = n['font-size'];
        backgroundColor.value = n['background-color'];
        linkColor.value = n['link-color'] || '#ffffff';
        textColor.value = n['text-color'];
    });

    mmap.events.on('nodedblclick', function( n ) {
        nodeName.focus();
    });

    mmap.init('.mmap');

    window.test = {};

})( this, document, mmap );
