/**
 * @name mmap
 * @version 0.0.1
 * @author Omar Desogus
 * @license GNU GENERAL PUBLIC LICENSE
 *
 */
(function( window, d3 ) {

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
        deselectNode();

        setShortcuts();
        window.onresize = center;
        events.call('mmcreate');
    }

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
        const x = n.value.x += d3.event.dx;
        const y = n.value.y += d3.event.dy;
        d3.select(this).attr('transform','translate('+[ x, y ]+')');
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

    /****** Update functions  ******/

    function redraw() {
        d3.selectAll('.node, .branch').remove();
        update();
    }

    function update() {

        const nodes = global.nodes.entries();

        const node = global.svg.mmap.selectAll('.node').data( nodes );

        const nodeContainer = node.enter().append('g')
            .style('cursor', 'pointer')
            .attr('class', 'node')
            .attr('id', n => n.key )
            .attr('transform', n => 'translate(' + n.value.x + ',' + n.value.y + ')')
            .call( drag )
            .on('dblclick', function( n ) {
                events.call('nodedblclick', this, n);
                d3.event.stopPropagation();
            });

        nodeContainer.append('text').text( n => n.value.name )
            .style('font-family', 'sans-serif')
            .style('text-anchor', 'middle')
            .style('alignment-baseline', 'middle')
            .style('fill', n => n.value['text-color'])
            .style('font-size', n => n.value['font-size'])
            .style('font-style', n => n.value['font-style'])
            .style('font-weight', n => n.value['font-weight']);

        nodeContainer.insert('path', 'text')
            .style('fill', n => n.value['background-color'])
            .style('stroke-width', 3 )
            .attr('d', drawBgShape );

        node.exit().remove();

        const branch = global.svg.mmap.selectAll('.branch').data( nodes.slice(1) );

        branch.enter().insert('path', 'g')
            .style('fill', n => n.value['branch-color'])
            .style('stroke', n => n.value['branch-color'])
            .attr('class', 'branch')
            .attr('id', n => 'branchOf' + n.key )
            .attr('d', drawBranch );

        branch.exit().remove();
    }

    function updateName( sel, v ) {
        if ( sel.name != v ) {
            const text = this.childNodes[1];
            const bg = this.childNodes[0];
            sel.name = text.innerHTML = v;
            sel.width = text.textLength.baseVal.value + 45;
            d3.select( bg ).attr('d', drawBgShape );
            saveSnapshot();
        }
    }

    function updateBackgroundColor( sel, v ) {
        if ( sel['background-color'] !== v ) {
            const bg = this.childNodes[0];
            bg.style.setProperty('fill', sel['background-color'] = v );
            bg.style.setProperty('stroke', d3.color( v ).darker( .5 ) );
            saveSnapshot();
        }
    }

    function updateTextColor( sel, v ) {
        if ( sel['text-color'] !== v ) {
            const text = this.childNodes[1];
            text.style.setProperty('fill', sel['text-color'] = v );
            saveSnapshot();
        }
    }

    function updateFontSize( sel, v ) {
        if ( sel['font-size'] != v ) {
            const text = this.childNodes[1];
            const bg = this.childNodes[0];
            text.style.setProperty('font-size', sel['font-size'] = v );
            sel.width = text.textLength.baseVal.value + 45;
            sel.height = sel['font-size']*11/10 + 30;
            d3.select( bg ).attr('d', drawBgShape );
            d3.selectAll('.branch').attr('d', drawBranch );
            saveSnapshot();
        }
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
            }
        } else console.warn('The root node has no branches');
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

    function drawBgShape( node ) {

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
        var map = {}, sc = function() {
            return shortcut( arguments, map );
        };
        onkeyup = onkeydown = function( e ) {
            map[e.keyCode] = e.type === 'keydown';
            if ( sc('ctrl','maiusc','z') ) {
                repeat();
                return false;
            }
            else if ( sc('ctrl','z') ) {
                undo();
                return false;
            }
            else if ( sc('ctrl','up') ) moveNode('up');
            else if ( sc('ctrl','down') ) moveNode('down');
            else if ( sc('ctrl','left') ) moveNode('left');
            else if ( sc('ctrl','right') ) moveNode('right');
            else if ( sc('up') ) moveSelection('up');
            else if ( sc('down') ) moveSelection('down');
            else if ( sc('right') ) moveSelection('right');
            else if ( sc('left') ) moveSelection('left');
            else if ( sc('i') ) getPNG('mmap');
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
            'ctrl' : 17, 'alt' : 18, 'maiusc' : 16, 'esc' : 27, 'enter' : 13,
            'c' : 67, 'n' : 78, '+' : 187, '-' : 189, 'i' : 73, 'z' : 90
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

    /****** Public functions ******/

    const events = d3.dispatch(
        'mmcreate', 'mmcenter',
        'nodeselect', 'nodecreate', 'noderemove', 'nodedblclick'
    );

    function addNode( prop ) {
        if( global.selected ) {
            const sel = global.nodes.get( global.selected );
            const root = global.nodes.get('node0');
            const key = 'node' + ( ++global.counter );
            const value = {
                name : prop && prop.name || 'Node',
                'background-color' : prop && prop['background-color'] || '#f1f1f1',
                'text-color' : prop && prop['text-color'] || '#808080',
                'branch-color' : prop && prop['branch-color'] || sel['branch-color'] || '#9fad9c',
                'font-size' : prop && prop['font-size'] || 16,
                'font-style' : prop && prop['font-style'] || 'normal',
                'font-weight' : prop && prop['font-weight'] || 'normal',
                x : sel.x + ( sel.x > root.x ? 200 : -200 ),
                y : sel.y + 50,
                parent : global.selected
            };
            global.nodes.set( key, value );
            update();
            events.call('nodecreate');
            saveSnapshot();
        }
    }

    function removeNode() {
        if( global.selected !== 'node0' ) {
            global.nodes.remove( global.selected );

            const clean = function( key ) {
                global.nodes.each( function( n ) {
                    if ( n.key !== 'node0' && n.parent === key ) {
                        global.nodes.remove( n.key );
                        clean( n.key );
                        return;
                    }
                });
            }
            clean( global.selected );

            selectNode('node0');
            redraw();
            events.call('noderemove');
            saveSnapshot();
        } else {
            console.warn('The root node can not be deleted');
        }
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
        const sel = global.nodes.get( global.selected );
        const dom = document.getElementById( global.selected );
        const prop = {
            'name' : updateName,
            'background-color' : updateBackgroundColor,
            'branch-color' : updateBranchColor,
            'text-color' : updateTextColor,
            'font-size' : updateFontSize,
            'font-style' : updateFontStyle,
            'font-weight' : updateFontWeight,
            default : function() {
                console.error('"'+ k +'" is not a valid node property');
            }
        };
        ( prop[k] || prop.default ).call( dom, sel, v );
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
        saveSnapshot();
        deselectNode();
        center();
    }

    function undo() {
        const h = global.history;
        if( h.index > 0 ) {
            h.index--;
            loadSnapshot( h.snapshots[h.index] );
        }
    }

    function repeat() {
        const h = global.history;
        if( h.index < h.snapshots.length - 1 ) {
            h.index++;
            loadSnapshot( h.snapshots[h.index] );
        }
    }

    function data() {
        return global.history.snapshots[ global.history.index ];
    }

    function load( data ) {
        loadSnapshot( data );
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
        addNode : addNode,
        removeNode : removeNode,
        updateNode : updateNode
    };

}(this, window.d3));
