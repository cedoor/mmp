/**
 * @name error
 * @param {string} message - Error message.
 * @desc Show an error message in the console.
*/
export function error( message ) {
    return !!console.error( message )
}

/**
 * @name cloneObject
 * @param {Object} obj - The object to be cloned.
 * @desc Clone an object.
*/
export function cloneObject( obj ) {
    return Object.assign( {}, obj )
}

/**
 * @name fontStyle
 * @param {boolean} b - .
 * @desc Clone an object.
*/
export let fontStyle = b => b ? 'italic' : 'normal'

/**
 * @name fontWeight
 * @param {boolean} b - .
 * @desc Clone an object.
*/
export let fontWeight = b => b ? 'bold' : 'normal'

/**
 * @name fontWeight
 * @param {boolean} b - .
 * @desc Clone an object.
*/
export function overwriteProperties( target, source ) {
    for ( let prop in target ) {
        var t = target[ prop ], s = source[ prop ];
        if ( s && s.constructor === t.constructor ) {
            if ( s.constructor === Object ) overwriteProperties( t, s )
            else target[ prop ] = s;
        }
    }
}

/**
 * @name fontWeight
 * @param {boolean} b - .
 * @desc Clone an object.
*/
export function $( s ) {
    const k = s.substring( 0, 1 ), n = s.substring( 1 );
    return k === '.' ? document.getElementsByClassName( n )
        : k === '#' ? document.getElementById( n )
        : s.includes('node') ? document.getElementById( s )
        : document.getElementsByTagName( s );
}
