    /****** Shortcuts functions  ******/

    function setShortcuts( keys, cb ) {
        var map = {}, sc = function() {
            return shortcut( arguments, map );
        };
        onkeyup = onkeydown = function( e ) {
            map[e.keyCode] = e.type === 'keydown';
            if ( sc('ctrl','maiusc','z') ) return !!repeat();
            else if ( sc('ctrl','z') ) return !!undo();
            else if ( sc('ctrl','maiusc','up') ) moveNode('up');
            else if ( sc('ctrl','maiusc','down') ) moveNode('down');
            else if ( sc('ctrl','maiusc','left') ) moveNode('left');
            else if ( sc('ctrl','maiusc','right') ) moveNode('right');
            else if ( sc('alt','up') ) return !!moveSelection('up');
            else if ( sc('alt','down') ) return !!moveSelection('down');
            else if ( sc('alt','right') ) return !!moveSelection('right');
            else if ( sc('alt','left') ) return !!moveSelection('left');
            else if ( sc('alt','i') ) png('mmap');
            else if ( sc('alt','c') ) center();
            else if ( sc('alt','n') ) newMap();
            else if ( sc('alt','+') ) addNode();
            else if ( sc('alt','-') ) removeNode();
            else if ( sc('alt','f') ) return !!focusNode();
            else if ( sc('esc') ) deselectNode();
        }
    }

    function shortcut( keys, map ) {
        const alias = {
            'up' : 38, 'down' : 40, 'right' : 39, 'left' : 37,
            'ctrl' : 17, 'alt' : 18, 'maiusc' : 16, 'esc' : 27, 'f' : 70,
            'c' : 67, 'n' : 78, '+' : 187, '-' : 189, 'i' : 73, 'z' : 90
        }
        for ( var i = 0; i < keys.length; i++ )
            if( ! map[alias[keys[i]]] ) return false;
        return true;
    }

    function getCloserVerticalNode( pos ) {
        const currentNode = global.nodes.get( global.selected );
        const root = global.nodes.get('node0');
        const currentLevel = getNodeLevel( currentNode );
        const or = root.x > currentNode.x;
        var key, tmp = Number.MAX_VALUE;
        global.nodes.each( function( n, k ) {
            const d = pos ? currentNode.y - n.y : n.y - currentNode.y;
            const sameLevel = currentLevel === getNodeLevel( n );
            const sameNode = global.selected === k;
            const sameOr = ( or && root.x > n.x ) || ( !or && root.x < n.x );
            if ( sameOr && sameLevel && !sameNode &&  d > 0 && d < tmp ) {
                tmp = d;
                key = k;
            }
        });
        return key || global.selected;
    }

    function getCloserHorizontalNode( pos ) {
        const currentNode = global.nodes.get( global.selected );
        const root = global.nodes.get('node0');
        var key, checks, tmp = Number.MIN_VALUE;
        global.nodes.each( function( n, k ) {
            if ( currentNode.x < root.x )
                checks = pos ? n.parent === global.selected : currentNode.parent === k;
            else if ( currentNode.x > root.x )
                checks = !pos ? n.parent === global.selected : currentNode.parent === k;
            else checks = ( pos ? n.x < root.x : n.x > root.x ) && n.parent === global.selected;
            if ( checks && n.y > tmp ) {
                tmp = n.y;
                key = k;
            }
        });
        return key || global.selected;
    }

    function moveSelection( dir ) {
        selectNode({
            'up' : getCloserVerticalNode,
            'down' : getCloserVerticalNode,
            'left' : getCloserHorizontalNode,
            'right' : getCloserHorizontalNode
        }[ dir ]( dir === 'up' || dir === 'left' ));
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
        dom.attr('transform', n => 'translate(' + n.value.x + ',' + n.value.y + ')');
        d3.selectAll('.branch').attr('d', drawBranch );
        saveSnapshot();
    }
