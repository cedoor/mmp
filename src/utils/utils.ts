/**
 * A list of general useful functions.
 */
import {type} from "os";

export default class Utils {

    /**
     * Clone an object, in depth if specified.
     * @param {Object} object
     * @param {boolean} deep
     * @returns {Object}
     */
    static cloneObject(object: Object, deep?: boolean): Object {
        return deep
            ? JSON.parse(JSON.stringify(object))
            : (<any>Object).assign({}, object);
    }

    /**
     * Clear an object.
     * @param {Object} object
     */
    static clearObject(object: Object) {
        for (let property in object) {
            delete object[property];
        }
    }

    /**
     * Convert an Object to an array.
     * @param {Object} object
     * @returns {Array}
     */
    static fromObjectToArray(object: Object): Array<any> {
        let array = [];

        for (let p in object) {
            array.push(object[p]);
        }

        return array;
    }

    /**
     * Merge two objects.
     * @param {any} object1
     * @param {any} object2
     * @returns {any}
     */
    static mergeObjects(object1: any, object2: any): any {
        let result = (<any>Object).assign({}, object1);

        for (let property in object2) {
            let value = object2[property];

            if ((typeof value !== "object" && !Array.isArray(value)) ||
                (typeof result[property] !== "object" && !Array.isArray(result[property])) ||
                !result[property]) {
                result[property] = value;
            } else {
                result[property] = Utils.mergeObjects(result[property], value)
            }
        }

        return result;
    }

    /**
     * Remove all ranges of window.
     */
    static removeAllRanges() {
        window.getSelection().removeAllRanges();
    }

    /**
     * Translate a boolean value in a font style value (italic/normal).
     * @param {boolean} flag
     * @returns {string}
     */
    static fontStyle(flag: boolean): string {
        return flag ? "italic" : "normal";
    }

    /**
     * Translate a boolean value in a font weight value (bold/normal).
     * @param {boolean} flag
     * @returns {string}
     */
    static fontWeight(flag: boolean): string {
        return flag ? "bold" : "normal";
    }

    /**
     * Focus an element putting the cursor in the end.
     * @param {HTMLElement} element
     */
    static focusWithCaretAtEnd(element: HTMLElement) {
        let range = document.createRange(),
            sel = window.getSelection();

        element.focus();
        range.selectNodeContents(element);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }

}
