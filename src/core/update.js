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
            .attr('font-style', n => n['font-style'])
            .attr('font-weight', n => n['font-weight']);

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
