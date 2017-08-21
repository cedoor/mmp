import * as d3 from "d3"
import glob from "../global"
import BranchShape from  "../draw/branch"
import NodeShape from "../draw/node"

/**w
 * @name orientation
 * @param {number} x - The key of the parent node.
 * @return {boolean} orientation
 * @desc Return the orientation of a node in the mind map ( true: on left )
 */
export function orientation(x) {
    let root = glob.nodes.get("node0")
    return x < root.x ? true : x > root.x ? false : undefined
}

/**
 * @name setImage
 * @param {Object} dom - The d3 DOM element of node.
 * @return {Object} node - The node values.
 * @desc Set main properties of image in the node
 * and create it if it doesn't exist
 */
export function setImage(dom, node) {
    let i = new Image(),
        href = node["image-src"],
        image = dom.select("image")
    if (image.empty()) image = dom.append("image")
    i.src = href
    i.onload = function () {
        let h = node["image-size"],
            w = this.width * h / this.height
        image.attr("href", href).attr("height", h)
            .attr("y", -( h + node.height / 2 + 5 ))
            .attr("x", -w / 2)
    }
    i.onerror = function () {
        image.remove()
        node["image-src"] = ""
    }
}

/**
 * @name updateNodeShapes
 * @param {HTMLElement} dom - Mind map node DOM element.
 * @desc Update the node HTML elements.
 */
export function updateNodeShapes(dom) {
    let name = dom.childNodes[1].childNodes[0],
        background = dom.childNodes[0]
    d3.selectAll(".branch").attr("d", node => new BranchShape(node).draw())
    d3.select(background).attr("d", function (node) {
        return new NodeShape(node, this).draw()
    })
    d3.select(name.parentNode)
        .attr("x", -name.clientWidth / 2)
        .attr("y", -name.clientHeight / 2)
        .attr("width", name.clientWidth)
        .attr("height", name.clientHeight)
}

/**
 * @name dom
 * @param {string} k - The key of node.
 * @return {Object} dom
 * @desc Return the dom node of a mind map node.
 */
export let dom = k => document.getElementById(k)

/**
 * @name level
 * @param {Object} n - The node.
 * @return {number} level - The level of node.
 * @desc Find the level of a node.
 */
export function level(n) {
    let p = n.parent, level = 0
    while (p) {
        level++
        p = glob.nodes.get(p).parent
    }
    return level
}

/**
 * @name children
 * @param {string} k - The key of node.
 * @return {Object} children - The children of node.
 * @desc Return only the children of a node and not all subnodes.
 */
export function children(k) {
    return glob.nodes.values().filter(n => n.parent === k)
}

/**
 * @name subnodes
 * @param {string} key - The key of the parent node.
 * @param {Function} cb - A callback.
 * @desc Iterate all subnodes of a node and exec a callback for each subnode.
 */
export function subnodes(key, cb) {
    glob.nodes.each(function (n, k) {
        if (n.parent === key) {
            cb.call(document.getElementById(k), n, k)
            subnodes(k, cb)
        }
    })
}

/**
 * @name stroke
 * @param {Object} n - The node.
 * @param {string} [v] - The value of stroke color.
 * @return {string} value - The value of stroke color.
 * @desc Set color of node stroke if v is defined and return its value.
 */
export function stroke(n, v) {
    let bg = dom(n).childNodes[0]
    return typeof v === "string" ? bg.style["stroke"] = v : bg.style["stroke"]
}

/**
 * @name calcX
 * @param {number} x - x coordinate of parent node.
 * @return {number} x - x coordinate of child node.
 * @desc Return the x coordinate of a node based on parent x coordinate.
 */
export function calcX(x) {
    let or = orientation(x),
        dir = or === true ? -1 : or === false ? 1 :
            children("node0").length % 2 === 0 ? -1 : 1
    return x + 200 * dir
}

/**
 * @name calcY
 * @param {number} y - y coordinate of parent node.
 * @return {number} y - y coordinate of child node.
 * @desc Return the y coordinate of a node based on parent y coordinate.
 * { To do more sophisticated }
 */
export function calcY(y) {
    return y - d3.randomUniform(60, 100)()
}
