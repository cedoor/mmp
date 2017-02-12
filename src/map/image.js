import glob from '../global'
import { deselect } from '../node/index'

/**
 * @name image
 * @param {requestCallback} cb - The callback.
 * @param {string} [type] - Type of image, default png, others : jpeg, gif..
 * @param {string} [bg] - Color of mind map background.
 * @desc Set image settings and pass its data URL in a callback function.
*/
export function image( cb, type, bg ) {
    deselect()
    dataURI( uri => {
        let image = new Image()
        image.src = uri
        image.onload = function() {
            let canvas = document.createElement('canvas'),
                context = canvas.getContext('2d')

            canvas.width = image.width
            canvas.height = image.height
            context.drawImage( image, 0, 0 )

            context.globalCompositeOperation = 'destination-over'
            context.fillStyle = bg || '#ffffff'
            context.fillRect( 0, 0, canvas.width, canvas.height )

            if ( typeof type === 'string' ) type = 'image/' + type
            cb( canvas.toDataURL( type ) )
        }
    })
}

/**
 * @name dataURI
 * @param {requestCallback} cb - A callback with uri as parameter
 * @desc Translate the mind map svg in data URI.
*/
function dataURI( cb ) {
    let element = glob.svg.mmap.node(),
        clone = element.cloneNode( true ),
        svg = document.createElementNS('http://www.w3.org/2000/svg','svg'),
        box = element.getBBox(),
        css = cssRules( element )
    const
        xmlns = "http://www.w3.org/2000/xmlns/", padding = 15,
        x = box.x - padding, y = box.y - padding,
        w = box.width + padding*2, h = box.height + padding*2

    svg.setAttributeNS( xmlns, "xmlns", "http://www.w3.org/2000/svg")
    svg.setAttributeNS( xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink")
    svg.setAttribute("version", "1.1")
    svg.setAttribute("width", w )
    svg.setAttribute("height", h )
    svg.setAttribute("viewBox", [ x, y, w, h ].join(" ") )

    // If there is css, insert it
    if ( css !== '' ) {
        let style = document.createElement('style'),
            defs = document.createElement('defs')

        style.setAttribute('type', 'text/css')
        style.innerHTML = "<![CDATA[\n" + css + "\n]]>"
        defs.appendChild( style )
        svg.appendChild( defs )
    }

    clone.setAttribute('transform', 'translate(0,0)')
    svg.appendChild( clone )

    checkImages( clone, function() {
        let uri = window.btoa( reEncode( svg.outerHTML ) )
        cb( 'data:image/svg+xml;base64,' + uri )
    })
}

/**
 * @name cssRules
 * @param {Object} element - A dom element.
 * @return {string} css - Css rules.
 * @desc Return the css rules of an element.
*/
function cssRules( element ) {
    let css = "", sheets = document.styleSheets
    for ( let i = 0; i < sheets.length; i++ ) {
        let rules = sheets[i].cssRules
        for ( let j = 0; j < rules.length; j++ ) {
            let rule = rules[j], fontFace = rule.cssText.match(/^@font-face/)
            if ( element.querySelector( rule.selectorText ) || fontFace )
                css += rule.cssText
        }
    }
    return css
}

/**
 * @name reEncode
 * @param {string} data - Original data.
 * @return {string} data - Data encoded.
 * @desc Encode data.
*/
function reEncode( data ) {
    data = encodeURIComponent( data )
    data = data.replace( /%([0-9A-F]{2})/g, ( match, p1 ) => {
        const c = String.fromCharCode('0x'+p1)
        return c === '%' ? '%25' : c
    })
    return decodeURIComponent( data )
}

/**
 * @name checkImages
 * @param {Object} element - The DOM element to check.
 * @return {requestCallback} cb - A callback to execute after check.
 * @desc If there are images in the map convert their href in dataURL.
*/
function checkImages( element, cb ) {
    let images = element.querySelectorAll('image'),
        l = images.length, counter = l

    if ( l > 0 ) for ( let image of images ) {

        let canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            img = new Image(),
            href = image.getAttribute('href')

        img.crossOrigin = "Anonymous"
        img.src = href
        img.onload = function() {
            canvas.width = this.width
            canvas.height = this.height
            ctx.drawImage( this, 0, 0 )
            image.setAttribute("href", canvas.toDataURL('image/png') )
            counter--
            if ( counter === 0 ) cb()
        }
        img.onerror = function() {
            counter--
            if ( counter === 0 ) cb()
        }

    } else cb()
}
