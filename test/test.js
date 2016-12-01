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

    // Text functions

    const text = document.getElementsByClassName('func')[0].childNodes[1];

    var style = weight = true;
    function updateNode( s ) {
        switch ( s ) {
            case 'font-style':
                if( style ) {
                    style = false;
                    mmap.updateNode( s, 'italic' );
                } else {
                    style = true;
                    mmap.updateNode( s, 'normal' );
                }
                break;
            case 'font-weight':
                if( weight ) {
                    weight = false;
                    mmap.updateNode( s, 'bold' );
                } else {
                    weight = true;
                    mmap.updateNode( s, 'normal' );
                }
                break;
            default:

        }
    }

    text.onblur = function() {
        if( text.value === '' ) mmap.updateNode('name', text.value = 'Node');
    }

    text.onkeyup = function( e ) {
        e.key === "Enter" ? text.blur() : mmap.updateNode('name', text.value );
    };

    mmap.events.on('nodeselect', function( n ) {
        text.value = n.name;
    });

    mmap.events.on('nodedblclick', function( n ) {
        text.focus();
    });

    window.test = {
        updateNode : updateNode
    };

})( this, document, mmap );
