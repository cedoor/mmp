/**
 * @name mmap
 * @version 0.0.1
 * @author Omar Desogus
 * @license GNU GENERAL PUBLIC LICENSE
 *
 */
(function( window, d3 ) {

    /**
     * @name global
     * @description
     * Global dictionary that will contain all the properties of the
     * map shared by all functions within the module.
     *
     */
    const global = {};

    /**
     * @name init
     * @description
     * ...
     *
     * @param {string} selector The selector in which to draw
     * @param {Object} opt Additional options for the map
     */
    function init( selector, opt ) {

        const frame = d3.select( selector ).style('overflow', 'hidden');

        const svg = frame.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g').call( zoom );

        svg.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "transparent")
            .attr("pointer-events", "all");

        global.mmap = svg.append('g').attr('class', 'mmap');

        global.nodes = d3.map([{
            id : 'node0',
            x : parseInt( frame.style('width') )/2,
            y : parseInt( frame.style('height') )/2,
            background : '#f5f5f5', color : '#8d9f8e',
            font : 18, name : 'Root node'
        }], n => n.id );

        global.selected = 'node0';

        update();

    }

    /****** Utils functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 5]).on('zoom', zoomed);
    const drag = d3.drag().on('drag', dragged ).on('start', selectNode);

    function zoomed() {
        global.mmap.attr('transform',
            'translate(' + d3.event.transform.x + ',' + d3.event.transform.y + ')' +
            'scale(' + d3.event.transform.k + ')');
    }

    function dragged(n) {
        const self = d3.select(this);
        self.attr('transform', 'translate('+ (n.x = d3.event.x) +','+ (n.y = d3.event.y) +')');
    }

    function selectNode(n) {
        global.selected = n.id;
    }

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
        path = `M ${s.x} ${s.y}
              C ${(s.x + d.x) / 2} ${s.y},
                ${(s.x + d.x) / 2} ${d.y},
                ${d.x} ${d.y}`;
        return path;
    }

    function update() {

        const nodes = global.nodes.values();

        const node = global.mmap.selectAll('.node').data( nodes );

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
            .style('stroke', n => n.color )
            .attr('d', n => diagonal(n, n.parent) );

        link.exit().remove();
    }

    /****** Public functions ******/

    function createNode( opt ) {
        global.nodes.set( opt );
        update();
    }

    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        init : init
    };

}(this, window.d3));
