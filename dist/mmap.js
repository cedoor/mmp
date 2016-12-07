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
        global.svg = {};

        global.svg.main = global.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g').call( zoom );

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
        deselectNode();

        window.onresize = center;
        events.call('mmcreate');
    }

    /****** Util functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed );

    const drag = d3.drag().on('drag', dragged ).on('start', function( n ) {
        selectNode( n.key );
    });

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform );
    }

    function dragged( n ) {
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
            p = p.parent;
        }
        return level < 5 ? level : 5;
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

    /****** Update functions  ******/

    function redraw() {
        d3.selectAll('.node, .branch').remove();
        update();
    }

    function update() {

        const nodes = getNodesWithKeys();

        const node = global.svg.mmap.selectAll('.node').data( nodes );

        const nodeContainer = node.enter().append('g')
            .attr('class', 'node')
            .attr('id', n => n.key )
            .attr('transform', n => 'translate(' + n.x + ',' + n.y + ')')
            .call( drag )
            .on('dblclick', function( n ) {
                events.call('nodedblclick', this, n);
                d3.event.stopPropagation();
            });

        nodeContainer.append('text').text( n => n.name )
            .attr('fill', n => n['text-color'])
            .attr('font-size', n => n['font-size'])
            .attr('font-style', n => n['font-style'])
            .attr('font-weight', n => n['font-weight']);

        nodeContainer.insert('path', 'text')
            .style('fill', n => n['background-color'])
            .attr('d', drawBgShape );

        node.exit().remove();

        const branch = global.svg.mmap.selectAll('.branch').data( nodes.slice(1) );

        branch.enter().insert('path', 'g')
            .attr('class', 'branch')
            .attr('id', n => 'branchOf' + n.key )
            .style('fill', n => n['branch-color'])
            .style('stroke', n => n['branch-color'])
            .attr('d', drawBranch );

        branch.exit().remove();
    }

    function updateName( sel, v ) {
        const text = this.childNodes[1];
        const bg = this.childNodes[0];
        sel.name = text.innerHTML = v;
        sel.width = text.textLength.baseVal.value + 45;
        d3.select( bg ).attr('d', drawBgShape );
    }

    function updateBackgroundColor( sel, v ) {
        const bg = this.childNodes[0];
        bg.style.setProperty('fill', sel['background-color'] = v );
        bg.style.setProperty('stroke', d3.color( v ).darker( .5 ) );
    }

    function updateTextColor( sel, v ) {
        const text = this.childNodes[1];
        text.style.setProperty('fill', sel['text-color'] = v );
    }

    function updateFontSize( sel, v ) {
        const text = this.childNodes[1];
        const bg = this.childNodes[0];
        text.style.setProperty('font-size', sel['font-size'] = v );
        sel.width = text.textLength.baseVal.value + 45;
        sel.height = sel['font-size']*11/10 + 30;
        d3.select( bg ).attr('d', drawBgShape );
        d3.selectAll('.branch').attr('d', drawBranch );
    }

    function updateFontStyle( sel ) {
        const text = this.childNodes[1];
        sel['font-style'] = sel['font-style'] === 'normal' ? 'italic' : 'normal';
        text.style.setProperty('font-style', sel['font-style'] );
    }

    function updateFontWeight( sel ) {
        const text = this.childNodes[1];
        sel['font-weight'] = sel['font-weight'] === 'normal' ? 'bold' : 'normal';
        text.style.setProperty('font-weight', sel['font-weight'] );
    }

    function updateBranchColor( sel, v ) {
        if( sel.key !== 'node0' ) {
            const branch = document.getElementById('branchOf'+ sel.key );
            branch.style.setProperty('fill', sel['branch-color'] = v );
            branch.style.setProperty('stroke', sel['branch-color'] = v );
        } else {
            console.warn('The root node has no branches');
        }
    }

    /****** Shape functions  ******/

    function drawBranch( n ) {

        const width = 22 - getNodeLevel( n ) * 3;
        const middleX = ( n.parent.x + n.x ) / 2;
        const orY = n.parent.y < n.y + n.height/2 ? -1 : 1;
        const orX = n.parent.x > n.x ? -1 : 1;
        const inv = orX*orY;

        const path = d3.path();
        path.moveTo( n.parent.x, n.parent.y - width*.8 );
        path.bezierCurveTo(
            middleX - width*inv, n.parent.y - width/2,
            n.parent.x - width/2*inv, n.y + n.height/2 - width/3,
            n.x - n.width/3*orX, n.y + n.height/2 + 3
        );
        path.bezierCurveTo(
            n.parent.x + width/2*inv, n.y + n.height/2 + width/3,
            middleX + width*inv, n.parent.y + width/2,
            n.parent.x, n.parent.y + width*.8
        );
        path.closePath();

        return path;
    }

    function drawBgShape( n ) {

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
                'branch-color' : prop && prop['branch-color'] || '#9fad9c',
                'font-size' : prop && prop['font-size'] || 16,
                'font-style' : prop && prop['font-style'] || 'normal',
                'font-weight' : prop && prop['font-weight'] || 'normal',
                x : sel.x + ( sel.x > root.x ? 200 : -200 ),
                y : sel.y + 50,
                parent : sel
            };

            global.nodes.set( key, value );
            update();
            events.call('nodecreate');
        }
    }

    function removeNode() {
        if( global.selected !== 'node0' ) {
            global.nodes.remove( global.selected );

            const clean = function( key ) {
                global.nodes.each( function( n ) {
                    if ( n.key !== 'node0' && n.parent.key === key ) {
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
        const dom = document.getElementById( sel.key );
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

    function getPNG( name, background ) {
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
        deselectNode();
        center();
    }

    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        // Basic
        init : init,
        center : center,
        newMap : newMap,
        addNode : addNode,
        removeNode : removeNode,

        // Advanced
        updateNode : updateNode,
        events : events,
        getPNG : getPNG
    };

}(this, window.d3));
