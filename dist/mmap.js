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
            .attr('id', 'mmap')
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
            name : 'Root node',
            x : parseInt( global.container.style('width') )/2,
            y : parseInt( global.container.style('height') )/2,
            'background-color' : '#e6ede6',
            'text-color' : '#828c82', 'font-size' : 20,
            'font-style' : 'normal', 'font-weight' : 'normal'
        });

        update();
        selectNode('node0');

        events.call('mmcreate');
    }

    /****** Util functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed );

    const drag = d3.drag().on('drag', dragged ).on('start', function( n ) {
        selectNode( n.key );
    });

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform.toString() );
    }

    function dragged( n ) {
        const x = n.x = d3.event.x;
        const y = n.y = d3.event.y;
        d3.select(this).attr('transform','translate('+ x +','+ y +')');
        d3.selectAll('.link').attr('d', n => drawLink( n ) );
    }

    function selectNode( k ) {
        if( global.selected !== k || global.selected === 'node0' ) {
            global.selected = k;
            const node = d3.select('#'+ k );
            d3.selectAll('.node > ellipse').attr('stroke', 'none');
            node.select('ellipse').attr('stroke', '#587d53');
            events.call('nodeselect', node.node(), global.nodes.get( k ));
        }
    }

    function deselectNode() {
        selectNode('node0');
        d3.selectAll('.node > ellipse').attr('stroke', 'none');
    }

    function getNodeLevel( n ) {
        var p = n.parent, level = 0;
        while ( p ) {
            level++;
            p = p.parent;
        }
        return level < 5 ? level : 5;
    }

    function getNodesWithKeys() {
        const nodesWithKeys = [];
        global.nodes.each( function( n, k ) {
            n.key = k;
            nodesWithKeys.push( n );
        });
        return nodesWithKeys;
    }

    /****** Update functions  ******/

    function redraw() {
        d3.selectAll('.node, .link').remove();
        update();
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
            .attr('fill', n => n['text-color'])
            .attr('font-size', n => n['font-size'])
            .attr('font-style', n=> n['font-style'])
            .attr('font-weight', n=> n['font-weight']);

        nodeContainer.append('ellipse')
            .style('fill', n => n['background-color'] )
            .attr('rx', function( n ) {
                n.width = this.previousSibling.getBBox().width + 40;
                return n.width/2;
            }).attr('ry', function( n ) {
                n.height = n['font-size']*11/10 + 30;
                return n.height/2;
            });

        node.exit().remove();

        d3.selectAll('.node > text').each( function() {
            this.parentNode.appendChild(this);
        });

        const link = global.svg.mmap.selectAll('.link').data( nodes.slice(1) );

        link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('id', n => 'linkOf' + n.key )
            .style('fill', n => n['link-color'])
            .style('stroke', n => n['link-color'])
            .attr('d', n => drawLink( n ) );

        link.exit().remove();
    }

    function updateName( sel, v ) {
        const text = this.childNodes[1];
        const ellipse = this.childNodes[0];
        sel.name = text.innerHTML = v;
        sel.width = text.textLength.baseVal.value + 40;
        ellipse.setAttribute('rx', sel.width/2 );
    }

    function updateBackgroundColor( sel, v ) {
        const ellipse = this.childNodes[0];
        ellipse.style.setProperty('fill', sel['background-color'] = v );
    }

    function updateTextColor( sel, v ) {
        const text = this.childNodes[1];
        text.style.setProperty('fill', sel['text-color'] = v );
    }

    function updateFontSize( sel, v ) {
        const text = this.childNodes[1];
        const ellipse = this.childNodes[0];
        text.style.setProperty('font-size', sel['font-size'] = v );
        sel.width = text.textLength.baseVal.value + 40;
        sel.height = sel['font-size']*11/10 + 30;
        ellipse.setAttribute('rx', sel.width/2 );
        ellipse.setAttribute('ry', sel.height/2 );
        d3.selectAll('.link').attr('d', n => drawLink( n ) );
    }

    function updateFontStyle( sel ) {
        const text = this.childNodes[1];
        sel['font-style'] = sel['font-style'] === 'normal' ? 'italic' : 'normal';
        text.style.setProperty('font-style', sel['font-style'] );
    }

    function updateFontWeight( sel ) {
        const text = this.childNodes[1];
        sel['font-weight'] = sel['font-weight'] === 'normal' ? 'bold' : 'normal';
        text.style.setProperty('font-weight', sel['font-weight'] );
    }

    function updateLinkColor( sel, v ) {
        if( sel.key !== 'node0' ) {
            const link = document.getElementById('linkOf'+ sel.key );
            link.style.setProperty('fill', sel['link-color'] = v );
            link.style.setProperty('stroke', sel['link-color'] = v );
        } else {
            console.warn('The root node has no branches');
        }
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

            const key = 'node' + ( ++global.counter );
            const value = {
                name : prop && prop.name || 'Node',
                'background-color' : prop && prop['background-color'] || '#f1f1f1',
                'text-color' : prop && prop['text-color'] || '#808080',
                'link-color' : prop && prop['link-color'] || '#9fad9c',
                'font-size' : prop && prop['font-size'] || 16,
                'font-style' : prop && prop['font-style'] || 'normal',
                'font-weight' : prop && prop['font-weight'] || 'normal',
                x : sel.x + ( sel.x > root.x ? 200 : -200 ),
                y : sel.y + 50,
                parent : sel
            };

            global.nodes.set( key, value );
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
        const sel = global.nodes.get( global.selected );
        const dom = document.getElementById( sel.key );
        const prop = {
            'name' : updateName,
            'background-color' : updateBackgroundColor,
            'link-color' : updateLinkColor,
            'text-color' : updateTextColor,
            'font-size' : updateFontSize,
            'font-style' : updateFontStyle,
            'font-weight' : updateFontWeight,
            default : function() {
                console.error('"'+ k +'" is not a valid node property');
            }
        };
        ( prop[k] || prop.default ).call( dom, sel, v );
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
