    /****** Utils functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 5]).on('zoom', zoomed);
    const drag = d3.drag().on('drag', dragged ).on('start', function(n) {
        selectNode(n);
        d3.selectAll('.node > ellipse').attr('stroke', 'none');
        d3.select(this).selectAll('ellipse').attr('stroke', '#888888');
    });

    function zoomed() {
        global.mmap.attr('transform',
            'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ')' +
            'scale(' + d3.event.transform.k + ')');
    }

    function dragged(n) {
        const self = d3.select(this);
        self.attr('transform', 'translate('+ (n.x = d3.event.x) +','+ (n.y = d3.event.y) +')');
        d3.selectAll('.link').attr('d', n => diagonal( n ) );
    }

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal( n ) {
        return `M ${n.parent.x} ${n.parent.y - 5}
            C ${(n.parent.x + n.x) / 2} ${n.parent.y},
              ${(n.parent.x + n.x) / 2} ${n.y},
              ${n.x - 20} ${n.y + 20}
            C ${(n.x + n.parent.x) / 2 + 10} ${n.y},
              ${(n.x + n.parent.x) / 2 + 10} ${n.parent.y},
              ${n.parent.x} ${n.parent.y + 5}`;
    }

    function update() {

        const nodes = global.nodes;

        const node = global.mmap.selectAll('.node').data( nodes )
            .each( n => n.dom = d3.select(this) );

        const nodeContainer = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', n => 'translate(' + n.x + ',' + n.y + ')')
            .call( drag );

        const ellipse = nodeContainer.append('ellipse').style('fill', n => n.background );

        const text = nodeContainer.append('text').text( n => n.name )
            .style('fill', n => n.color )
            .style('font-size', n => n.font );

        ellipse.attr('rx', parseInt( text.style('width') )/2 + 25 );
        ellipse.attr('ry', parseInt( text.style('height') )/2 + 16 );
        text.attr('dy', parseInt( text.style('height') )/2 - 5 );

        node.exit().remove();

        const link = global.mmap.selectAll('.link').data( nodes.slice(1) );

        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .style('fill', n => n.color )
            .style('stroke', n => n.color )
            .attr('d', n => diagonal( n ) );

        link.exit().remove();
    }
