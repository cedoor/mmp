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
