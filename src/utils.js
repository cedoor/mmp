    /****** Util functions ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed );

    const drag = d3.drag().on('drag', dragged ).on('start', function( n ) {
        selectNode( n.key );
    }).on('end', function() {
        if ( global.dragged ) {
            global.dragged = false;
            saveSnapshot();
        }
    });

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform );
    }

    function findXPosition( sel, root ) {
        var dir;
        if ( sel.x > root.x ) dir = 1;
        else if ( sel.x < root.x ) dir = -1;
        else {
            const f = n => n.parent === 'node0',
            l = global.nodes.values().filter( f ).length;
            dir = l % 2 === 0 ? -1 : 1;
        }
        return sel.x + 200 * dir;
    }

    function orientation( x ) {
        return x < global.nodes.get('node0').x;
    }

    function error( message ) {
        console.error( message );
        return false;
    }

    function setNodeCoords( dom, x, y ) {
        dom.setAttribute('transform','translate('+[ x, y ]+')');
    }

    function setZoom( inout ) {
        const main = global.svg.main;
        var k = d3.zoomTransform( main.node() ).k;
        k += inout ? k/5 : -k/5;
        zoom.scaleTo( main.transition().duration( 100 ), k );
    }

    function dragged( n ) {
        const dy = d3.event.dy, dx = d3.event.dx,
        x = n.value.x += dx, y = n.value.y += dy, parent = n,
        sameOrientation = orientation( x ) === orientation( x - dx );
        setNodeCoords( this, x, y );
        if ( n.value.fixed ) subnodes( n.key, function( n, k ) {
            const x = n.x += dx, y = n.y += dy;
            if ( !sameOrientation ) n.x += ( parent.value.x - n.x )*2;
            setNodeCoords( this, x, y );
        });
        d3.selectAll('.branch').attr('d', drawBranch );
        global.dragged = true;
    }

    function subnodes( key, cb ) {
        global.nodes.each( function( n, k ) {
            if ( n.parent === key ) {
                cb.call( document.getElementById( k ), n, k );
                subnodes( k, cb );
            }
        });
    }

    function getNodeDom( key ) {
        return document.getElementById( key );
    }

    function deselectNode() {
        selectNode('node0');
        d3.select('#node0 > path').style('stroke', 'none');
    }

    function getNodeLevel( n ) {
        var p = n.parent, level = 0;
        while ( p ) {
            level++;
            const n = global.nodes.get( p );
            p = n.parent;
        }
        return level;
    }

    function clearObject( obj ) {
        for ( var member in obj ) delete obj[member];
    }

    function cloneObject( obj ) {
        return Object.assign( {}, obj );
    }

    function styles( el ) {
        var css = "";
        const sheets = document.styleSheets;
        for (var i = 0; i < sheets.length; i++) {
            const rules = sheets[i].cssRules;
            for (var j = 0; j < rules.length; j++) {
                const rule = rules[j],
                fontFace = rule.cssText.match(/^@font-face/);
                if ( el.querySelector( rule.selectorText ) || fontFace )
                    css += rule.cssText;
            }
        }
        return css;
    }

    function checkItalicFont( italic ) {
        return italic ? 'italic' : 'normal';
    }

    function checkBoldFont( bold ) {
        return bold ? 'bold' : 'normal';
    }

    function createRootNode() {
        const value = Object.assign( global.options['root-node'], {
            'x' : parseInt( global.container.style('width') )/2,
            'y' : parseInt( global.container.style('height') )/2
        });
        addNode('node' + global.counter, value );
        selectNode('node0');
    }

    function overwriteProperties( target, source ) {
        for ( let prop in target ) {
            var t = target[ prop ], s = source[ prop ];
            if ( s && s.constructor === t.constructor ) {
                if ( s.constructor === Object ) overwriteProperties( t, s )
                else target[ prop ] = s;
            }
        }
    }

    function addNode( key, value ) {
        global.nodes.set( key, value );
        update();
        events.call('nodecreate', getNodeDom( key ), key, value );
        saveSnapshot();
    }

    function reEncode( data ) {
        data = encodeURIComponent( data );
        data = data.replace( /%([0-9A-F]{2})/g, function( match, p1 ) {
            const c = String.fromCharCode('0x'+p1);
            return c === '%' ? '%25' : c;
        });
        return decodeURIComponent( data );
    }

    function getDataURI() {
        const el = global.svg.mmap.node(),
        svg = document.createElementNS('http://www.w3.org/2000/svg','svg'),
        xmlns = "http://www.w3.org/2000/xmlns/",
        box = el.getBBox(), padding = 15,
        x = box.x - padding, y = box.y - padding,
        w = box.width + padding*2, h = box.height + padding*2;

        svg.setAttributeNS( xmlns, "xmlns", "http://www.w3.org/2000/svg");
        svg.setAttributeNS( xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
        svg.setAttribute("version", "1.1");
        svg.setAttribute("width", w );
        svg.setAttribute("height", h );
        svg.setAttribute("viewBox", [ x, y, w, h ].join(" ") );

        const css = styles( el ),
        s = document.createElement('style'),
        defs = document.createElement('defs');

        s.setAttribute('type', 'text/css');
        s.innerHTML = "<![CDATA[\n" + css + "\n]]>";
        defs.appendChild( s );
        svg.appendChild( defs );

        const clone = el.cloneNode( true );
        clone.setAttribute('transform', 'translate(0,0)');
        svg.appendChild( clone );

        const uri = window.btoa(reEncode( svg.outerHTML ));
        return 'data:image/svg+xml;base64,' + uri;
    }

    function setCounter() {
        const getIntOfKey = k => parseInt( k.substring(4) ),
        keys = global.nodes.keys().map( getIntOfKey );
        global.counter = Math.max(...keys);
    }

    function mapClone() {
        return global.nodes.entries().map( function( node ) {
            const value = cloneObject( node.value );
            delete value.width;
            delete value.height;
            return { key : node.key, value : value };
        });
    }

    function saveSnapshot() {
        const h = global.history;
        if ( h.index < h.snapshots.length - 1 ) h.snapshots.splice( h.index + 1 );
        h.snapshots.push( mapClone() );
        h.index++;
    }

    function loadSnapshot( snapshot ) {
        global.nodes.clear();
        snapshot.forEach( function( node ) {
            global.nodes.set( node.key, cloneObject( node.value ) );
        });
        redraw();
        setCounter();
        deselectNode();
    }
