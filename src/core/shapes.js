    /****** Shape functions  ******/

    function drawLink( n ) {

        const width = 22 - getNodeLevel( n ) * 3;
        const middleX = ( n.parent.x + n.x ) / 2;
        const orY = n.parent.y < n.y + n.height/2 ? -1 : 1;
        const orX = n.parent.x > n.x ? -1 : 1;

        const path = d3.path();
        path.moveTo( n.parent.x, n.parent.y - width/2 );
        path.bezierCurveTo(
            middleX, n.parent.y,
            n.parent.x, n.y + n.height/2 + 2,
            n.x - n.width/4*orX, n.y + n.height/2 + 2
        );
        path.bezierCurveTo(
            n.parent.x + width*orY*orX, n.y + n.height/2 + 2 + width,
            middleX + (width*2)*orY*orX, n.parent.y + width,
            n.parent.x, n.parent.y + width/2
        );
        path.closePath();

        return path;
    }

    function drawBgShape( n ) {

        const path = d3.path();
        const x = ( n.width = this.nextSibling.getBBox().width + 50 )/2;
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
