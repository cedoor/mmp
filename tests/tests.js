describe("Tests", function () {

    var should = chai.should(),
        expect = chai.expect

    describe("", function () {

        describe("§ mmp.init()", function () {
            it("Should initialize the mind map without errors", function () {
                var init = function () {
                    mmp.init("mmp")
                }
                init
                    .should.to.not.throw(Error)
            })
            it("Should exist the svg node in the DOM", function () {
                var svg = document.getElementsByTagName("svg")
                svg.length
                    .should.not.to.equal(0)
            })
            it("Should exist the root node in the DOM", function () {
                var node = document.getElementById("node0")
                expect(node).to.exist
            })
        })

        describe("§ mmp.remove()", function () {
            it("Should remove the mind map without errors", function () {
                mmp.remove()
            })
            it("Should not exist the svg node in the DOM", function () {
                var svg = document.getElementsByTagName("svg")
                svg.length
                    .should.to.equal(0)
            })
            it("Should not exist the root node in the DOM", function () {
                var node = document.getElementById("node0")
                expect(node).to.not.exist
            })
        })

    })

    describe("", function () {

        before(function () {
            mmp.init("mmp")
        })

        describe("§ mmp.new()", function () {
            it("Should create a new mind map without errors", function () {
                mmp.new
                    .should.to.not.throw(Error)
            })
            it("Should exist the svg node in the DOM", function () {
                var svg = document.getElementsByTagName("svg")
                svg.length
                    .should.not.to.equal(0)
            })
            it("Should exist the root node in the DOM", function () {
                var node = document.getElementById("node0")
                expect(node).to.exist
            })
        })

        describe("§ mmp.zoomIn()", function () {
            it("Should zoom-in the mind map without errors", function () {
                mmp.zoomOut
                    .should.to.not.throw(Error)
            })
        })

        describe("§ mmp.zoomOut()", function () {
            it("Should zoom-out the mind map without errors", function () {
                mmp.zoomIn
                    .should.to.not.throw(Error)
            })
        })

        describe("§ mmp.center()", function () {
            it("Should center the mind map without errors", function () {
                mmp.center
                    .should.to.not.throw(Error)
            })
        })

        describe("§ mmp.undo()", function () {
            it("Should undo the mind map without errors", function () {
                mmp.undo
                    .should.to.not.throw(Error)
            })
        })

        describe("§ mmp.repeat()", function () {
            it("Should repeat the mind map without errors", function () {
                mmp.repeat
                    .should.to.not.throw(Error)
            })
        })

        describe("§ mmp.node.add()", function () {
            it("Should add a node without errors", function () {
                mmp.node.add
                    .should.to.not.throw(Error)
            })
            it("Should exist in the DOM", function () {
                var node = document.getElementById("node1")
                expect(node).to.exist
            })
            it("Should add a node with custom parameters", function () {
                mmp.node.add({
                    "name": "Custom node",
                    "background-color": "rgb(201, 223, 192)",
                    "image-src": "tests/img/logo.png"
                })
                var node = document.getElementById("node2"),
                    background = node.childNodes[0],
                    text = node.childNodes[1].childNodes[0],
                    image = node.childNodes[2]
                background.style["fill"].should.to.equal("rgb(201, 223, 192)")
                text.innerHTML
                    .should.to.equal("Custom node")
                image
                    .should.to.exist
            })
        })

        describe("§ mmp.node.select()", function () {
            it("Should get selection of a node without errors", function () {
                mmp.node.select
                    .should.to.not.throw(Error)
            })
            it("Should select a node", function () {
                mmp.node.select("node1")
                mmp.node.select()
                    .should.to.have.property("key").and.equal("node1")
            })
        })

        describe("§ mmp.node.remove()", function () {
            it("Should remove a node without errors", function () {
                mmp.node.select("node2")
                mmp.node.remove
                    .should.to.not.throw(Error)
            })
        })

        describe("§ mmp.node.moveTo()", function () {
            it("Should move a node", function () {
                var x = mmp.node.select().value.x
                mmp.node.moveTo("right", 100)
                mmp.node.select().value.x
                    .should.to.equal(x + 100)
                mmp.node.moveTo("left", 100)
                mmp.node.select().value.x
                    .should.to.equal(x)
            })
        })

        describe("§ mmp.node.selectTo()", function () {
            it("Should move the selection of a node", function () {
                var key = mmp.node.select().key
                mmp.node.selectTo("left")
                mmp.node.select().key
                    .should.to.equal("node1")
                mmp.node.selectTo("right")
                mmp.node.select().key
                    .should.to.equal("node0")
            })
        })

        describe("§ mmp.node.update()", function () {
            it("Should update the properties of a node ( visual )", function () {
                var color = mmp.node.select().value["text-color"]
                mmp.node.update("text-color", "black", true)
                mmp.node.select().value["text-color"]
                    .should.to.equal(color)
            })
            it("Should update the properties of a node", function () {
                mmp.node.update("text-color", "black")
                mmp.node.select().value["text-color"]
                    .should.to.equal("black")
            })
        })

        describe("§ mmp.data()", function () {
            it("Should get mind map data without errors", function () {
                mmp.data
                    .should.to.not.throw(Error)
            })
            it("Should have at least the first node", function () {
                var data = mmp.data()
                data[0]
                    .should.to.have.property("key")
                    .and.equal("node0")
            })
        })

        after(function () {
            // Remove links from suites for separate tests
            var links = document.querySelectorAll(".suite > h1 > a")
            links.forEach(function (a) {
                var text = a.innerHTML, parent = a.parentNode
                parent.removeChild(a)
                parent.innerHTML = text
            })
            // Clear the console
            console.clear()
            console.log("%cTest were done!", "font-size: 16px; color: #4C4527")
            // Load app.js
            var script = document.createElement("script")
            document.body.appendChild(script)
            script.onload = function () {
                // Recreate the mind map
                mmp.remove()
                mmp.init("mmp")
            }
            script.src = "tests/app.js"
        })

    })
})
