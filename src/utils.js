export default class Utils {
    
    /**
     * @name error
     * @param {string} message - Error message.
     * @desc Throw an Error with a message.
    */
    static error( message ) {
        throw new Error( message )
    }

    /**
     * @name cloneObject
     * @param {Object} obj - The object to be cloned.
     * @param {boolean} deep
     * @return {Object} obj - The copy of the object.
     * @desc Clone an object, in depth if specified.
    */
    static cloneObject( obj, deep ) {
        return deep ? JSON.parse( JSON.stringify( obj ) )
            : Object.assign( {}, obj )
    }

    /**
     * @name clearObject
     * @param {Object} obj - The object to be clear.
     * @desc Clear an object.
    */
    static clearObject( obj ) {
        for ( let p in obj ) delete obj[p]
    }

    /**
     * @name fromObjectToArray
     * @param {Object} obj - The object to be converted.
     * @desc Convert an Object to an array.
    */
    static fromObjectToArray( obj ) {
        let array = []
        for ( let p in obj ) array.push([ p, obj[ p ] ])
        return array
    }

    /**
     * @name fontStyle
     * @param {boolean} b
     * @desc Translate a boolean value in a font style value (italic/normal).
    */
    static fontStyle(b) { 
        return b ? 'italic' : 'normal'
    }

    /**
     * @name fontWeight
     * @param {boolean} b
     * @desc Translate a boolean value in a font weight value (bold/normal).
    */
    static fontWeight(b) { 
        return b ? 'bold' : 'normal'
    }

    /**
     * @name overwriteObject
     * @param {Object} target
     * @param {Object} source
     * @desc Overwrite in depth an object with another Object.
    */
    static overwriteObject( target, source ) {
        for ( let prop in target ) {
            let t = target[ prop ], s = source[ prop ]
            if ( s !== undefined && s.constructor === t.constructor ) {
                if ( s.constructor === Object && !Array.isArray( s ) )
                    this.overwriteObject( t, s )
                else target[ prop ] = s
            }
        }
    }

}
