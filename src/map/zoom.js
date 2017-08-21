import * as d3 from "d3"
import glob from "../global"
import Events from "../events"

/**
 * @name zoom
 * @desc d3 zoom function.
 */
export let zoom = d3.zoom().scaleExtent([0.5, 2]).on("zoom", zoomed)

/**
 * @name zoomIn
 */
export function zoomIn() {
    move(true)
}

/**
 * @name zoomOut
 */
export function zoomOut() {
    move(false)
}

/**
 * @name center
 * @desc Center the root node in the mind map.
 */
export function center() {
    let root = glob.nodes.get("node0"),
        x = parseInt(glob.container.style("width")) / 2 - root.x,
        y = parseInt(glob.container.style("height")) / 2 - root.y,
        zoomId = d3.zoomIdentity.translate(x, y)
    glob.svg.main.transition().duration(500).call(zoom.transform, zoomId)
    Events.call("mmcenter")
}

/**
 * @name zoomed
 * @desc Set the transform of the mind map when the zoom change.
 */
function zoomed() {
    glob.svg.mmp.attr("transform", d3.event.transform)
}

/**
 * @name move
 * @param {boolean} dir - Direction of the zoom
 * @desc Move the zoom in a direction ( true: in, false: out ).
 */
function move(dir) {
    let main = glob.svg.main,
        k = d3.zoomTransform(main.node()).k
    k += dir ? k / 5 : -k / 5
    zoom.scaleTo(main.transition().duration(100), k)
}
