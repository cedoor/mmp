/**
 * @name mmap
 * @version 0.1.3
 * @author Omar Desogus
 * @license MIT
 */
( function ( global, factory ) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory( exports ) :
    typeof define === 'function' && define.amd ? define(['exports'], factory ) :
    ( factory(( global.mmap = global.mmap || {} )) );
}( this, ( function ( exports ) { 'use strict';

    const version = "0.1.3";

    /**
     * @name global
     * @description
     * Global dictionary that will contain all the properties of the
     * map shared by all functions within the module.
     */
    const global = {};

    /**
     * @name init
     * @description
     *
     */
    function init( opt ) {

        // Default options
        global.options = {
            'center-onresize' : false,
            'shortcuts' : true,
            'node' : {
                'name' : 'Node',
                'background-color' : '#f9f9f9',
                'text-color' : '#808080',
                'branch-color' : '#9fad9c',
                'font-size' : 16,
                'italic' : false,
                'bold' : false,
                'fixed' : true
            },
            'root-node' : {
                'name' : 'Root node',
                'background-color' : '#e6ede6',
                'text-color' : '#828c82',
                'font-size' : 20,
                'italic' : false,
                'bold' : false,
                'fixed' : false
            }
        };

        global.container = d3.select('mmap').style('display', 'block');
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

        // If opt is correct update the default options
        if ( opt !== undefined )
            opt.constructor === Object
                ? overwriteProperties( global.options, opt )
                : error('mmap options invalid');

        if ( global.options['center-onresize'] === true ) onresize = center;
        if ( global.options['shortcuts'] === true ) setShortcuts();

        events.call('mmcreate');

        createRootNode();
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
            .style('font-style', n => checkItalicFont( n.value.italic ) )
            .style('font-weight', n => checkBoldFont( n.value.bold ));

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

    function updateName( sel, v, vis ) {
        if ( sel.name != v || vis ) {
            this.childNodes[1].innerHTML = v;
            d3.select( this.childNodes[0] ).attr('d', drawBackgroundShape );
            d3.selectAll('.branch').attr('d', drawBranch );
            if ( !vis ) sel.name = v;
        } else return false;
    }

    function updateBackgroundColor( sel, v, vis ) {
        if ( sel['background-color'] !== v || vis ) {
            const bg = this.childNodes[0];
            bg.style['fill'] = v;
            if ( bg.style['stroke'] !== 'none' )
                bg.style['stroke'] = d3.color( v ).darker( .5 );
            if ( !vis ) sel['background-color'] = v;
        } else return false;
    }

    function updateTextColor( sel, v, vis ) {
        if ( sel['text-color'] !== v || vis ) {
            this.childNodes[1].style['fill'] = v;
            if ( !vis ) sel['text-color'] = v;
        } else return false;
    }

    function updateBranchColor( sel, v, vis ) {
        if( global.selected !== 'node0' ) {
            if ( sel['branch-color'] !== v || vis ) {
                const branch = document.getElementById('branchOf'+ global.selected );
                branch.style['fill'] = branch.style['stroke'] = v;
                if ( !vis ) sel['branch-color'] = v;
            } else return false;
        } else return error('The root node has no branches');
    }

    function updateFontSize( sel, v, vis ) {
        if ( sel['font-size'] != v || vis ) {
            this.childNodes[1].style['font-size'] = v;
            d3.select( this.childNodes[0] ).attr('d', drawBackgroundShape );
            d3.selectAll('.branch').attr('d', drawBranch );
            if ( !vis ) sel['font-size'] = v;
        } else return false;
    }

    function updateItalicFont( sel ) {
        const style = checkItalicFont( sel.italic = !sel.italic );
        this.childNodes[1].style['font-style'] = style;
    }

    function updateBoldFont( sel ) {
        const style = checkBoldFont( sel.bold = !sel.bold );
        this.childNodes[1].style['font-weight'] = style;
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
        const y = ( n.height = this.nextSibling.getBBox().height + 30 )/2;
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

    function setShortcuts() {
        const map = {}, sc = function() {
            return shortcut( arguments, map );
        };
        onkeyup = onkeydown = function( e ) {
            map[e.keyCode] = e.type === 'keydown';
            if ( sc('ctrl','maiusc','z') ) return !!repeat();
            else if ( sc('ctrl','z') ) return !!undo();
            else if ( sc('alt','maiusc','up') ) moveNode('up');
            else if ( sc('alt','maiusc','down') ) moveNode('down');
            else if ( sc('alt','maiusc','left') ) moveNode('left');
            else if ( sc('alt','maiusc','right') ) moveNode('right');
            else if ( sc('alt','maiusc','+') ) zoomIn();
            else if ( sc('alt','maiusc','-') ) zoomOut();
            else if ( sc('alt','up') ) return !!moveSelection('up');
            else if ( sc('alt','down') ) return !!moveSelection('down');
            else if ( sc('alt','right') ) return !!moveSelection('right');
            else if ( sc('alt','left') ) return !!moveSelection('left');
            else if ( sc('alt','i') ) png('mmap');
            else if ( sc('alt','c') ) center();
            else if ( sc('alt','n') ) newMap();
            else if ( sc('alt','+') ) addChildNode();
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

    function addChildNode( prop ) {
        const s = global.nodes.get( global.selected ),
        root = global.nodes.get('node0'),
        key = 'node' + ( ++global.counter ),
        value = Object.assign( global.options['node'], {
            'x' : prop && prop.x || findXPosition( s, root ),
            'y' : prop && prop.y || s.y - d3.randomUniform( 60, 100 )(),
            'parent' : global.selected
        });
        addNode( key, value );
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

    function selectedNode() {
        return {
            key : global.selected,
            value : cloneObject( global.nodes.get( global.selected ) )
        }
    }

    function updateNode( k, v, vis ) {
        const sel = global.nodes.get( global.selected ),
        dom = document.getElementById( global.selected ),
        prop = {
            'name' : updateName,
            'fixed' : updateFixStatus,
            'background-color' : updateBackgroundColor,
            'branch-color' : updateBranchColor,
            'text-color' : updateTextColor,
            'font-size' : updateFontSize,
            'italic' : updateItalicFont,
            'bold' : updateBoldFont
        },
        upd = prop[k];
        if ( upd !== undefined ) {
            if ( upd.call( dom, sel, v, vis ) !== false ) {
                if ( !vis ) saveSnapshot();
                events.call('nodeupdate', dom, global.selected, sel, k );
            }
        }
        else return error('"'+ k +'" is not a valid node property');
    }

    /**
     * @name image
     * @param {function} cb callback
     * @param {string} type type of image, default png
     * @param {string} background color of map background
     * @description
     * Get a DOMString containing the data URI of map image and
     * pass it to callback function.
    */
    function image( cb, type, background ) {
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

            cb( canvas.toDataURL( type ) );
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
    }

    function center() {
        const root = global.nodes.get('node0'), center = {
            x : parseInt( global.container.style('width') )/2,
            y : parseInt( global.container.style('height') )/2
        },
        zoomId = d3.zoomIdentity.translate( center.x - root.x, center.y - root.y );
        global.svg.main.transition().duration(500).call( zoom.transform, zoomId );
        events.call('mmcenter');
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

    function on( e, cb ) {
        events.on( e, cb );
    }

    function zoomIn() {
        setZoom( true );
    }

    function zoomOut() {
        setZoom( false );
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
    exports.version = version;
    exports.init = init;
    exports.center = center;
    exports.undo = undo;
    exports.repeat = repeat;
    exports.zoomIn = zoomIn;
    exports.zoomOut = zoomOut;
    exports.new = newMap;
    exports.on = on;
    exports.image = image;
    exports.data = data;
    exports.load = load;
    exports.node = {
        update : updateNode,
        remove : removeNode,
        add : addChildNode,
        selected : selectedNode
    };

    Object.defineProperty( exports, '__esModule', { value: true } );

})));
