    /****** Shape functions  ******/

    function drawBranch( n ) {

        const p = global.nodes.get( n.parent );
        const width = 22 - getNodeLevel( n ) * 3;
        const middleX = ( p.x + n.x ) / 2;
        const orY = p.y < n.y + n.height/2 ? -1 : 1;
        const orX = p.x > n.x ? -1 : 1;
        const inv = orX*orY;

        const path = d3.path();
        path.moveTo( p.x, p.y - width*.8 );
        path.bezierCurveTo(
            middleX - width*inv, p.y - width/2,
            p.x - width/2*inv, n.y + n.height/2 - width/3,
            n.x - n.width/3*orX, n.y + n.height/2 + 3
        );
        path.bezierCurveTo(
            p.x + width/2*inv, n.y + n.height/2 + width/3,
            middleX + width*inv, p.y + width/2,
            p.x, p.y + width*.8
        );
        path.closePath();

        return path;
    }

    function drawBgShape( n ) {

        const path = d3.path();
        const x = ( n.width = this.nextSibling.getBBox().width + 45 )/2;
        const y = ( n.height = n['font-size']*11/10 + 30 )/2;
        const k = n.k = n.k || d3.randomUniform( -20, 20 )();

        path.moveTo( -x, k/3 );
        path.bezierCurveTo( -x, -y +10, -x + 10, -y, k, -y );
        path.bezierCurveTo( x - 10, -y, x, -y + 10, x, k/3 );
        path.bezierCurveTo( x, y - 10, x - 10, y, k, y );
        path.bezierCurveTo( -x + 10, y, -x, y - 10, -x, k/3 );
        path.closePath();

        return path;
    }
