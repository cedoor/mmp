    /****** Util functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed );

    const drag = d3.drag().on('drag', dragged ).on('start', function( n ) {
        selectNode( n.key );
    });

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform );
    }

    function dragged( n ) {
        const x = n.x = d3.event.x;
        const y = n.y = d3.event.y;
        d3.select(this).attr('transform','translate('+ x +','+ y +')');
        d3.selectAll('.link').attr('d', n => drawLink( n ) );
    }

    function selectNode( k ) {
        if( global.selected !== k || global.selected === 'node0' ) {
            global.selected = k;
            const node = d3.select('#'+ k );
            d3.selectAll('.node > ellipse').attr('stroke', 'none');
            node.select('ellipse').attr('stroke', '#587d53');
            events.call('nodeselect', node.node(), global.nodes.get( k ));
        }
    }

    function deselectNode() {
        selectNode('node0');
        d3.select('#node0 > ellipse').attr('stroke', 'none');
    }

    function getNodeLevel( n ) {
        var p = n.parent, level = 0;
        while ( p ) {
            level++;
            p = p.parent;
        }
        return level < 5 ? level : 5;
    }

    function getNodesWithKeys() {
        const nodesWithKeys = [];
        global.nodes.each( function( n, k ) {
            n.key = k;
            nodesWithKeys.push( n );
        });
        return nodesWithKeys;
    }
