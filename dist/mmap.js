/**
 * @name mmap
 * @version 0.0.1
 * @author Omar Desogus
 * @license GNU GENERAL PUBLIC LICENSE
 *
 */
(function( window, d3 ) {

    /**
     * @name g
     * @description
     * Global dictionary that will contain all the properties of the
     * map shared by all functions within the module.
     *
     */
    const g = {};

    /**
     * @name init
     * @description
     * ...
     *
     * @param {string} selector The selector in which to draw
     * @param {Object} opt Additional options for the map
     */
    function init( selector, opt ) {

        // Option settings
        if ( opt ) {} else {}

        g.width = 900;
        g.height = 600;

        g.nodes = [{
            x : g.width/2, y : g.height/2,
            bgColor : '#868f78', textColor : '#e3e3e3',
            fontSize : 19, text : 'Map name'
        }];

        g.dom = {};

        const svg = d3.select( selector ).append('svg')
            .attr('width', g.width )
            .attr('height', g.height )
            .append('g').call( zoom );

        svg.append("rect")
            .attr("width", g.width)
            .attr("height", g.height)
            .attr("fill", "#ececec")
            .attr("pointer-events", "all");

        g.dom.mmap = svg.append('g');
    }

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

    /****** Public functions ******/

    function createNode( opt ) {
        g.nodes.push({
            x : opt.x, y : opt.y,
            bgColor : opt.bgColor, textColor : opt.textColor,
            fontSize : opt.fontSize, text : opt.text
        });
        updateNodes();
    }

    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        init : init,
        createNode : createNode,
    };

}(this, window.d3));
