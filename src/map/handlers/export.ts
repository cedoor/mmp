import Map from "../map";
import {default as Log, ErrorMessage} from "../../utils/log";
import {MapSnapshot} from "./history";

/**
 * Manage map image exports.
 */
export default class Export {

    private map: Map;

    /**
     * Get the associated map instance.
     * @param {Map} map
     */
    constructor(map: Map) {
        this.map = map;
    }

    /**
     * Return
     * @returns {MapSnapshot} json
     */
    public asJSON = (): MapSnapshot => {
        return this.map.history.current();
    };

    /**
     * Set image settings and pass its data URL in a callback function.
     * @param {Function} callback
     * @param {string} type
     */
    public asImage = (callback: Function, type: string) => {
        this.map.nodes.deselectNode();

        this.dataURL(url => {
            let image = new Image();

            image.src = url;

            image.onload = function () {
                let canvas = document.createElement("canvas"),
                    context = canvas.getContext("2d");

                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);

                context.globalCompositeOperation = "destination-over";
                context.fillStyle = "#ffffff";
                context.fillRect(0, 0, canvas.width, canvas.height);

                if (typeof type === "string") type = "image/" + type;
                callback(canvas.toDataURL(type));
            };

            image.onerror = function () {
                Log.error(ErrorMessage.imageExportLoading);
            };
        });
    };

    /**
     * Translate the mind map svg in data URI.
     * @name dataURL
     * @param {Function} cb - A callback with uri as parameter
     */
    private dataURL(cb) {
        let element = this.map.dom.g.node(),
            clone = element.cloneNode(true),
            svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
            box = element.getBBox(),
            css = this.cssRules(element);
        const
            xmlns = "http://www.w3.org/2000/xmlns/", padding = 15,
            x = box.x - padding, y = box.y - padding,
            w = box.width + padding * 2, h = box.height + padding * 2;

        svg.setAttributeNS(xmlns, "xmlns", "http://www.w3.org/2000/svg");
        svg.setAttributeNS(xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
        svg.setAttribute("version", "1.1");
        svg.setAttribute("width", w);
        svg.setAttribute("height", h);
        svg.setAttribute("viewBox", [x, y, w, h].join(" "));

        // If there is css, insert it
        if (css !== "") {
            let style = document.createElement("style"),
                defs = document.createElement("defs");

            style.setAttribute("type", "text/css");
            style.innerHTML = "<![CDATA[\n" + css + "\n]]>";
            defs.appendChild(style);
            svg.appendChild(defs);
        }

        clone.setAttribute("transform", "translate(0,0)");
        svg.appendChild(clone);

        this.checkImages(clone, function () {
            let xmls = new XMLSerializer(),
                reader = new FileReader();

            let blob = new Blob([
                xmls.serializeToString(svg)
            ], {
                type: "image/svg+xml"
            });

            reader.readAsDataURL(blob);
            reader.onloadend = function () {
                cb(reader.result);
            };
        });
    }

    /**
     * Return the css rules of an element.
     * @param {Object} element - A dom element.
     * @return {string} css - Css rules.
     */
    private cssRules(element) {
        let css = "", sheets = document.styleSheets;
        for (let i = 0; i < sheets.length; i++) {
            let rules = (<any>sheets[i]).cssRules;
            if (rules) {
                for (let j = 0; j < rules.length; j++) {
                    let rule = rules[j], fontFace = rule.cssText.match(/^@font-face/);
                    if (element.querySelector(rule.selectorText) || fontFace)
                        css += rule.cssText;
                }
            }
        }
        return css;
    }

    /**
     * If there are images in the map convert their href in dataURL.
     * @param {Object} element - The DOM element to check.
     * @param {Function} cb - A callback to execute after check.
     */
    private checkImages(element, cb) {
        let images = element.querySelectorAll("image"),
            l = images.length, counter = l;

        if (l > 0) for (let image of images) {

            let canvas = document.createElement("canvas"),
                ctx = canvas.getContext("2d"),
                img = new Image(),
                href = image.getAttribute("href");

            img.crossOrigin = "Anonymous";
            img.src = href;
            img.onload = function () {
                canvas.width = this.clientWidth;
                canvas.height = this.clientHeight;
                ctx.drawImage(<any>this, 0, 0);
                image.setAttribute("href", canvas.toDataURL("image/png"));
                counter--;
                if (counter === 0) cb();
            };
            img.onerror = function () {
                counter--;
                if (counter === 0) cb();
            };

        } else cb();
    }

}