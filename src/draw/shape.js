import * as d3 from "d3"

export default class Shape {

    constructor(node, dom) {
        this.node = node.value
        this.dom = dom
        this.path = d3.path()
        this.random = d3.randomUniform
    }

    getNameDOMElement() {
        return this.dom.nextSibling.childNodes[0]
    }

}