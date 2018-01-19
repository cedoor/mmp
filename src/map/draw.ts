import * as d3 from "d3";
import Map from "./map";
import BranchShape from "../shapes/branch";
import NodeShape from "../shapes/node";
import Utils from "../utils";

export default class Draw {

    map: Map;

    constructor(map: Map) {
        this.map = map;
    }

    /**
     * @name create
     * @desc Create svg and main css map properties.
     */
    create() {
        // Set the view of the map
        this.map.dom.container = d3.select("#" + this.map.id).style("position", "relative");

        this.map.dom.svg = this.map.dom.container.append("svg").style("position", "absolute")
            .style("width", "100%").style("height", "100%")
            .style("top", 0).style("left", 0);

        this.map.dom.svg.append("rect")
            .attr("width", "100%").attr("height", "100%")
            .attr("fill", "white")
            .attr("pointer-events", "all")
            .on("click", () => {
                this.map.selectedNode.deselect();
            });

        this.map.dom.g = this.map.dom.svg.append("g");
    }

    /**
     * @name update
     * @desc Update the map with new nodes.
     */
    update() {
        let nodeValues = this.map.nodes.entries(),
            self = this,
            nodes = this.map.dom.g.selectAll("." + this.map.id + "_node").data(nodeValues),
            branches = this.map.dom.g.selectAll(".branch").data(nodeValues.slice(1)),

            outer = nodes.enter().append("g")
                .style("cursor", "pointer")
                .attr("class", this.map.id + "_node")
                .attr("id", function (node) {
                    node.value.dom = this;
                    return node.key;
                })
                .attr("transform", node => "translate(" + node.value.coordinates.x + "," + node.value.coordinates.y + ")")
                .on("dblclick", function () {
                    d3.event.stopPropagation();
                    Utils.focusWithCaretAtEnd(this.childNodes[1].childNodes[0]);
                });

        if (this.map.options.drag === true) {
            outer.call(this.map.drag.D3Drag);
        }

        outer.insert("foreignObject")
            .html(node => `<div style="
            font-size: ${node.value.fontSize}px;
            display: inline-block;
            white-space: nowrap;
            color: ${node.value.textColor};
            font-style: ${Utils.fontStyle(node.value.italic)};
            font-weight: ${Utils.fontWeight(node.value.bold)};
            font-family: ${this.map.options.fontFamily};
            text-align: center;
        " contenteditable spellcheck="false">${node.value.name}</div>`)
            .each(function (node) {
                self.setNodeName(node.value, this);
            });

        outer.insert("path", "foreignObject")
            .style("fill", node => node.value.backgroundColor)
            .style("stroke-width", 3)
            .attr("d", function (node) {
                return new NodeShape(node.value).draw();
            });

        outer.each(function (node) {
            // node.setImage(d3.select(this), node);
        });

        branches.enter().insert("path", "g")
            .style("fill", node => node.value.branchColor)
            .style("stroke", node => node.value.branchColor)
            .attr("class", this.map.id + "_branch")
            .attr("id", node => node.key + "_branch")
            .attr("d", node => new BranchShape(node.value).draw());

        nodes.exit().remove();
        branches.exit().remove();
    }

    /**
     * @name clear
     * @desc Remove all nodes and branches of the map.
     */
    clear() {
        d3.selectAll("." + this.map.id + "_node, ." + this.map.id + "_branch").remove();
    }

    /**
     * @name setNodeText
     * @param {Object} node - Mind map node.
     * @param {Object} dom - ...
     * @desc Set the node text.
     */
    setNodeName(node, dom) {
        let name = dom.childNodes[0];

        name.oninput = function () {
            // node.updateNodeShapes(dom.parentNode);
        };

        name.onblur = function () {
            if (name.innerHTML !== node.name) {
                // node.update("name", name.innerHTML);
            }
        };

        d3.select(dom)
            .attr("x", -name.clientWidth / 2)
            .attr("y", -name.clientHeight / 2)
            .attr("width", name.clientWidth)
            .attr("height", name.clientHeight);
    }

}