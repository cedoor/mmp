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
            .style('font-style', n => n.value['font-style'])
            .style('font-weight', n => n.value['font-weight']);

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

    function updateName( sel, v ) {
        if ( sel.name != v ) {
            const text = this.childNodes[1];
            const bg = this.childNodes[0];
            sel.name = text.innerHTML = v;
            sel.width = text.textLength.baseVal.value + 45;
            d3.select( bg ).attr('d', drawBackgroundShape );
            saveSnapshot();
        } else return false;
    }

    function updateBackgroundColor( sel, v ) {
        if ( sel['background-color'] !== v ) {
            const bg = this.childNodes[0];
            bg.style.setProperty('fill', sel['background-color'] = v );
            bg.style.setProperty('stroke', d3.color( v ).darker( .5 ) );
            saveSnapshot();
        } else return false;
    }

    function updateTextColor( sel, v ) {
        if ( sel['text-color'] !== v ) {
            const text = this.childNodes[1];
            text.style.setProperty('fill', sel['text-color'] = v );
            saveSnapshot();
        } else return false;
    }

    function updateFontSize( sel, v ) {
        if ( sel['font-size'] != v ) {
            const text = this.childNodes[1];
            const bg = this.childNodes[0];
            text.style.setProperty('font-size', sel['font-size'] = v );
            sel.width = text.textLength.baseVal.value + 45;
            sel.height = sel['font-size']*11/10 + 30;
            d3.select( bg ).attr('d', drawBackgroundShape );
            d3.selectAll('.branch').attr('d', drawBranch );
            saveSnapshot();
        } else return false;
    }

    function updateFontStyle( sel ) {
        const text = this.childNodes[1];
        sel['font-style'] = sel['font-style'] === 'normal' ? 'italic' : 'normal';
        text.style.setProperty('font-style', sel['font-style'] );
        saveSnapshot();
    }

    function updateFontWeight( sel ) {
        const text = this.childNodes[1];
        sel['font-weight'] = sel['font-weight'] === 'normal' ? 'bold' : 'normal';
        text.style.setProperty('font-weight', sel['font-weight'] );
        saveSnapshot();
    }

    function updateBranchColor( sel, v ) {
        if( global.selected !== 'node0' ) {
            if ( sel['branch-color'] !== v ) {
                const branch = document.getElementById('branchOf'+ global.selected );
                branch.style.setProperty('fill', sel['branch-color'] = v );
                branch.style.setProperty('stroke', sel['branch-color'] = v );
                saveSnapshot();
            } else return false;
        } else return error('The root node has no branches');
    }

    function updateFixStatus( sel ) {
        if ( global.selected !== 'node0' ) {
            sel.fixed = !sel.fixed;
            saveSnapshot();
        }
        else return error('The root node can not be fixed');
    }
