/**
 * @name error
 * @param {string} message - Error message.
 * @desc Throw an Error with a message.
*/
export function error( message ) {
    throw new Error( message )
}

/**
 * @name cloneObject
 * @param {Object} obj - The object to be cloned.
 * @param {boolean} deep
 * @return {Object} obj - The copy of the object.
 * @desc Clone an object, in depth if specified.
*/
export function cloneObject( obj, deep ) {
    return deep ? JSON.parse( JSON.stringify( obj ) )
        : Object.assign( {}, obj )
}

/**
 * @name clearObject
 * @param {Object} obj - The object to be clear.
 * @desc Clear an object.
*/
export function clearObject( obj ) {
    for ( let p in obj ) delete obj[p]
}

/**
 * @name fromObjectToArray
 * @param {Object} obj - The object to be converted.
 * @desc Convert an Object to an array.
*/
export function fromObjectToArray( obj ) {
    let array = []
    for ( let p in obj ) array.push([ p, obj[ p ] ])
    return array
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
        if ( s !== undefined && s.constructor === t.constructor ) {
            if ( s.constructor === Object && !Array.isArray( s ) )
                overwriteObject( t, s )
            else target[ prop ] = s
        }
    }
}
