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
            .on('mousedown', deselectNodes );

        // Set global variables
        global.svg = { main : g, mmap : g.append('g') };
        global.counter = 0;
        global.nodes = d3.map();

        global.nodes.set('node' + global.counter, {
            x : parseInt( frame.style('width') )/2,
            y : parseInt( frame.style('height') )/2,
            background : '#f5f5f5', color : '#8d9f8e',
            font : 18, name : 'Root node'
        });

        selectNode('node0');
        update();

    }

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
            (n.parent.x + n.x - n.width/2) / 2, n.parent.y - 5,
            (n.parent.x + n.x - n.width/2) / 2, n.y + n.height/2 + 5,
            n.x - n.width/2, n.y + n.height/2 + 5
        );
        path.lineTo( n.x, n.y + n.height/2 + 7 );
        path.lineTo( n.x - n.width/2, n.y + n.height/2 + 10 );
        path.bezierCurveTo(
            (n.parent.x + n.x - n.width/2) / 2 + 5, n.y + n.height/2 + 10,
            (n.parent.x + n.x - n.width/2) / 2 + 10, n.parent.y - 5,
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
            .attr('rx', function( n ) {
                n.width = this.previousSibling.getBBox().width + 40;
                return n.width/2;
            }).attr('ry', function( n ) {
                n.height = this.previousSibling.getBBox().height + 20;
                return n.height/2;
            });

        node.exit().remove();

        const link = global.svg.mmap.selectAll('.link').data( nodes.slice(1) );

        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .style('fill', n => n.color )
            .style('stroke', n => 'none' )
            .attr('d', n => diagonal( n ) );

        link.exit().remove();

        d3.selectAll('.node > text').each( function() {
            this.parentNode.appendChild(this);
        });
    }

    /****** Public functions ******/

    function createNode( prop ) {
        if ( global.selected ) {
            const sel = global.nodes.get( global.selected );
            global.nodes.set('node' + ( ++global.counter ), {
                parent : sel,
                x : sel.x + 200,
                y : sel.y + 50,
                background : prop.background || '#e6e6e6',
                color : prop.color || '#6f6f6f',
                font : prop.font || 15,
                name : prop.name || 'Node'
            });
            update();
        }
    }

    // To fix
    function deleteNode(){
        if( global.selected !== 'node0' ) {
            global.nodes.remove( global.selected );
            deselectNodes();
            update();
        }
    }

    function resetZoom() {
        global.svg.main.transition().duration(500).call( zoom.transform, d3.zoomIdentity );
    }

    function getNodes() {
        return global.nodes.values();
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
        deleteNode : deleteNode,
        selectNode : selectNode
    };

}(this, window.d3));
