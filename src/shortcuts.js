import * as d3 from "d3"
import global from './global'
import { undo, repeat, saveSnapshot } from './snapshots'
import { zoomIn, zoomOut } from './zoom'
import { center, newMap, clear } from './map'
import { addChildNode, removeNode, getNodeLevel, selectNode, setNodeCoords, subnodes } from './node'
import { orientation } from './utils'
import { drawBranch } from './draw'

export function setShortcuts() {
    const map = {}, sc = function() {
        return shortcut( arguments, map );
    };
    window.onkeyup = window.onkeydown = function( e ) {
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
        else if ( sc('alt','c') ) center();
        else if ( sc('alt','n') ) newMap();
        else if ( sc('alt','+') ) addChildNode();
        else if ( sc('alt','-') ) removeNode();
        else if ( sc('esc') ) clear();
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
    if ( s.fixed ) subnodes( global.selected, function( n ) {
        setCoord[ dir ]( n );
        if ( newOr !== oldOr ) n.x += ( s.x - n.x )*2;
        setNodeCoords( this, n.x, n.y );
    });
    d3.selectAll('.branch').attr('d', drawBranch );
    saveSnapshot();
}
