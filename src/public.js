    /****** Public functions ******/

    function createNode( prop ) {
        if ( global.selected ) {
            const sel = global.nodes.get( global.selected );
            global.nodes.set('node' + ( ++global.counter ), {
                parent : sel,
                x : sel.x + 200,
                y : sel.y + 50,
                background : prop.background || '#e6e6e6',
                color : prop.color || '#6f6f6f',
                font : prop.font || 15,
                name : prop.name || 'Node'
            });
            update();
        }
    }

    // To fix
    function deleteNode(){
        if( global.selected !== 'node0' ) {
            global.nodes.remove( global.selected );
            deselectNodes();
            update();
        }
    }

    function resetZoom() {
        global.svg.main.transition().duration(500).call( zoom.transform, d3.zoomIdentity );
    }

    function getNodes() {
        return global.nodes.values();
    }

    function selectNode(n) {
        global.selected = n;
    }
