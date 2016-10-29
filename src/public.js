    /****** Public functions ******/

    function createNode( opt ) {

        mmp.nodes.push( mmp.sheet.append('ellipse')
            .attr('cx', opt.x )
            .attr('cy', opt.y )
            .attr('rx', 40 )
            .attr('ry', 20 )
            .attr('fill', opt.fill || '#b9c7a5')
        );

    }
