    /****** Public functions ******/

    const events = d3.dispatch(
        'mmcreate', 'mmcenter',
        'nodeselect', 'nodecreate', 'noderemove', 'nodedblclick'
    );

    function addNode( prop ) {
        if( global.selected ) {
            const sel = global.nodes.get( global.selected );
            const root = global.nodes.get('node0');

            const key = 'node' + ( ++global.counter );
            const value = {
                name : prop && prop.name || 'Node',
                'background-color' : prop && prop['background-color'] || '#f1f1f1',
                'text-color' : prop && prop['text-color'] || '#808080',
                'link-color' : prop && prop['link-color'] || '#9fad9c',
                'font-size' : prop && prop['font-size'] || 16,
                'font-style' : prop && prop['font-style'] || 'normal',
                'font-weight' : prop && prop['font-weight'] || 'normal',
                x : sel.x + ( sel.x > root.x ? 200 : -200 ),
                y : sel.y + 50,
                parent : sel
            };

            global.nodes.set( key, value );
            update();
            events.call('nodecreate');
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
            events.call('noderemove');
        } else {
            console.warn('The root node can not be deleted');
        }
    }

    function center() {
        global.svg.main.transition().duration(500).call( zoom.transform, d3.zoomIdentity );
        events.call('mmcenter');
    }

    function updateNode( k, v ) {
        const sel = global.nodes.get( global.selected );
        const dom = document.getElementById( sel.key );
        const prop = {
            'name' : updateName,
            'background-color' : updateBackgroundColor,
            'link-color' : updateLinkColor,
            'text-color' : updateTextColor,
            'font-size' : updateFontSize,
            'font-style' : updateFontStyle,
            'font-weight' : updateFontWeight,
            default : function() {
                console.error('"'+ k +'" is not a valid node property');
            }
        };
        ( prop[k] || prop.default ).call( dom, sel, v );
    }
