// Mind maps
let map = mmp.create("mmp1", { rootNode: { name: "Map" } }),
    testMap = mmp.create("mmp2", { rootNode: { name: "Test map" } }),
    // Dom elements
    dom = {
        fontSize: document.getElementsByClassName("font-size"),
        imageSize: document.getElementsByClassName("image-size"),
        imageSrc: document.getElementsByClassName("image-src"),
        downloadMap: document.getElementsByClassName("download-map"),
        downloadImage: document.getElementsByClassName("download-image"),
        uploadMap: document.getElementsByClassName("upload-map"),
        backgroundColor: document.getElementsByClassName("background-color"),
        branchColor: document.getElementsByClassName("branch-color"),
        nameColor: document.getElementsByClassName("name-color")
    };

// Console messages
function message(message, ...arguments) {
    console.log("%c" + message, "color: #2f5226; font-size: 14px", ...arguments);
}

// Download the json of the map
function downloadMap(map) {
    let data = map.exportAsJSON(),
        json = JSON.stringify(data),
        blob = new Blob([json], {type: "application/json"}),
        a = document.createElement("a");

    a.download = "example.json";
    a.href = URL.createObjectURL(blob);
    a.click();
}

// Upload a mmp json to map
function uploadMap(map, e) {
    let reader = new window.FileReader();

    reader.readAsText(e.target.files[0]);

    reader.onload = function () {
        let data = JSON.parse(event.target.result);
        map.new(data);
    };
}

// Save the image of the map
function downloadImage(map) {
    map.exportAsImage(function (url) {
        let a = document.createElement("a");
        a.download = "example";
        a.href = url;
        a.click();
    }, "jpeg");
}

// Insert an image in the selected node
function insertImage(map) {
    let src = map.selectNode().image.src;

    if (src === "") {
        let value = prompt("Please enter your name", "example/img/material-icons/add.svg");

        if (value) {
            map.updateNode("imageSrc", value);
        }
    } else {
        map.updateNode("imageSrc", "");
    }
}

// Update bold status
function bold(map) {
    let value = map.selectNode().font.weight !== "bold" ? "bold" : "normal";
    map.updateNode("fontWeight", value);
}

// Update italic status
function italic(map) {
    let value = map.selectNode().font.style !== "italic" ? "italic" : "normal";
    map.updateNode("fontStyle", value);
}

// Update the values of map controls
function updateValues(node, map) {
    dom.fontSize[map].value = node.fontSize;
    dom.imageSize[map].value = node.image.size;
    dom.backgroundColor[map].value = node.colors.background;
    dom.branchColor[map].value = node.colors.branch || "#ffffff";
    dom.nameColor[map].value = node.colors.name;
}

// Initialize values of map controls
updateValues(map.selectNode(), 0);

// Map events
dom.downloadMap[0].onclick = function () {
    downloadMap(map);
};

dom.downloadMap[1].onclick = function () {
    downloadMap(testMap);
};

dom.uploadMap[0].onchange = function (event) {
    uploadMap(map, event);
    dom.uploadMap[0].value = "";
};

dom.uploadMap[1].onchange = function (event) {
    uploadMap(testMap, event);
    dom.uploadMap[1].value = "";
};

dom.downloadImage[0].onclick = function () {
    downloadImage(map);
};

dom.downloadImage[1].onclick = function () {
    downloadImage(testMap);
};

dom.imageSrc[0].onclick = function () {
    insertImage(map);
};

dom.imageSrc[1].onclick = function () {
    insertImage(testMap);
};

map.on("create", function () {
    message("§ map.new()");
});

map.on("center", function () {
    message("§ map.center()");
});

map.on("undo", function () {
    message("§ map.undo()");
});

map.on("redo", function () {
    message("§ map.redo()");
});

map.on("zoomIn", function () {
    message("§ map.zoomIn()");
});

map.on("zoomOut", function () {
    message("§ map.zoomOut()");
});

map.on("exportJSON", function () {
    message("§ map.exportAsJSON()");
});

map.on("exportImage", function () {
    message("§ map.exportAsImage()");
});

map.on("nodeSelect", function (node) {
    updateValues(node, 0);

    message("§ map.selectNode", node.id);
});

map.on("nodeDeselect", function () {
    updateValues(map.selectNode(), 0);

    message("§ map.deselectNode");
});

testMap.on("nodeSelect", function (node) {
    updateValues(node, 1);
});

map.on("nodeUpdate", function (node) {
    message("§ map.updateNode", node.id);
});

map.on("nodeCreate", function (node) {
    message("§ map.addNode", node.id);
});

map.on("nodeRemove", function (node) {
    message("§ map.removeNode", node.id);
});