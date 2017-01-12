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
 * @param {boolean} b
 * @desc Translate a boolean value in a font style value (italic/normal).
*/
export let fontStyle = b => b ? 'italic' : 'normal'

/**
 * @name fontWeight
 * @param {boolean} b
 * @desc Translate a boolean value in a font weight value (bold/normal).
*/
export let fontWeight = b => b ? 'bold' : 'normal'

/**
 * @name overwriteObject
 * @param {Object} target
 * @param {Object} source
 * @desc Overwrite in depth an object with another Object.
*/
export function overwriteObject( target, source ) {
    for ( let prop in target ) {
        let t = target[ prop ], s = source[ prop ]
        if ( s && s.constructor === t.constructor ) {
            if ( s.constructor === Object ) overwriteObject( t, s )
            else target[ prop ] = s
        }
    }
}
