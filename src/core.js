    /****** Utils functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed );

    const drag = d3.drag().on('drag', dragged ).on('start', dragStarted );

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform.toString() );
    }

    function dragStarted(n) {
        d3.selectAll('.node > ellipse').attr('stroke', 'none');
        d3.select(this).selectAll('ellipse').attr('stroke', '#888888');
        selectNode(n.key);
    }

    function dragged(n) {
        const x = n.x = d3.event.x;
        const y = n.y = d3.event.y;
        d3.select(this).attr('transform','translate('+ x +','+ y +')'); // To fix
        d3.selectAll('.link').attr('d', n => diagonal( n ) );
    }

    function deselectNodes() {
        d3.selectAll('.node > ellipse').attr('stroke', 'none');
        global.selected = 'node0';
    }

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal( n ) {
        const path = d3.path();
        path.moveTo( n.parent.x, n.parent.y - 5 );
        path.bezierCurveTo(
            (n.parent.x + n.x) / 2, n.parent.y,
            (n.parent.x + n.x) / 2, n.y,
            n.x - 20, n.y + 20
        );
        path.bezierCurveTo(
            (n.x + n.parent.x) / 2 + 10, n.y,
            (n.x + n.parent.x) / 2 + 10, n.parent.y,
            n.parent.x, n.parent.y + 5
        );
        path.closePath();
        return path;
    }

    function getNodesWithKeys() {
        const nodesWithKeys = [];
        global.nodes.each( function( n, k ) {
            n.key = k;
            nodesWithKeys.push( n );
        });
        return nodesWithKeys;
    }

    function update() {

        const nodes = getNodesWithKeys();

        const node = global.svg.mmap.selectAll('.node').data( nodes );

        const nodeContainer = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', n => 'translate(' + n.x + ',' + n.y + ')')
            .call( drag );

        nodeContainer.append('text').text( n => n.name )
            .attr('fill', n => n.color )
            .attr('font-size', n => n.font )
            .attr('dy', 5 );

        nodeContainer.append('ellipse')
            .style('fill', n => n.background )
            .attr('rx', function() {
                return this.previousSibling.getBBox().width/2 + 20;
            }).attr('ry', function() {
                return this.previousSibling.getBBox().height/2 + 10;
            });

        node.exit().remove();

        const link = global.svg.mmap.selectAll('.link').data( nodes.slice(1) );

        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .style('fill', n => n.color )
            .style('stroke', n => n.color )
            .attr('d', n => diagonal( n ) );

        link.exit().remove();

        d3.selectAll('.node > text').each( function() {
            this.parentNode.appendChild(this);
        });
    }
