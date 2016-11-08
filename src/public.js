    /****** Public functions ******/

    function createNode( prop ) {
        if ( global.selected && global.selected.name ) {
            global.nodes.push({
                id : 'node' + ( ++global.counter ),
                parent : global.selected,
                x : global.selected.x + 200,
                y : global.selected.y + 50,
                background : prop.background || '#e6e6e6',
                color : prop.color || '#6f6f6f',
                font : prop.font || 15,
                name : prop.name || 'Node'
            });
            update();
        }
    }

    function resetZoom() {
        global.svg.main.transition().duration(500).call( zoom.transform, d3.zoomIdentity );
    }

    function getNodes() {
        return global.nodes;
    }

    function selectNode(n) {
        global.selected = n;
    }
