/**
 * @name mmap
 * @version 0.1.2
 * @author Omar Desogus
 * @license MIT
 */
( function ( global, factory ) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory( exports ) :
    typeof define === 'function' && define.amd ? define(['exports'], factory ) :
    ( factory(( global.mmap = global.mmap || {} )) );
}( this, ( function ( exports ) { 'use strict';

    const version = "0.1.2";
