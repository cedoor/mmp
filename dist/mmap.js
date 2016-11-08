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

        const frame = d3.select( selector );

        const g = frame.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g').call( zoom );

        g.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "transparent")
            .attr("pointer-events", "all")
            .on('mousedown', deselect );

        // Set global variables
        global.svg = { main : g, mmap : g.append('g') };
        global.counter = 0;
        global.nodes = [{
            id : 'node' + global.counter,
            x : parseInt( frame.style('width') )/2,
            y : parseInt( frame.style('height') )/2,
            background : '#f5f5f5', color : '#8d9f8e',
            font : 18, name : 'Root node'
        }];

        selectNode( global.nodes[0] );
        update();

    }

    /****** Utils functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed);

    const drag = d3.drag().on('drag', dragged ).on('start', dragStarted );

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform.toString() );
    }

    function dragStarted(n) {
        d3.selectAll('.node > ellipse').attr('stroke', 'none');
        d3.select(this).selectAll('ellipse').attr('stroke', '#888888');
        selectNode(n);
    }

    function dragged(n) {
        const self = d3.select(this);
        self.attr('transform', 'translate('+ (n.x = d3.event.x) +','+ (n.y = d3.event.y) +')');
        d3.selectAll('.link').attr('d', n => diagonal( n ) );
    }

    function deselect() {
        d3.selectAll('.node > ellipse').attr('stroke', 'none');
        global.selected = global.nodes[0];
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

    function update() {

        const nodes = global.nodes;

        const node = global.svg.mmap.selectAll('.node').data( nodes )
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
        ellipse.attr('ry', parseInt( text.style('height') )/2 + 14 );
        text.attr('dy', parseInt( text.style('height') )/2 - 5 );

        node.exit().remove();

        const link = global.svg.mmap.selectAll('.link').data( nodes.slice(1) );

        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .style('fill', n => n.color )
            .style('stroke', n => n.color )
            .attr('d', n => diagonal( n ) );

        link.exit().remove();
    }

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

    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        init : init,
        createNode : createNode,
        getNodes : getNodes,
        selectNode : selectNode
    };

}(this, window.d3));
