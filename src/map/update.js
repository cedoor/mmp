import * as d3 from "d3"
import glob from "../global"
import * as node from "../node/index"
import NodeShape from "../draw/node"
import BranchShape from "../draw/branch"
import Utils from "../other/utils"

/**
 * @name update
 * @desc Update mind map with new nodes.
 */
export function update() {
    let nodeValues = glob.nodes.entries(),
        nodes = glob.svg.mmp.selectAll(".node").data(nodeValues),
        branches = glob.svg.mmp.selectAll(".branch").data(nodeValues.slice(1)),

        outer = nodes.enter().append("g")
            .style("cursor", "pointer")
            .attr("class", "node")
            .attr("id", n => n.key)
            .attr("transform", n => "translate(" + n.value.x + "," + n.value.y + ")")
            .on("dblclick", function () {
                d3.event.stopPropagation()
                Utils.focusWithCaretAtEnd(this.childNodes[1].childNodes[0])
            })

    if (glob.options["drag"] === true) outer.call(node.drag)

    outer.insert("foreignObject")
        .html(n => `<div style="
            font-size: ${n.value["font-size"]}px;
            display: inline-block;
            white-space: nowrap;
            color: ${n.value["text-color"]};
            font-style: ${Utils.fontStyle(n.value.italic)};
            font-weight: ${Utils.fontWeight(n.value.bold)};
            font-family: ${glob.options["font-family"]};
            text-align: center;
        " contenteditable spellcheck="false">${n.value.name}</div>`)
        .each(setNodeName)

    outer.insert("path", "foreignObject")
        .style("fill", n => n.value["background-color"])
        .style("stroke-width", 3)
        .attr("d", function (node) {
            return new NodeShape(node, this).draw()
        })

    outer.each(function (n) {
        node.setImage(d3.select(this), n.value)
    })

    branches.enter().insert("path", "g")
        .style("fill", n => n.value["branch-color"])
        .style("stroke", n => n.value["branch-color"])
        .attr("class", "branch")
        .attr("id", n => "branchOf" + n.key)
        .attr("d", node => new BranchShape(node).draw())

    nodes.exit().remove()
    branches.exit().remove()
}

/**
 * @name redraw
 * @desc Remove dom elements and recreate them.
 */
export function redraw() {
    d3.selectAll(".node, .branch").remove()
    update()
}

/**
 * @name setNodeText
 * @param {Object} n - Mind map node.
 * @desc Set the node text.
 */
function setNodeName(n) {
    let self = this, name = this.childNodes[0]
    name.oninput = function () {
        node.updateNodeShapes(self.parentNode)
    }
    name.onblur = function () {
        if (name.innerHTML !== n.value.name) {
            node.update("name", name.innerHTML)
        }
    }
    d3.select(self)
        .attr("x", -name.clientWidth / 2)
        .attr("y", -name.clientHeight / 2)
        .attr("width", name.clientWidth)
        .attr("height", name.clientHeight)
}