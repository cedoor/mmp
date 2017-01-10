import * as d3 from 'd3'
import global from './global'
import { redraw, update, clear } from './map'
import * as snapshots from './snapshots'
import { call } from './dispatch'
import { error, $, cloneObject, checkBoldFont, checkItalicFont } from './utils'
import * as draw from './draw'

export function addChildNode( prop ) {
    const s = global.nodes.get( global.selected ),
    root = global.nodes.get('node0'),
    key = 'node' + ( ++global.counter ),
    value = Object.assign( {}, global.options['node'], {
        'x' : prop && prop.x || findXPosition( s, root ),
        'y' : prop && prop.y || s.y - d3.randomUniform( 60, 100 )(),
        'parent' : global.selected
    });
    addNode( key, value );
}

export function removeNode() {
    const key = global.selected;
    if( key !== 'node0' ) {
        global.nodes.remove( key );
        subnodes( key, function( n, k ) {
            global.nodes.remove( k );
        });
        select('node0');
        redraw();
        snapshots.save();
        call('noderemove', this, key );
    } else return error('The root node can not be deleted');
}


export function select( key ) {
    const sel = global.selected;
    if ( typeof key === 'string' )
        if ( global.nodes.has( key ) ) {
            const node = $( key ), bg = node.childNodes[0];
            if ( bg.style['stroke'].length === 0 ) {
                if ( sel ) nodeStroke( sel, '');
                const color = d3.color( bg.style['fill'] ).darker( .5 );
                bg.style['stroke'] = color;
                if ( sel !== key ) {
                    global.selected = key;
                    call('nodeselect', node, key, global.nodes.get( key ) );
                }
            }
        } else error('The node with the key '+ key +' don\'t exist');
    else return {
        key : sel, value : cloneObject( global.nodes.get( sel ) )
    }
}

export function updateNode( k, v, vis ) {
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
            if ( !vis ) snapshots.save();
            call('nodeupdate', dom, global.selected, sel, k );
        }
    }
    else return error('"'+ k +'" is not a valid node property');
}

export function createRootNode() {
    const value = Object.assign( {}, global.options['root-node'], {
        'x' : parseInt( global.container.style('width') )/2,
        'y' : parseInt( global.container.style('height') )/2
    });
    addNode('node' + global.counter, value );
    clear();
}

export function moveTo( dom, x, y ) {
    dom.setAttribute('transform','translate('+[ x, y ]+')');
}

export function level( n ) {
    var p = n.parent, level = 0;
    while ( p ) {
        level++;
        const n = global.nodes.get( p );
        p = n.parent;
    }
    return level;
}

export function nodeStroke( node, value ) {
    const bg = $( node ).childNodes[0];
    if ( value !== 'string' ) return bg.style['stroke'] = value;
    else return bg.style['stroke'];
}

function addNode( key, value ) {
    global.nodes.set( key, value );
    update();
    call('nodecreate', $( key ), key, value );
    snapshots.save();
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

export function subnodes( key, cb ) {
    global.nodes.each( function( n, k ) {
        if ( n.parent === key ) {
            cb.call( document.getElementById( k ), n, k );
            subnodes( k, cb );
        }
    });
}

function updateName( sel, v, vis ) {
    if ( sel.name != v || vis ) {
        this.childNodes[1].innerHTML = v;
        d3.select( this.childNodes[0] ).attr('d', draw.background );
        d3.selectAll('.branch').attr('d', draw.branch );
        if ( !vis ) sel.name = v;
    } else return false;
}

function updateBackgroundColor( sel, v, vis ) {
    if ( sel['background-color'] !== v || vis ) {
        const bg = this.childNodes[0];
        bg.style['fill'] = v;
        if ( bg.style['stroke'] !== '' )
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
        d3.select( this.childNodes[0] ).attr('d', draw.background );
        d3.selectAll('.branch').attr('d', draw.branch );
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
