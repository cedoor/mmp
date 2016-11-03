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
