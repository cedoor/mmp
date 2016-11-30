    /****** Public functions ******/

    const events = d3.dispatch(
        'mmapCreated', 'mmapCentred',
        'nodeSelected', 'nodeCreated', 'nodeRemoved'
    );

    function addNode( prop ) {
        if( global.selected ) {
            const sel = global.nodes.get( global.selected );
            const root = global.nodes.get('node0');
            global.nodes.set('node' + ( ++global.counter ), {
                parent : sel,
                x : sel.x + ( sel.x > root.x ? 200 : -200 ),
                y : sel.y + 50,
                background : prop && prop.background || '#f1f1f1',
                textColor : prop && prop.textColor || '#808080',
                linkColor : prop && prop.linkColor || '#9fad9c',
                font : prop && prop.font || 15,
                name : prop && prop.name || 'Node'
            });
            update();
            events.call('nodeCreated');
        }
    }

    function removeNode() {
        if( global.selected !== 'node0' ) {
            global.nodes.remove( global.selected );

            const clean = function( key ) {
                global.nodes.each( function( n ) {
                    if ( n.key !== 'node0' && n.parent.key === key ) {
                        global.nodes.remove( n.key );
                        clean( n.key );
                        return;
                    }
                });
            }
            clean( global.selected );

            global.selected = 'node0';
            redraw();
            events.call('nodeRemoved');
        } else {
            console.warn('The root node can not be deleted');
        }
    }

    function center() {
        global.svg.main.transition().duration(500).call( zoom.transform, d3.zoomIdentity );
        events.call('mmapCentred');
    }

    function updateNode( k, v ) {
        const s = global.nodes.get( global.selected );
        const prop = {
            'name' : updateName,
            default : function() {
                console.error('"'+ k +'" is not a valid node property');
            }
        };
        ( prop[k] || prop.default )( s, v );
    }
