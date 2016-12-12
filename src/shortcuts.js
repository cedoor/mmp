    /****** Shortcuts functions  ******/

    function setShortcuts( keys, cb ) {
        var map = {}, sc = function() {
            return shortcut( arguments, map );
        };
        onkeyup = onkeydown = function( e ) {
            map[e.keyCode] = e.type === 'keydown';
            if ( sc('ctrl','up') ) moveNode('up');
            else if ( sc('ctrl','down') ) moveNode('down');
            else if ( sc('ctrl','left') ) moveNode('left');
            else if ( sc('ctrl','right') ) moveNode('right');
            else if ( sc('up') ) moveSelection('up');
            else if ( sc('down') ) moveSelection('down');
            else if ( sc('right') ) moveSelection('right');
            else if ( sc('left') ) moveSelection('left');
            else if ( sc('c') ) center();
            else if ( sc('n') ) newMap();
            else if ( sc('+') ) addNode();
            else if ( sc('-') ) removeNode();
            else if ( sc('enter') ) focusNode();
            else if ( sc('esc') ) deselectNode();
        }
    }

    function shortcut( keys, map ) {
        const alias = {
            'up' : 38, 'down' : 40, 'right' : 39, 'left' : 37,
            'ctrl' : 17, 'alt' : 18, 'maiusc' : 16,
            'esc' : 27, 'enter' : 13,
            'c' : 67, 'n' : 78, '+' : 187, '-' : 189
        }
        for ( var i = 0; i < keys.length; i++ )
            if( ! map[alias[keys[i]]] ) return false;
        return true;
    }

    function focusNode() {
        const node = d3.select('#'+ global.selected );
        const bg = node.select('path');
        bg.style('stroke', d3.color( bg.style('fill') ).darker( .5 ) );
        const e = new MouseEvent('dblclick');
        node.node().dispatchEvent( e );
    }

    function getCloserVerticalNode( node, pos ) {
        const root = global.nodes.get('node0');
        const currentLevel = getNodeLevel( node );
        const or = root.x > node.x;
        var key, tmp = Number.MAX_VALUE;
        global.nodes.each( function( n, k ) {
            const d = pos ? node.y - n.y : n.y - node.y;
            const sameLevel = currentLevel === getNodeLevel( n );
            const sameNode = node.key === n.key;
            const sameOr = ( or && root.x > n.x ) || ( !or && root.x < n.x );
            if ( sameOr && sameLevel && !sameNode &&  d > 0 && d < tmp ) {
                tmp = d;
                key = n.key;
            }
        });
        return key || node.key;
    }

    function getCloserHorizontalNode( node, pos ) {
        const root = global.nodes.get('node0');
        const currentLevel = getNodeLevel( node );
        var key, checks, nextLevel, tmp = Number.MIN_VALUE;

        if ( node.x < root.x ) nextLevel = currentLevel + ( pos ?  1 : -1 )
        else if ( node.x > root.x ) nextLevel = currentLevel + ( !pos ?  1 : -1 )
        else nextLevel = currentLevel + 1;

        global.nodes.each( function( n, k ) {
            if ( node.x < root.x ) {
                checks = ( n.x < root.x || n.key === 'node0' ) &&
                         ( pos ? n.parent === node.key : true );
                console.log( n.parent, node.key )
            }
            else if ( node.x > root.x ) {
                checks = n.x > root.x || n.key === 'node0';
            }
            else checks = pos ? n.x < root.x : n.x > root.x
            if ( checks && getNodeLevel( n ) === nextLevel && n.y > tmp ) {
                tmp = n.y;
                key = n.key;
            }
        });

        return key || node.key;
    }

    function moveSelection( dir ) {
        const sel = global.nodes.get( global.selected );
        selectNode({
            'up' : getCloserVerticalNode,
            'down' : getCloserVerticalNode,
            'left' : getCloserHorizontalNode,
            'right' : getCloserHorizontalNode
        }[ dir ]( sel, dir === 'up' || dir === 'left' ));
    }

    function moveNode( dir ) {
        const s = global.nodes.get( global.selected );
        const dom = d3.select('#' + global.selected );
        const range = 10;
        switch ( dir ) {
            case 'up': s.y -= range; break;
            case 'down': s.y += range; break;
            case 'right': s.x += range; break;
            case 'left': s.x -= range; break;
        }
        dom.attr('transform', n => 'translate(' + n.x + ',' + n.y + ')');
        d3.selectAll('.branch').attr('d', drawBranch );
    }
