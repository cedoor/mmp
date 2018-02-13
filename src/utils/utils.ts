import Log from "./log";

/**
 * A list of general useful functions.
 */
export default class Utils {

    /**
     * Clone an object, in depth if specified.
     * @param {object} object
     * @returns {object} object
     */
    static cloneObject(object: object): object {
        if (object === null) {
            return null;
        } else if (typeof object === "object") {
            return JSON.parse(JSON.stringify(object));
        } else {
            Log.error("Impossible to clone a non-object", "type");
        }
    }

    /**
     * Clear an object.
     * @param {object} object
     */
    static clearObject(object: object) {
        for (let property in object) {
            delete object[property];
        }
    }

    /**
     * Convert an Object to an array.
     * @param {object} object
     * @returns {Array}
     */
    static fromObjectToArray(object: object): Array<any> {
        let array = [];

        for (let p in object) {
            array.push(object[p]);
        }

        return array;
    }

    /**
     * Merge two objects.
     * @param {object} object1
     * @param {object} object2
     * @param {boolean} restricted
     * @returns {object} result
     */
    static mergeObjects(object1: object, object2: object, restricted: boolean = false): object {
        if (object2 === undefined && this.isPureObjectType(object1)) {
            return this.cloneObject(object1);
        } else if (object1 === undefined && this.isPureObjectType(object2)) {
            return this.cloneObject(object2);
        } else if (!this.isPureObjectType(object1) || !this.isPureObjectType(object2)) {
            Log.error("Only two pure objects can be merged", "type");
        }

        let result = this.cloneObject(object1);

        for (let property in object2) {
            let value = object2[property];

            if (!restricted || result[property] !== undefined) {
                if (this.isPrimitiveType(value) || value === null) {
                    result[property] = value;
                } else if (Array.isArray(value)) {
                    result[property] = Utils.cloneObject(value);
                } else if (this.isPureObjectType(value)) {
                    if (this.isPureObjectType(result[property])) {
                        result[property] = Utils.mergeObjects(result[property], value);
                    } else {
                        result[property] = Utils.cloneObject(value);
                    }
                } else {
                    Log.error(`Type "${typeof value}" not allowed here`, "type");
                }
            }
        }

        return result;
    }

    /**
     * Return css rules of an element.
     * @param {HTMLElement} element
     * @return {string} css
     */
    static cssRules(element: HTMLElement) {
        let css = "", sheets = document.styleSheets;

        for (let i = 0; i < sheets.length; i++) {
            let rules = (<any>sheets[i]).cssRules;

            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    let rule = rules[j],
                        fontFace = rule.cssText.match(/^@font-face/);

                    if (element.querySelector(rule.selectorText) || fontFace) {
                        css += rule.cssText;
                    }
                }
            }
        }

        return css;
    }

    /**
     * Return true if the value is a primitive type.
     * @param value
     * @returns {boolean}
     */
    static isPrimitiveType(value: any) {
        return typeof value === "string" ||
            typeof value === "number" ||
            typeof value === "boolean" ||
            typeof value === "undefined";
    }

    /**
     * Return true if the value is a pure object.
     * @param value
     * @returns {boolean}
     */
    static isPureObjectType(value: any) {
        return typeof value === "object" && !Array.isArray(value) && value !== null;
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
