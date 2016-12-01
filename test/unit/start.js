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
