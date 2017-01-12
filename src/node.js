import * as d3 from 'd3'
import glob from './global'
import * as draw from './draw'
import { call as callEvent } from './dispatch'
import * as snapshots from './snapshots'
import * as map from './map'
import { error, cloneObject, fontStyle, fontWeight } from './utils'

/**
 * @name addChild
 * @return {Object} prop - The properties of node.
 * @desc Add a child node to selected node.
*/
export function addChild( prop ) {
    let parent = glob.nodes.get( glob.selected ),
        key = 'node' + ( ++glob.counter ),
        opt = glob.options.node,
        value = Object.assign( {}, {
            'name': prop && prop['name'] || opt['name'],
            'background-color': prop && prop['background-color'] || opt['background-color'],
            'text-color': prop && prop['text-color'] || opt['text-color'],
            'branch-color': prop && prop['branch-color'] || parent['branch-color'] || opt['branch-color'],
            'font-size': prop && prop['font-size'] || opt['font-size'],
            'italic': prop && prop['italic'] || opt['italic'],
            'bold': prop && prop['bold'] || opt['bold'],
            'fixed': prop && prop['fixed'] || opt['fixed'],
            'x': prop && prop.x || calcX( parent.x ),
            'y': prop && prop.y || parent.y - d3.randomUniform( 60, 100 )(),
            'parent': glob.selected
        })
    add( key, value )
}

/**
 * @name remove
 * @return {boolean} error - False.
 * @desc Remove the selected node.
*/
export function remove() {
    const key = glob.selected
    if( key !== 'node0' ) {
        glob.nodes.remove( key )
        subnodes( key, ( n, k ) => {
            glob.nodes.remove( k )
        })
        select('node0')
        map.redraw()
        snapshots.save()
        callEvent('noderemove', this, key )
    } else return error('The root node can not be deleted')
}

/**
 * @name select
 * @param {string} [key] - The key of node to select.
 * @return {Object} [node] - The selected node.
 * @desc Select a node or return the selected node.
*/
export function select( key ) {
    const s = glob.selected
    if ( typeof key === 'string' )
        if ( glob.nodes.has( key ) ) {
            const node = dom( key ), bg = node.childNodes[0]
            if ( bg.style['stroke'].length === 0 ) {
                if ( s ) stroke( s, '')
                const color = d3.color( bg.style['fill'] ).darker( .5 )
                bg.style['stroke'] = color
                if ( s !== key ) {
                    glob.selected = key
                    callEvent('nodeselect', node, key, glob.nodes.get( key ) )
                }
            }
        } else error('The node with the key '+ key +' don\'t exist')
    else return {
        key : s, value : cloneObject( glob.nodes.get( s ) )
    }
}

/**
 * @name update
 * @param {string} k - The key of property.
 * @param {Object} v - The value of property.
 * @param {boolean} [vis] - Only visual change.
 * @return {boolean} error - False.
 * @desc Update the properties of the selected node.
*/
export function update( k, v, vis ) {
    let s = glob.nodes.get( glob.selected ),
        d = dom( glob.selected ),
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
        upd = prop[k]
    if ( upd !== undefined )
        if ( upd.call( d, s, v, vis ) !== false ) {
            if ( !vis ) snapshots.save()
            callEvent('nodeupdate', d, glob.selected, s, k )
        }
    else return error('"'+ k +'" is not a valid node property')
}

/**
 * @name addRoot
 * @desc Add the root node in the mind map.
*/
export function addRoot() {
    let value = Object.assign({
        x : parseInt( glob.container.style('width') )/2,
        y : parseInt( glob.container.style('height') )/2
    }, glob.options['root-node'])
    add('node' + glob.counter, value )
    map.clear()
}

/**
 * @name moveTo
 * @param {Object} dom
 * @param {number} x
 * @param {number} y
 * @desc Move graphically a node.
*/
export function moveTo( dom, x, y ) {
    dom.setAttribute('transform','translate('+[ x, y ]+')');
}

/**
 * @name level
 * @param {Object} n - The node.
 * @return {number} level - The level of node.
 * @desc Find the level of a node.
*/
export function level( n ) {
    let p = n.parent, level = 0
    while ( p ) {
        level++
        p = glob.nodes.get( p ).parent
    }
    return level
}

/**
 * @name stroke
 * @param {Object} n - The node.
 * @param {string} [v] - The value of stroke color.
 * @return {string} value - The value of stroke color.
 * @desc Set color of node stroke if v is defined and return its value.
*/
export function stroke( n, v ) {
    let bg = dom( n ).childNodes[0]
    return v ? bg.style['stroke'] = v : bg.style['stroke']
}

/**
 * @name subnodes
 * @param {string} key - The key of the parent node.
 * @param {requestCallback} cb - A callback.
 * @desc Iterate all subnodes of a node and exec a callback for each subnode.
*/
export function subnodes( key, cb ) {
    glob.nodes.each( function( n, k ) {
        if ( n.parent === key ) {
            cb.call( document.getElementById( k ), n, k )
            subnodes( k, cb )
        }
    })
}

/**
 * @name orientation
 * @param {number} x - The key of the parent node.
 * @return {boolean} orientation
 * @desc Return the orientation of a node in the mind map ( true: on left )
*/
export function orientation( x ) {
    let root = glob.nodes.get('node0')
    return x < root.x ? true : x > root.x ? false : undefined
}

/**
 * @name dom
 * @param {string} k - The key of node.
 * @return {Object} dom
 * @desc Return the dom node of a mind map node.
*/
export let dom = k => document.getElementById( k )

/**
 * @name add
 * @param {string} k - The key of node.
 * @param {Object} v - The value of node.
 * @desc Add a node in the mind map.
*/
function add( k, v ) {
    glob.nodes.set( k, v )
    map.update()
    callEvent('nodecreate', dom( k ), k, v )
    snapshots.save()
}

/**
 * @name calcX
 * @param {number} x - x coordinate of parent node.
 * @return {number} x - x coordinate of child node.
 * @desc Return the x coordinate of a node based on parent x coordinate.
*/
function calcX( x ) {
    let dir, or = orientation( x )
    if ( or === true ) dir = -1
    else if ( or === false ) dir = 1
    else {
        let f = n => n.parent === 'node0',
        l = glob.nodes.values().filter( f ).length
        dir = l % 2 === 0 ? -1 : 1
    }
    return x + 200 * dir
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
        const bg = this.childNodes[0]
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
    if( glob.selected !== 'node0' ) {
        if ( sel['branch-color'] !== v || vis ) {
            const branch = document.getElementById('branchOf'+ glob.selected );
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
    const style = fontStyle( sel.italic = !sel.italic );
    this.childNodes[1].style['font-style'] = style;
}

function updateBoldFont( sel ) {
    const style = fontWeight( sel.bold = !sel.bold );
    this.childNodes[1].style['font-weight'] = style;
}

function updateFixStatus( sel ) {
    if ( glob.selected !== 'node0' ) sel.fixed = !sel.fixed;
    else return error('The root node can not be fixed');
}
