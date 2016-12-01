    /****** Link functions  ******/

    function drawLink( n ) {

        const width = 30 - getNodeLevel( n ) * 5;
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
