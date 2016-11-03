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
        // Dom elements
        g.dom = {};
        // Properties of nodes
        g.nodes = {
            list : [],
            selected : 0,
            style : {
                bgColor : '#f0f0f0',
                textColor : '#787878',
                fontSize : 15,
                text : 'Node'
            }
        };
        // Option settings
        if ( opt ) {

        }

        const container = d3.select( selector ).style('overflow', 'hidden');

        const svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g').call( zoom );

        svg.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "transparent")
            .attr("pointer-events", "all");

        g.dom.mmap = svg.append('g');

        // Creation of the root node
        createNode({
            x : parseInt(container.style('width'))/2,
            y : parseInt(container.style('height'))/2,
            bgColor : '#868f78', textColor : '#e3e3e3',
            fontSize : 19, text : 'Map name'
        });
    }

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

    /****** Public functions ******/

    function createNode( opt ) {
        const defaultStyle = g.nodes.style;
        const n = {
            x : opt.x, y : opt.y,
            bgColor : opt.bgColor || defaultStyle.bgColor,
            textColor : opt.textColor || defaultStyle.textColor,
            fontSize : opt.fontSize || defaultStyle.fontSize,
            text : opt.text || defaultStyle.text
        };

        const a = g.dom.mmap.append('g')
            .attr('transform', 'translate('+ n.x +','+ n.y +')')
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

        g.nodes.list.push({
            x : opt.x, y : opt.y,
            bgColor : opt.bgColor, textColor : opt.textColor,
            fontSize : opt.fontSize, text : opt.text
        });
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
