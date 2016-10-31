    /****** Utils functions  ******/

    function updateNodes() {

        const a = g.dom.mmap.selectAll('g').data( g.nodes ).enter().append('g')
            .attr('transform', function( n ) { return 'translate('+ n.x +','+ n.y +')'; } )
            .attr('cursor', 'pointer')
            .call( drag );

        const ellipse = a.append('ellipse').attr('fill', function( n ) { return n.bgColor; } );

        const text = a.append('text').text( function( n ) { return n.text; } )
            .attr('font-family', 'sans-serif')
            .attr('font-size', function( n ) { return n.fontSize; } )
            .attr('text-anchor', 'middle')
            .attr('fill', function( n ) { return n.textColor; } );

        ellipse.attr('rx', parseInt( text.style('width') )/2 + 25 );
        ellipse.attr('ry', parseInt( text.style('height') )/2 + 16 );
        text.attr('dy', parseInt( text.style('height') )/2 - 5 );

    }

    // function centerSheet() {
    //     mmp.container.node().scrollTop = ( mmp.height - window.innerHeight )/2;
    //     mmp.container.node().scrollLeft = ( mmp.width - window.innerWidth )/2;
    // }

    function zoomed() {
        g.dom.mmap.attr("transform", "translate(" + d3.event.transform.x + ',' + d3.event.transform.y + ")scale(" + d3.event.transform.k + ")");
    }

    function dragstarted() {
      d3.event.sourceEvent.stopPropagation();
      d3.select(this).classed("dragging", true);
    }

    function dragged(n) {
      d3.select(this).attr('transform', 'translate('+ (n.x = d3.event.x) +','+ (n.y = d3.event.y) +')');
    }

    function dragended() {
      d3.select(this).classed("dragging", false);
    }

    const zoom = d3.zoom()
        .scaleExtent([0.5, 10])
        .on("zoom", zoomed);

    const drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
