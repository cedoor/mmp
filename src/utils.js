    /****** Utils functions  ******/

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
