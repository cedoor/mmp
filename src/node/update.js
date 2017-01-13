import * as d3 from 'd3'
import glob from '../global'
import { call as callEvent } from '../events'
import { save as saveSnapshot } from '../map/snapshots'
import  * as draw from '../draw/draw'
import { error, fontStyle, fontWeight } from '../utils'
import { dom } from './index'

/**
 * @name update
 * @param {string} k - The key of property.
 * @param {Object} v - The value of property.
 * @param {boolean} [vis] - Only visual change.
 * @return {boolean} error - False.
 * @desc Update the properties of the selected node.
*/
export default function( k, v, vis ) {
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
            if ( !vis ) saveSnapshot()
            callEvent('nodeupdate', d, glob.selected, s, k )
        }
    else return error('"'+ k +'" is not a valid node property')
}

/**
 * @name updateName
 * @param {Object} sel - The selected node.
 * @param {string} v - New value.
 * @param {boolean} [vis] - Only visual change.
 * @return {boolean} failed
 * @desc Update the node name with a new value.
*/
function updateName( sel, v, vis ) {
    if ( sel.name != v || vis ) {
        this.childNodes[1].innerHTML = v
        d3.select( this.childNodes[0] ).attr('d', draw.background )
        d3.selectAll('.branch').attr('d', draw.branch )
        if ( !vis ) sel.name = v
    } else return false
}

/**
 * @name updateBackgroundColor
 * @param {Object} sel - The selected node.
 * @param {string} v - New value.
 * @param {boolean} [vis] - Only visual change.
 * @return {boolean} failed
 * @desc Update the node background color with a new value.
*/
function updateBackgroundColor( sel, v, vis ) {
    if ( sel['background-color'] !== v || vis ) {
        const bg = this.childNodes[0]
        bg.style['fill'] = v
        if ( bg.style['stroke'] !== '' )
            bg.style['stroke'] = d3.color( v ).darker( .5 )
        if ( !vis ) sel['background-color'] = v
    } else return false
}

/**
 * @name updateTextColor
 * @param {Object} sel - The selected node.
 * @param {string} v - New value.
 * @param {boolean} [vis] - Only visual change.
 * @return {boolean} failed
 * @desc Update the node text color with a new value.
*/
function updateTextColor( sel, v, vis ) {
    if ( sel['text-color'] !== v || vis ) {
        this.childNodes[1].style['fill'] = v
        if ( !vis ) sel['text-color'] = v
    } else return false
}

/**
 * @name updateBranchColor
 * @param {Object} sel - The selected node.
 * @param {string} v - New value.
 * @param {boolean} [vis] - Only visual change.
 * @return {boolean} failed
 * @desc Update the node branch color with a new value.
*/
function updateBranchColor( sel, v, vis ) {
    if( glob.selected !== 'node0' ) {
        if ( sel['branch-color'] !== v || vis ) {
            const branch = document.getElementById('branchOf'+ glob.selected )
            branch.style['fill'] = branch.style['stroke'] = v
            if ( !vis ) sel['branch-color'] = v
        } else return false
    } else return error('The root node has no branches')
}

/**
 * @name updateFontSize
 * @param {Object} sel - The selected node.
 * @param {string} v - New value.
 * @param {boolean} [vis] - Only visual change.
 * @return {boolean} failed
 * @desc Update the node font size with a new value.
*/
function updateFontSize( sel, v, vis ) {
    if ( sel['font-size'] != v || vis ) {
        this.childNodes[1].style['font-size'] = v
        d3.select( this.childNodes[0] ).attr('d', draw.background )
        d3.selectAll('.branch').attr('d', draw.branch )
        if ( !vis ) sel['font-size'] = v
    } else return false
}

/**
 * @name updateItalicFont
 * @param {Object} sel - The selected node.
 * @desc Update the node font style.
*/
function updateItalicFont( sel ) {
    const style = fontStyle( sel.italic = !sel.italic )
    this.childNodes[1].style['font-style'] = style
}

/**
 * @name updateBoldFont
 * @param {Object} sel - The selected node.
 * @desc Update the node font weight.
*/
function updateBoldFont( sel ) {
    const style = fontWeight( sel.bold = !sel.bold )
    this.childNodes[1].style['font-weight'] = style
}

/**
 * @name updateFixStatus
 * @param {Object} sel - The selected node.
 * @desc Update the node fix status.
*/
function updateFixStatus( sel ) {
    if ( glob.selected !== 'node0' ) sel.fixed = !sel.fixed;
    else return error('The root node can not be fixed');
}
