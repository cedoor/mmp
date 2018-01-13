import * as d3 from "d3";
import Global from "../global";
import {save as saveSnapshot} from "../map/snapshots";
import BranchShape from "../draw/branch";
import {getDom, orientation, subnodes} from "./utils";

/**
 * @name moveTo
 * @param {string} dir - Direction.
 * @param {number} range - The shift range.
 * @desc Move the node in the direction passed as parameter.
 */
export function moveTo(dir, range = 10) {
    let s = Global.nodes.get(Global.selected),
        d = getDom(Global.selected),
        move = {
            up: n => n.y -= range, down: n => n.y += range,
            right: n => n.x += range, left: n => n.x -= range
        },
        or = orientation(s.x);
    // Set new coordinates
    move[dir](s);
    // Move graphically the node in new coordinates
    d.setAttribute("transform", "translate(" + [s.x, s.y] + ")");
    // If the node isn't fixed move also subnodes
    const c = orientation(s.x) === or;
    if (s.fixed) subnodes(Global.selected, function (n) {
        move[dir](n);
        if (!c) n.x += (s.x - n.x) * 2;
        this.setAttribute("transform", "translate(" + [n.x, n.y] + ")");
    });
    // Update all mind map branches
    d3.selectAll(".branch").attr("d", node => new BranchShape(node).draw());
    saveSnapshot();
}
