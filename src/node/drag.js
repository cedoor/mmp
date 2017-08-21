import * as d3 from "d3"
import glob from "../global"
import {save as saveSnapshot} from "../map/snapshots"
import {branch as drawBranch} from "../draw/index"
import * as node from "./index"

/**
 * @name drag
 * @desc d3 drag function.
 */
export let drag = d3.drag()
    .on("start", started)
    .on("drag", dragged)
    .on("end", ended)

/**
 * @name started
 * @param {Object} n - Mind map node.
 * @desc
 * Select the node.
 */
function started(n) {
    d3.event.sourceEvent.preventDefault()
    node.select(n.key)
}

/**
 * @name dragged
 * @param {Object} n - Mind map node.
 * @desc
 * Move the node dragged and if it isn't fixed all subnodes.
 */
function dragged(n) {
    const dy = d3.event.dy, dx = d3.event.dx,
        // Set new coordinates and save them
        x = n.value.x += dx, y = n.value.y += dy,
        // Check if old and new orientation are equal
        c = node.orientation(x) === node.orientation(x - dx)
    // Move graphically the node in new coordinates
    this.setAttribute("transform", "translate(" + [x, y] + ")")
    // If the node isn't fixed move also subnodes
    if (n.value.fixed) {
        let parent = n
        node.subnodes(n.key, function (n) {
            const x = n.x += dx, y = n.y += dy
            // If c is false change the orientation of subnodes
            if (!c) n.x += ( parent.value.x - n.x ) * 2
            this.setAttribute("transform", "translate(" + [x, y] + ")")
        })
    }
    // Update all mind map branches
    d3.selectAll(".branch").attr("d", drawBranch)
    // This is here and not in started function
    // because started function is also executed
    // when there is no drag events
    glob.dragged = true
}

/**
 * @name ended
 * @desc
 * If the node was actually dragged change global value
 * and save the snapshot.
 */
function ended() {
    if (glob.dragged) {
        glob.dragged = false
        saveSnapshot()
    }
}
