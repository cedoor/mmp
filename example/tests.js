describe("Tests", function () {

    let should = chai.should();

    describe("§ testMap.new()", function () {
        it("Should create a new empty mind map without errors", function () {
            testMap.new.should.to.not.throw(Error);
        });

        it("Should exist the svg node in the DOM", function () {
            let svg = document.querySelector("#mmp2 > svg");
            svg.should.to.not.equal(null);
        });

        it("Should exist the root node in the DOM", function () {
            let node = document.querySelector("#mmp2_node_0");
            node.should.to.not.equal(null);
        });
    });

    describe("§ testMap.options()", function () {
        it("Should update the default node parameters of mind map", function () {
            testMap.updateOptions("defaultNode", {
                name: "Hello world"
            });

            testMap.new();
            testMap.addNode();
            testMap.selectNode("mmp2_node_1");

            testMap.selectNode().name.should.to.equal("Hello world");
        });
    });

    describe("§ testMap.zoomIn()", function () {
        it("Should zoom in the mind map without errors", function () {
            testMap.zoomOut.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.zoomOut()", function () {
        it("Should zoom out the mind map without errors", function () {
            testMap.zoomIn.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.center()", function () {
        it("Should center the mind map without errors", function () {
            testMap.center.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.undo()", function () {
        it("Should undo the mind map without errors", function () {
            testMap.undo.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.redo()", function () {
        it("Should repeat the mind map without errors", function () {
            testMap.redo.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.selectNode()", function () {
        it("Should get selected node without errors", function () {
            testMap.selectNode.should.to.not.throw(Error);
        });

        it("Should select a node", function () {
            testMap.selectNode("mmp2_node_0");

            testMap.selectNode().should.to.have.property("id").and.equal("mmp2_node_0");
        });

        it("Should move node selection in the left direction", function () {
            testMap.new();
            testMap.addNode();

            testMap.selectNode("left");

            testMap.selectNode().id.should.to.equal("mmp2_node_1");
        });

        it("Should move node selection in the right direction", function () {
            testMap.selectNode("mmp2_node_0");
            testMap.addNode();
            testMap.selectNode("right");

            testMap.selectNode().id.should.to.equal("mmp2_node_2");
        });

        it("Should move node selection in the up direction", function () {
            testMap.selectNode("mmp2_node_0");
            testMap.addNode();
            testMap.selectNode("mmp2_node_3");
            testMap.selectNode("up");

            testMap.selectNode().id.should.to.equal("mmp2_node_1");
        });

        it("Should move node selection in the down direction", function () {
            testMap.selectNode("down");

            testMap.selectNode().id.should.to.equal("mmp2_node_3");
        });
    });

    describe("§ testMap.addNode()", function () {
        it("Should add a node without errors", function () {
            testMap.addNode.should.to.not.throw(Error);
        });

        it("Should exist in the DOM", function () {
            let node = document.querySelector("#mmp2_node_1");
            node.should.to.not.equal(null);
        });

        it("Should add a node with custom parameters", function () {
            testMap.new();

            testMap.addNode({
                name: "Custom node",
                colors: {
                    background: "#c9dfc0"
                },
                image: {
                    src: "https://raw.githubusercontent.com/Mindmapp/mindmapp/master/src/assets/icon/png/64x64.png",
                    size: 100
                }
            });

            let node = document.getElementById("mmp2_node_1"),
                background = node.childNodes[0],
                text = node.childNodes[1].childNodes[0],
                image = node.childNodes[2];

            background.style["fill"].should.to.equal("rgb(201, 223, 192)");
            text.innerHTML.should.to.equal("Custom node");
            should.exist(image);
        });
    });

    describe("§ testMap.deselectNode()", function () {
        it("Should deselect node without errors", function () {
            testMap.deselectNode.should.to.not.throw(Error);
        });

        it("Should deselect a node (fake root node selection)", function () {
            testMap.addNode();
            testMap.deselectNode();

            testMap.selectNode().should.to.have.property("id").and.equal("mmp2_node_0");
        });
    });

    describe("§ testMap.removeNode()", function () {
        it("Should remove a node without errors", function () {
            testMap.new();
            testMap.addNode();
            testMap.selectNode("mmp2_node_1");

            testMap.removeNode.should.to.not.throw(Error);
        });
    });

    describe("§ testMap.updateNode()", function () {
        it("Should visually update the properties of a node", function () {
            let color = testMap.selectNode("mmp2_node_0").colors.name;

            testMap.updateNode("nameColor", "red", true);
            testMap.selectNode().colors.name.should.to.equal(color);
        });

        it("Should update the properties of a node", function () {
            testMap.updateNode("nameColor", "gray");
            testMap.selectNode().colors.name.should.to.equal("gray");
        });
    });

    describe("§ testMap.exportAsJSON()", function () {
        it("Should get mind map data without errors", function () {
            testMap.exportAsJSON.should.to.not.throw(Error);
        });

        it("Should have at least the first node", function () {
            let json = testMap.exportAsJSON();

            json[0].should.to.have.property("id").and.equal("mmp2_node_0");
        });

        it("Should create an existing mind map", function () {
            (function () {
                testMap.new(testMap.exportAsJSON()
                );
            }).should.to.not.throw(Error);
        });
    });

    describe("§ testMap.exportAsImage()", function () {
        it("Should get mind map data without errors", function () {
            (function () {
                testMap.exportAsImage(() => {
                });
            }).should.to.not.throw(Error);
        });

        it("Should have at least the first node", function () {
            testMap.exportAsImage((dataURI) => {
                let check = dataURI.match(/^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i);

                check.should.to.not.equal(null);
            });
        });
    });

    after(function () {
        testMap.new();
    });

});
