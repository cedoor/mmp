/**
 * @name mmap
 * @version 0.0.1
 * @author Omar Desogus
 * @license GNU GENERAL PUBLIC LICENSE
 *
 */
(function( window, d3 ) { 'use strict';

    /**
     * @name global
     * @description
     * Global dictionary that will contain all the properties of the
     * map shared by all functions within the module.
     *
     */
    const global = {};

    /**
     * @name init
     * @description
     * ...
     *
     * @param {string} selector The selector in which to draw
     */
    function init( selector ) {

        global.container = d3.select( selector );
        global.history = { index : -1, snapshots : [] };
        global.svg = {};

        global.svg.main = global.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .call( zoom );

        global.svg.main.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "white")
            .attr("pointer-events", "all")
            .on('click', deselectNode );

        global.svg.mmap = global.svg.main.append('g');
        global.nodes = d3.map();
        global.counter = 0;

        createRootNode();
        update();
        saveSnapshot();

        setShortcuts();
        events.call('mmcreate');
        window.onresize = center;
        deselectNode();
    }

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

    function selectNode( key ) {
        if( global.selected !== key || global.selected === 'node0' ) {
            d3.selectAll('.node > path').style('stroke', 'none');
            global.selected = key;
            const node = d3.select('#'+ key ), bg = node.select('path');
            bg.style('stroke', d3.color( bg.style('fill') ).darker( .5 ) );
            events.call('nodeselect', node.node(), key, global.nodes.get( key ));
        }
    }

    function focusNode() {
        const node = d3.select('#'+ global.selected ), bg = node.select('path');
        bg.style('stroke', d3.color( bg.style('fill') ).darker( .5 ) );
        node.node().dispatchEvent( new MouseEvent('dblclick') );
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

    function createRootNode() {
        global.nodes.set('node' + global.counter, {
            name : 'Root node', fixed : false,
            x : parseInt( global.container.style('width') )/2,
            y : parseInt( global.container.style('height') )/2,
            'background-color' : '#e6ede6',
            'text-color' : '#828c82', 'font-size' : 20,
            'font-style' : 'normal', 'font-weight' : 'normal'
        });
    }

    function setCounter() {
        const getIntOfKey = k => parseInt( k.substring(4) ),
        keys = global.nodes.keys().map( getIntOfKey );
        global.counter = Math.max(...keys);
    }

    function mapClone() {
        return global.nodes.entries().map( function( node ) {
            return { key : node.key, value : cloneObject( node.value ) };
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
        deselectNode();
        setCounter();
    }

    /****** Update functions  ******/

    function redraw() {
        d3.selectAll('.node, .branch').remove();
        update();
    }

    function update() {
        const map = global.nodes.entries(),
        nodes = global.svg.mmap.selectAll('.node').data( map ),
        branches = global.svg.mmap.selectAll('.branch').data( map.slice(1) );

        const node = nodes.enter().append('g')
            .style('cursor', 'pointer')
            .attr('class', 'node')
            .attr('id', n => n.key )
            .attr('transform', n => 'translate(' + n.value.x + ',' + n.value.y + ')')
            .call( drag )
            .on('dblclick', function( n ) {
                events.call('nodefocus', this, n.key, n.value );
                d3.event.stopPropagation();
            });

        node.append('text').text( n => n.value.name )
            .style('font-family', 'sans-serif')
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'middle')
            .style('fill', n => n.value['text-color'])
            .style('font-size', n => n.value['font-size'])
            .style('font-style', n => n.value['font-style'])
            .style('font-weight', n => n.value['font-weight']);

        node.insert('path', 'text')
            .style('fill', n => n.value['background-color'])
            .style('stroke-width', 3 )
            .attr('d', drawBackgroundShape );

        branches.enter().insert('path', 'g')
            .style('fill', n => n.value['branch-color'])
            .style('stroke', n => n.value['branch-color'])
            .attr('class', 'branch')
            .attr('id', n => 'branchOf' + n.key )
            .attr('d', drawBranch );

        nodes.exit().remove();
        branches.exit().remove();
    }

    function updateName( sel, v ) {
        if ( sel.name != v ) {
            const text = this.childNodes[1];
            const bg = this.childNodes[0];
            sel.name = text.innerHTML = v;
            sel.width = text.textLength.baseVal.value + 45;
            d3.select( bg ).attr('d', drawBackgroundShape );
            saveSnapshot();
        } else return false;
    }

    function updateBackgroundColor( sel, v ) {
        if ( sel['background-color'] !== v ) {
            const bg = this.childNodes[0];
            bg.style.setProperty('fill', sel['background-color'] = v );
            bg.style.setProperty('stroke', d3.color( v ).darker( .5 ) );
            saveSnapshot();
        } else return false;
    }

    function updateTextColor( sel, v ) {
        if ( sel['text-color'] !== v ) {
            const text = this.childNodes[1];
            text.style.setProperty('fill', sel['text-color'] = v );
            saveSnapshot();
        } else return false;
    }

    function updateFontSize( sel, v ) {
        if ( sel['font-size'] != v ) {
            const text = this.childNodes[1];
            const bg = this.childNodes[0];
            text.style.setProperty('font-size', sel['font-size'] = v );
            sel.width = text.textLength.baseVal.value + 45;
            sel.height = sel['font-size']*11/10 + 30;
            d3.select( bg ).attr('d', drawBackgroundShape );
            d3.selectAll('.branch').attr('d', drawBranch );
            saveSnapshot();
        } else return false;
    }

    function updateFontStyle( sel ) {
        const text = this.childNodes[1];
        sel['font-style'] = sel['font-style'] === 'normal' ? 'italic' : 'normal';
        text.style.setProperty('font-style', sel['font-style'] );
        saveSnapshot();
    }

    function updateFontWeight( sel ) {
        const text = this.childNodes[1];
        sel['font-weight'] = sel['font-weight'] === 'normal' ? 'bold' : 'normal';
        text.style.setProperty('font-weight', sel['font-weight'] );
        saveSnapshot();
    }

    function updateBranchColor( sel, v ) {
        if( global.selected !== 'node0' ) {
            if ( sel['branch-color'] !== v ) {
                const branch = document.getElementById('branchOf'+ global.selected );
                branch.style.setProperty('fill', sel['branch-color'] = v );
                branch.style.setProperty('stroke', sel['branch-color'] = v );
                saveSnapshot();
            } else return false;
        } else return error('The root node has no branches');
    }

    function updateFixStatus( sel ) {
        if ( global.selected !== 'node0' ) sel.fixed = !sel.fixed;
        else return error('The root node can not be fixed');
    }

    /****** Shape functions  ******/

    function drawBranch( node ) {

        const n = node.value;
        const p = global.nodes.get( n.parent );
        const nodeLevel = getNodeLevel( n );
        const width = 22 - ( nodeLevel < 5 ? nodeLevel : 5 ) * 3;
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

    function drawBackgroundShape( node ) {

        const n = node.value;
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

    /****** Shortcuts functions  ******/

    function setShortcuts( keys, cb ) {
        const map = {}, sc = function() {
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

    function moveSelectionOnLevel( dir ) {
        const sel = global.nodes.get( global.selected ),
        lev = getNodeLevel( sel ), or = orientation( sel.x );
        var key, tmp = Number.MAX_VALUE;
        global.nodes.each( function( n, k ) {
            const d = dir ? sel.y - n.y : n.y - sel.y,
            sameLevel = lev === getNodeLevel( n ),
            sameNode = global.selected === k,
            sameOrientation = or === orientation( n.x );
            if ( sameOrientation && sameLevel && !sameNode &&  d > 0 && d < tmp ) {
                tmp = d;
                key = k;
            }
        });
        if ( key !== undefined ) selectNode( key );
    }

    function moveSelectionOnBranch( dir ) {
        const sel = global.nodes.get( global.selected ),
        root = global.nodes.get('node0');
        var key, checks, tmp = Number.MIN_VALUE;
        global.nodes.each( function( n, k ) {
            if ( sel.x < root.x )
                checks = dir ? n.parent === global.selected : sel.parent === k;
            else if ( sel.x > root.x )
                checks = !dir ? n.parent === global.selected : sel.parent === k;
            else checks = ( dir ? n.x < root.x : n.x > root.x ) && n.parent === global.selected;
            if ( checks && n.y > tmp ) {
                tmp = n.y;
                key = k;
            }
        });
        if ( key !== undefined ) selectNode( key );
    }

    function moveSelection( dir ) {
        const d = dir === 'up' || dir === 'left';
        if ( dir === 'up' || dir === 'down' ) moveSelectionOnLevel( d );
        else moveSelectionOnBranch( d );
    }

    function moveNode( dir ) {
        const s = global.nodes.get( global.selected ),
        range = 10, oldOr = orientation( s.x ),
        setCoord = {
            up: n => n.y -= range,
            down: n => n.y += range,
            right: n => n.x += range,
            left: n => n.x -= range
        };
        setCoord[ dir ]( s );
        const newOr = orientation( s.x );
        setNodeCoords( document.getElementById( global.selected ), s.x, s.y );
        if ( s.fixed ) subnodes( global.selected, function( n, k ) {
            setCoord[ dir ]( n );
            if ( newOr !== oldOr ) n.x += ( s.x - n.x )*2;
            setNodeCoords( this, n.x, n.y );
        });
        d3.selectAll('.branch').attr('d', drawBranch );
        saveSnapshot();
    }

    /****** Public functions ******/

    const events = d3.dispatch(
        'mmcreate', 'mmcenter', 'nodefocus',
        'nodeselect', 'nodeupdate',
        'nodecreate', 'noderemove'
    );

    function addNode( prop ) {
        const s = global.nodes.get( global.selected ),
        root = global.nodes.get('node0'),
        key = 'node' + ( ++global.counter ),
        value = {
            name : prop && prop.name || 'Node',
            'background-color' : prop && prop['background-color'] || '#f9f9f9',
            'text-color' : prop && prop['text-color'] || '#808080',
            'branch-color' : prop && prop['branch-color'] || s['branch-color'] || '#9fad9c',
            'font-size' : prop && prop['font-size'] || 16,
            'font-style' : prop && prop['font-style'] || 'normal',
            'font-weight' : prop && prop['font-weight'] || 'normal',
            fixed : prop && prop.fixed || true,
            x : prop && prop.x || findXPosition( s, root ),
            y : prop && prop.y || s.y - d3.randomUniform( 60, 100 )(),
            parent : global.selected
        };
        global.nodes.set( key, value );
        update();
        events.call('nodecreate');
        saveSnapshot();
    }

    function removeNode() {
        const key = global.selected;
        if( key !== 'node0' ) {
            global.nodes.remove( key );
            subnodes( key, function( n, k ) {
                global.nodes.remove( k );
            });
            selectNode('node0');
            redraw();
            saveSnapshot();
            events.call('noderemove', this, key );
        } else return error('The root node can not be deleted');
    }

    function center() {
        const root = global.nodes.get('node0');
        const center = {
            x : parseInt( global.container.style('width') )/2,
            y : parseInt( global.container.style('height') )/2
        }
        const zoomId = d3.zoomIdentity.translate( center.x - root.x, center.y - root.y );
        global.svg.main.transition().duration(500).call( zoom.transform, zoomId );
        events.call('mmcenter');
    }

    function updateNode( k, v ) {
        const sel = global.nodes.get( global.selected ),
        dom = document.getElementById( global.selected ),
        prop = {
            'name' : updateName,
            'fixed' : updateFixStatus,
            'background-color' : updateBackgroundColor,
            'branch-color' : updateBranchColor,
            'text-color' : updateTextColor,
            'font-size' : updateFontSize,
            'font-style' : updateFontStyle,
            'font-weight' : updateFontWeight
        },
        upd = prop[k];
        if ( upd !== undefined ) {
            if ( upd.call( dom, sel, v ) !== false )
                events.call('nodeupdate', dom, global.selected, sel, k );
        }
        else return error('"'+ k +'" is not a valid node property');
    }

    function png( name, background ) {
        const image = new Image();
        image.src = getDataURI();
        image.onload = function() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            const a = document.createElement('a');

            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage( image, 0, 0 );

            context.globalCompositeOperation = 'destination-over';
            context.fillStyle = background || '#ffffff';
            context.fillRect(0, 0, canvas.width, canvas.height);

            a.download = name;
            a.href = canvas.toDataURL('image/png');
            a.click();
        }
    }

    function newMap() {
        global.counter = 0;
        global.nodes.clear();
        createRootNode();
        redraw();
        center();
        saveSnapshot();
        events.call('mmcreate');
        deselectNode();
    }

    function undo() {
        const h = global.history;
        if( h.index > 0 )
            loadSnapshot( h.snapshots[ --h.index ] );
    }

    function repeat() {
        const h = global.history;
        if( h.index < h.snapshots.length - 1 )
            loadSnapshot( h.snapshots[ ++h.index ] );
    }

    function data() {
        return global.history.snapshots[ global.history.index ];
    }

    function load( data ) {
        loadSnapshot( data );
        center();
        saveSnapshot();
    }

    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        init : init,
        center : center,
        undo : undo,
        repeat : repeat,
        new : newMap,
        events : events,
        png : png,
        data : data,
        load : load,
        node : {
            update : updateNode,
            remove : removeNode,
            add : addNode
        }
    };

}(this, window.d3));
