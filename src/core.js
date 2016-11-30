    /****** Utils functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed );

    const drag = d3.drag().on('drag', dragged ).on('start', selectNode );

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform.toString() );
    }

    function selectNode( n ) {
        d3.selectAll('.node > ellipse').attr('stroke', 'none');
        d3.select(this).select('ellipse').attr('stroke', '#888888');
        global.selected = n.key;
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
            .call( drag );

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
