import global from './global'

export function clearObject( obj ) {
    for ( var member in obj ) delete obj[member];
}

export function error( message ) {
    console.error( message );
    return false;
}

export function cloneObject( obj ) {
    return Object.assign( {}, obj );
}

export function orientation( x ) {
    return x < global.nodes.get('node0').x;
}

export function checkItalicFont( italic ) {
    return italic ? 'italic' : 'normal';
}

export function checkBoldFont( bold ) {
    return bold ? 'bold' : 'normal';
}

export function overwriteProperties( target, source ) {
    for ( let prop in target ) {
        var t = target[ prop ], s = source[ prop ];
        if ( s && s.constructor === t.constructor ) {
            if ( s.constructor === Object ) overwriteProperties( t, s )
            else target[ prop ] = s;
        }
    }
}

export function getDataURI() {
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

export function $( s ) {
    const k = s.substring( 0, 1 ), n = s.substring( 1 );
    return k === '.' ? document.getElementsByClassName( n )
        : k === '#' ? document.getElementById( n )
        : s.includes('node') ? document.getElementById( s )
        : document.getElementsByTagName( s );
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


    function reEncode( data ) {
        data = encodeURIComponent( data );
        data = data.replace( /%([0-9A-F]{2})/g, function( match, p1 ) {
            const c = String.fromCharCode('0x'+p1);
            return c === '%' ? '%25' : c;
        });
        return decodeURIComponent( data );
    }
