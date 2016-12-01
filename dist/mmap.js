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
     */
    function init( selector ) {

        global.container = d3.select( selector );
        global.svg = {};

        global.svg.main = global.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g').call( zoom );

        global.svg.main.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "white")
            .attr("pointer-events", "all")
            .on('mousedown', deselectNode );

        global.svg.mmap = global.svg.main.append('g');
        global.nodes = d3.map();
        global.counter = 0;

        global.nodes.set('node' + global.counter, {
            x : parseInt( global.container.style('width') )/2,
            y : parseInt( global.container.style('height') )/2,
            background : '#e6ede6', textColor : '#828c82',
            font : 18, name : 'Root node'
        });

        update();
        selectNode('node0');

        events.call('mmcreate');
    }

    /****** Utils functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed );

    const drag = d3.drag().on('drag', dragged ).on('start', function( n ) {
        selectNode( n.key );
    });

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform.toString() );
    }

    function selectNode( k ) {
        if( global.selected !== k ) {
            global.selected = k;
            const node = d3.select('#'+ k );
            d3.selectAll('.node > ellipse').attr('stroke', 'none');
            node.select('ellipse').attr('stroke', '#888888');
            events.call('nodeselect', node.node(), global.nodes.get( k ));
        }
    }

    function dragged( n ) {
        const x = n.x = d3.event.x;
        const y = n.y = d3.event.y;
        d3.select(this).attr('transform','translate('+ x +','+ y +')');
        d3.selectAll('.link').attr('d', n => diagonal( n ) );
    }

    function deselectNode() {
        d3.selectAll('.node > ellipse').attr('stroke', 'none');
        global.selected = 'node0';
    }

    function nodeLevel( n ) {
        var p = n.parent, level = 0;
        while ( p ) {
            level++;
            p = p.parent;
        }
        return level < 5 ? level : 5;
    }

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal( n ) {

        const width = 30 - nodeLevel( n ) * 5;
        const orY = n.parent.y < n.y ? -1 : 1;
        const orX = n.parent.x > n.x ? -1 : 1;
        const middleX = ( n.parent.x + n.x ) / 2;
        const k = n.k = n.k || d3.randomUniform(50)();

        const path = d3.path();
        path.moveTo( n.parent.x, n.parent.y - width/2 );
        path.bezierCurveTo(
            middleX, n.parent.y - width/2,
            n.parent.x + k*orX, n.y + n.height/2 + 5 + k/10,
            n.x - ( n.width/4 - k/2 )*orX, n.y + n.height/2 + 5 + k/10
        );
        path.bezierCurveTo(
            n.parent.x + k*orX + width/2*orY*orX, n.y + n.height/2 + width/2 + 5 + k/10,
            middleX + width/2*orY*orX, n.parent.y + width/2,
            n.parent.x, n.parent.y + width/2
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
            .attr('id', n => n.key )
            .attr('transform', n => 'translate(' + n.x + ',' + n.y + ')')
            .call( drag )
            .on('dblclick', function( n ) {
                events.call('nodedblclick', this, n);
                d3.event.stopPropagation();
            });

        nodeContainer.append('text').text( n => n.name )
            .attr('fill', n => n.textColor )
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
            .style('fill', n => n.linkColor )
            .style('stroke', n => n.linkColor )
            .attr('d', n => diagonal( n ) );

        link.exit().remove();

        d3.selectAll('.node > text').each( function() {
            this.parentNode.appendChild(this);
        });
    }

    function redraw() {
        d3.selectAll('.node, .link').remove();
        update();
    }

    // Node update functions...

    function updateName( s, v ) {
        const node = document.getElementById( s.key );
        const text = node.childNodes[1];
        const ellipse = node.childNodes[0];
        s.name = text.innerHTML = v;
        s.width = text.textLength.baseVal.value + 40;
        ellipse.setAttribute('rx', s.width/2 );
    }

    /****** Public functions ******/

    const events = d3.dispatch(
        'mmcreate', 'mmcenter',
        'nodeselect', 'nodecreate', 'noderemove', 'nodedblclick'
    );

    function addNode( prop ) {
        if( global.selected ) {
            const sel = global.nodes.get( global.selected );
            const root = global.nodes.get('node0');
            global.nodes.set('node' + ( ++global.counter ), {
                parent : sel,
                x : sel.x + ( sel.x > root.x ? 200 : -200 ),
                y : sel.y + 50,
                background : prop && prop.background || '#f1f1f1',
                textColor : prop && prop.textColor || '#808080',
                linkColor : prop && prop.linkColor || '#9fad9c',
                font : prop && prop.font || 15,
                name : prop && prop.name || 'Node'
            });
            update();
            events.call('nodecreate');
        }
    }

    function removeNode() {
        if( global.selected !== 'node0' ) {
            global.nodes.remove( global.selected );

            const clean = function( key ) {
                global.nodes.each( function( n ) {
                    if ( n.key !== 'node0' && n.parent.key === key ) {
                        global.nodes.remove( n.key );
                        clean( n.key );
                        return;
                    }
                });
            }
            clean( global.selected );

            global.selected = 'node0';
            redraw();
            events.call('noderemove');
        } else {
            console.warn('The root node can not be deleted');
        }
    }

    function center() {
        global.svg.main.transition().duration(500).call( zoom.transform, d3.zoomIdentity );
        events.call('mmcenter');
    }

    function updateNode( k, v ) {
        const s = global.nodes.get( global.selected );
        const prop = {
            'name' : updateName,
            default : function() {
                console.error('"'+ k +'" is not a valid node property');
            }
        };
        ( prop[k] || prop.default )( s, v );
    }

    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        // Basic
        init : init,
        center : center,
        addNode : addNode,
        removeNode : removeNode,

        // Advanced
        updateNode : updateNode,
        events : events
    };

}(this, window.d3));
