    /****** Public functions ******/

    function createNode( prop ) {
        if ( global.selected ) {
            const sel = global.nodes.get( global.selected );
            global.nodes.set('node' + ( ++global.counter ), {
                parent : sel,
                x : sel.x + 200,
                y : sel.y + 50,
                background : prop.background || '#f1f1f1',
                textColor : prop.textColor || '#9a9a9a',
                linkColor : prop.linkColor || '#9fad9c',
                font : prop.font || 15,
                name : prop.name || 'Node'
            });
            update();
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

            deselectNodes();
            d3.selectAll('.node, .link').remove();
            update();
        }
    }

    function centerMap() {
        global.svg.main.transition().duration(500).call( zoom.transform, d3.zoomIdentity );
    }

    function getNodes() {
        return global.nodes.values();
    }

    function selectNode(n) {
        global.selected = n;
    }
