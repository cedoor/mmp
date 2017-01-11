import glob from './global'

/**
 * @name image
 * @param {requestCallback} cb - The callback.
 * @param {string} [type] - Type of image, default png, others : jpeg, gif..
 * @param {string} [bg] - Color of mind map background.
 * @desc Set image settings and pass the its data URL in a callback function.
*/
export default function ( cb, type, bg ) {
    let image = new Image()
    image.src = dataURI()
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
}

/**
 * @name dataURI
 * @return {Object} dataURI -
 * @desc Translate the mind map svg in data URI.
*/
function dataURI() {
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

    let uri = window.btoa( reEncode( svg.outerHTML ) )
    return 'data:image/svg+xml;base64,' + uri
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
