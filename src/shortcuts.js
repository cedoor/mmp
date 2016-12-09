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

    // To fix
    function moveSelection( dir ) {
        const s = global.nodes.get( global.selected );
        var tmp, node = s.key;
        switch ( dir ) {
            case 'up':
                tmp = 10000;
                global.nodes.each( function( n, k ) {
                    const range = s.y - n.y;
                    if ( range > 0 && range < tmp && s.key !== n.key ) {
                        tmp = range;
                        node = n.key;
                    }
                });
                break;
            case 'down':
                tmp = -10000;
                global.nodes.each( function( n, k ) {
                    const range = s.y - n.y;
                    if ( range < 0 && range > tmp && s.key !== n.key ) {
                        tmp = range;
                        node = n.key;
                    }
                });
                break;
            case 'right':
                tmp = -10000;
                global.nodes.each( function( n, k ) {
                    const range = s.x - n.x;
                    if ( range < 0 && range > tmp && s.key !== n.key ) {
                        tmp = range;
                        node = n.key;
                    }
                });
                break;
            case 'left':
                tmp = 10000;
                global.nodes.each( function( n, k ) {
                    const range = s.x - n.x;
                    if ( range > 0 && range < tmp && s.key !== n.key ) {
                        tmp = range;
                        node = n.key;
                    }
                });
                break;
        }
        selectNode( node );
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
