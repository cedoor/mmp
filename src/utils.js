    /****** Util functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed );

    const drag = d3.drag().on('drag', dragged ).on('start', function( n ) {
        selectNode( n.key );
    }).on('end', function() {
        if ( global.dragged ) {
            global.dragged = false;
            saveSnapshot();
        };
    });

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform );
    }

    function dragged( n ) {
        global.dragged = true;
        const x = n.x = d3.event.x;
        const y = n.y = d3.event.y;
        d3.select(this).attr('transform','translate('+ x +','+ y +')');
        d3.selectAll('.branch').attr('d', drawBranch );
    }

    function selectNode( key ) {
        if( global.selected !== key || global.selected === 'node0' ) {
            d3.selectAll('.node > path').style('stroke', 'none');
            global.selected = key;
            const node = d3.select('#'+ key );
            const bg = node.select('path');
            bg.style('stroke', d3.color( bg.style('fill') ).darker( .5 ) );
            events.call('nodeselect', node.node(), global.nodes.get( key ));
        }
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

    function getNodesWithKeys() {
        const nodesWithKeys = [];
        global.nodes.each( function( n, k ) {
            n.key = k;
            nodesWithKeys.push( n );
        });
        return nodesWithKeys;
    }

    function styles( el ) {
        var css = "";
        const sheets = document.styleSheets;
        for (var i = 0; i < sheets.length; i++) {
            const rules = sheets[i].cssRules;
            for (var j = 0; j < rules.length; j++) {
                const rule = rules[j];
                const fontFace = rule.cssText.match(/^@font-face/);
                if ( el.querySelector( rule.selectorText ) || fontFace )
                    css += rule.cssText;
            }
        }
        return css;
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
        const el = global.svg.mmap.node();
        const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');

        const box = el.getBBox();
        const padding = 15;
        const x = box.x - padding;
        const y = box.y - padding;
        const w = box.width + padding*2;
        const h = box.height + padding*2;

        const xmlns = "http://www.w3.org/2000/xmlns/";
        svg.setAttributeNS( xmlns, "xmlns", "http://www.w3.org/2000/svg");
        svg.setAttributeNS( xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
        svg.setAttribute("version", "1.1");
        svg.setAttribute("width", w );
        svg.setAttribute("height", h );
        svg.setAttribute("viewBox", [ x, y, w, h ].join(" ") );

        const css = styles( el );
        const s = document.createElement('style');
        const defs = document.createElement('defs');
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

    function createRootNode() {
        global.nodes.set('node' + global.counter, {
            name : 'Root node',
            x : parseInt( global.container.style('width') )/2,
            y : parseInt( global.container.style('height') )/2,
            'background-color' : '#e6ede6',
            'text-color' : '#828c82', 'font-size' : 20,
            'font-style' : 'normal', 'font-weight' : 'normal'
        });
    }

    function setCounter() {
        const getIntOfKey = k => parseInt( k.substring(4) );
        const keys = global.nodes.keys().map( getIntOfKey );
        global.counter = Math.max(...keys);
    }

    function d3MapConverter( data ) {
        const map = d3.map();
        data.forEach( function( node ) {
            map.set( node.key, Object.assign( {}, node.value ) );
        });
        return map;
    }

    function saveSnapshot() {
        const h = global.history;
        if ( h.index < h.snapshots.length - 1 ) h.snapshots.splice( h.index + 1 );
        const nodes = JSON.parse( JSON.stringify( global.nodes.entries() ) );
        h.snapshots.push( nodes );
        h.index++;
    }

    function loadSnapshot( snapshot ) {
        global.nodes = d3MapConverter( snapshot );
        redraw();
        deselectNode();
        setCounter();
    }
