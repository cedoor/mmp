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
        var key, tmp = 100000;
        const root = global.nodes.get('node0');
        const or = root.x > node.x;
        global.nodes.each( function( n, k ) {
            const d = {'up' : node.y - n.y, 'down' : n.y - node.y }[pos];
            const sameLevel = node.parent === n.parent;
            const sameNode = node.key === n.key;
            const sameOr = ( or && root.x >= n.x ) || ( !or && root.x <= n.x );
            if ( sameOr && sameLevel && !sameNode &&  d > 0 && d < tmp ) {
                tmp = d;
                key = n.key;
            }
        });
        return key || node.key;
    }

    function getCloserHorizontalNode( node, pos ) {
        var key;
        const level = getNodeLevel( node );
        const root = global.nodes.get('node0');
        const or = root.x > node.x;
        global.nodes.each( function( n, k ) {
            const sameOr = ( or && root.x >= n.x ) || ( !or && root.x <= n.x );
            const l = getNodeLevel( n );
            var checkLevel;
            if ( or ) {
                checkLevel = pos === 'left' ? l === level+1 : l === level-1;
            } else {
                checkLevel = pos === 'right' ? l === level+1 : l === level-1;
            }
            if ( sameOr && checkLevel ) {
                key = n.key;
            }
        });
        return key || node.key;
    }

    function moveSelection( dir ) {
        selectNode({
            'up' : getCloserVerticalNode,
            'down' : getCloserVerticalNode,
            'left' : getCloserHorizontalNode,
            'right' : getCloserHorizontalNode
        }[ dir ]( global.nodes.get( global.selected ), dir ));
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
