    /****** Update functions  ******/

    function redraw() {
        d3.selectAll('.node, .branch').remove();
        update();
    }

    function update() {
        const map = global.nodes.entries(),
        nodes = global.svg.mmap.selectAll('.node').data( map ),
        branches = global.svg.mmap.selectAll('.branch').data( map.slice(1) );

        const node = nodes.enter().append('g')
            .style('cursor', 'pointer')
            .attr('class', 'node')
            .attr('id', n => n.key )
            .attr('transform', n => 'translate(' + n.value.x + ',' + n.value.y + ')')
            .call( drag )
            .on('dblclick', function( n ) {
                events.call('nodefocus', this, n.key, n.value );
                d3.event.stopPropagation();
            });

        node.append('text').text( n => n.value.name )
            .style('font-family', 'sans-serif')
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'middle')
            .style('fill', n => n.value['text-color'])
            .style('font-size', n => n.value['font-size'])
            .style('font-style', n => checkItalicFont( n.value.italic ) )
            .style('font-weight', n => checkBoldFont( n.value.bold ));

        node.insert('path', 'text')
            .style('fill', n => n.value['background-color'])
            .style('stroke-width', 3 )
            .attr('d', drawBackgroundShape );

        branches.enter().insert('path', 'g')
            .style('fill', n => n.value['branch-color'])
            .style('stroke', n => n.value['branch-color'])
            .attr('class', 'branch')
            .attr('id', n => 'branchOf' + n.key )
            .attr('d', drawBranch );

        nodes.exit().remove();
        branches.exit().remove();
    }

    function updateName( sel, v, vis ) {
        if ( sel.name != v ) {
            this.childNodes[1].innerHTML = v;
            d3.select( this.childNodes[0] ).attr('d', drawBackgroundShape );
            d3.selectAll('.branch').attr('d', drawBranch );
            if ( !vis ) sel.name = v;
        } else return false;
    }

    function updateBackgroundColor( sel, v, vis ) {
        if ( sel['background-color'] !== v ) {
            const bg = this.childNodes[0];
            bg.style['fill'] = v;
            if ( bg.style['stroke'] !== 'none' )
                bg.style['stroke'] = d3.color( v ).darker( .5 );
            if ( !vis ) sel['background-color'] = v;
        } else return false;
    }

    function updateTextColor( sel, v, vis ) {
        if ( sel['text-color'] !== v ) {
            this.childNodes[1].style['fill'] = v;
            if ( !vis ) sel['text-color'] = v;
        } else return false;
    }

    function updateBranchColor( sel, v, vis ) {
        if( global.selected !== 'node0' ) {
            if ( sel['branch-color'] !== v ) {
                const branch = document.getElementById('branchOf'+ global.selected );
                branch.style['fill'] = branch.style['stroke'] = v;
                if ( !vis ) sel['branch-color'] = v;
            } else return false;
        } else return error('The root node has no branches');
    }

    function updateFontSize( sel, v, vis ) {
        if ( sel['font-size'] != v ) {
            this.childNodes[1].style['font-size'] = v;
            d3.select( this.childNodes[0] ).attr('d', drawBackgroundShape );
            d3.selectAll('.branch').attr('d', drawBranch );
            if ( !vis ) sel['font-size'] = v;
        } else return false;
    }

    function updateItalicFont( sel ) {
        const style = checkItalicFont( sel.italic = !sel.italic );
        this.childNodes[1].style['font-style'] = style;
    }

    function updateBoldFont( sel ) {
        const style = checkBoldFont( sel.bold = !sel.bold );
        this.childNodes[1].style['font-weight'] = style;
    }

    function updateFixStatus( sel ) {
        if ( global.selected !== 'node0' ) sel.fixed = !sel.fixed;
        else return error('The root node can not be fixed');
    }
