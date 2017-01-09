/**
 * mmap v0.1.3 https://github.com/cedoor/mmap
 * Copyright 2017 Omar Desogus
 * Lincensed under MIT
 */
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
	typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
	(factory((global.mmap = global.mmap || {}),global.d3));
}(this, (function (exports,d3) { 'use strict';

var version = "0.1.3";

// ...
var global$1 = {};

var zoom$1 = d3.zoom().scaleExtent([0.5, 2]).on('zoom', function () {
    global$1.svg.mmap.attr('transform', d3.event.transform);
});

function zoomIn() {
    setZoom(true);
}

function zoomOut() {
    setZoom(false);
}

function setZoom(inout) {
    var main = global$1.svg.main;
    var k = d3.zoomTransform(main.node()).k;
    k += inout ? k / 5 : -k / 5;
    zoom$1.scaleTo(main.transition().duration(100), k);
}

var event$1 = d3.dispatch('mmcreate', 'mmcenter', 'nodedblclick', 'nodeselect', 'nodeupdate', 'nodecreate', 'noderemove');

function on(e, cb) {
    event$1.on(e, cb);
}

function error$1(message) {
    console.error(message);
    return false;
}

function cloneObject(obj) {
    return Object.assign({}, obj);
}

function orientation(x) {
    return x < global$1.nodes.get('node0').x;
}

function checkItalicFont(italic) {
    return italic ? 'italic' : 'normal';
}

function checkBoldFont(bold) {
    return bold ? 'bold' : 'normal';
}

function overwriteProperties(target, source) {
    for (var prop in target) {
        var t = target[prop],
            s = source[prop];
        if (s && s.constructor === t.constructor) {
            if (s.constructor === Object) overwriteProperties(t, s);else target[prop] = s;
        }
    }
}



function $(s) {
    var k = s.substring(0, 1),
        n = s.substring(1);
    return k === '.' ? document.getElementsByClassName(n) : k === '#' ? document.getElementById(n) : s.includes('node') ? document.getElementById(s) : document.getElementsByTagName(s);
}

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

function undo() {
    var h = global$1.history;
    if (h.index > 0) loadSnapshot(h.snapshots[--h.index]);
}

function repeat() {
    var h = global$1.history;
    if (h.index < h.snapshots.length - 1) loadSnapshot(h.snapshots[++h.index]);
}





function saveSnapshot() {
    var h = global$1.history;
    if (h.index < h.snapshots.length - 1) h.snapshots.splice(h.index + 1);
    h.snapshots.push(mapClone());
    h.index++;
}

function loadSnapshot(snapshot) {
    global$1.nodes.clear();
    snapshot.forEach(function (node) {
        global$1.nodes.set(node.key, cloneObject(node.value));
    });
    redraw();
    setCounter();
    clear();
}

function mapClone() {
    return global$1.nodes.entries().map(function (node) {
        var value = cloneObject(node.value);
        delete value.width;
        delete value.height;
        return { key: node.key, value: value };
    });
}

function setCounter() {
    var getIntOfKey = function getIntOfKey(k) {
        return parseInt(k.substring(4));
    },
        keys = global$1.nodes.keys().map(getIntOfKey);
    global$1.counter = Math.max.apply(Math, toConsumableArray(keys));
}

function drawBranch(node) {
    var n = node.value;
    var p = global$1.nodes.get(n.parent);
    var nodeLevel = getNodeLevel(n);
    var width = 22 - (nodeLevel < 5 ? nodeLevel : 5) * 3;
    var middleX = (p.x + n.x) / 2;
    var orY = p.y < n.y + n.height / 2 ? -1 : 1;
    var orX = p.x > n.x ? -1 : 1;
    var inv = orX * orY;

    var path$$1 = d3.path();
    path$$1.moveTo(p.x, p.y - width * .8);
    path$$1.bezierCurveTo(middleX - width * inv, p.y - width / 2, p.x - width / 2 * inv, n.y + n.height / 2 - width / 3, n.x - n.width / 3 * orX, n.y + n.height / 2 + 3);
    path$$1.bezierCurveTo(p.x + width / 2 * inv, n.y + n.height / 2 + width / 3, middleX + width * inv, p.y + width / 2, p.x, p.y + width * .8);
    path$$1.closePath();

    return path$$1;
}

function drawBackgroundShape(node) {

    var n = node.value;
    var path$$1 = d3.path();
    var x = (n.width = this.nextSibling.getBBox().width + 45) / 2;
    var y = (n.height = this.nextSibling.getBBox().height + 30) / 2;
    var k = n.k = n.k || d3.randomUniform(-20, 20)();

    path$$1.moveTo(-x, k / 3);
    path$$1.bezierCurveTo(-x, -y + 10, -x + 10, -y, k, -y);
    path$$1.bezierCurveTo(x - 10, -y, x, -y + 10, x, k / 3);
    path$$1.bezierCurveTo(x, y - 10, x - 10, y, k, y);
    path$$1.bezierCurveTo(-x + 10, y, -x, y - 10, -x, k / 3);
    path$$1.closePath();

    return path$$1;
}

function addChildNode(prop) {
    var s = global$1.nodes.get(global$1.selected),
        root = global$1.nodes.get('node0'),
        key = 'node' + ++global$1.counter,
        value = Object.assign({}, global$1.options['node'], {
        'x': prop && prop.x || findXPosition(s, root),
        'y': prop && prop.y || s.y - d3.randomUniform(60, 100)(),
        'parent': global$1.selected
    });
    addNode(key, value);
}

function removeNode() {
    var key = global$1.selected;
    if (key !== 'node0') {
        global$1.nodes.remove(key);
        subnodes(key, function (n, k) {
            global$1.nodes.remove(k);
        });
        selectNode('node0');
        redraw();
        saveSnapshot();
        event$1.call('noderemove', this, key);
    } else return error$1('The root node can not be deleted');
}

function selectNode(key) {
    var sel = global$1.selected;
    if (typeof key === 'string') {
        if (global$1.nodes.has(key)) {
            var node = $(key),
                bg = node.childNodes[0];
            if (bg.style['stroke'].length === 0) {
                if (sel) nodeStroke(sel, '');
                var color$$1 = d3.color(bg.style['fill']).darker(.5);
                bg.style['stroke'] = color$$1;
                if (sel !== key) {
                    global$1.selected = key;
                    event$1.call('nodeselect', node, key, global$1.nodes.get(key));
                }
            }
        } else error$1('The node with the key ' + key + ' don\'t exist');
    } else return {
        key: sel, value: cloneObject(global$1.nodes.get(sel))
    };
}



function createRootNode() {
    var value = Object.assign({}, global$1.options['root-node'], {
        'x': parseInt(global$1.container.style('width')) / 2,
        'y': parseInt(global$1.container.style('height')) / 2
    });
    addNode('node' + global$1.counter, value);
    clear();
}

function setNodeCoords(dom, x, y) {
    dom.setAttribute('transform', 'translate(' + [x, y] + ')');
}

function getNodeLevel(n) {
    var p = n.parent,
        level = 0;
    while (p) {
        level++;
        var _n = global$1.nodes.get(p);
        p = _n.parent;
    }
    return level;
}

function nodeStroke(node, value) {
    var bg = $(node).childNodes[0];
    if (value !== 'string') return bg.style['stroke'] = value;else return bg.style['stroke'];
}

function addNode(key, value) {
    global$1.nodes.set(key, value);
    update();
    event$1.call('nodecreate', $(key), key, value);
    saveSnapshot();
}

function findXPosition(sel, root) {
    var dir;
    if (sel.x > root.x) dir = 1;else if (sel.x < root.x) dir = -1;else {
        var f = function f(n) {
            return n.parent === 'node0';
        },
            l = global$1.nodes.values().filter(f).length;
        dir = l % 2 === 0 ? -1 : 1;
    }
    return sel.x + 200 * dir;
}

function subnodes(key, cb) {
    global$1.nodes.each(function (n, k) {
        if (n.parent === key) {
            cb.call(document.getElementById(k), n, k);
            subnodes(k, cb);
        }
    });
}

var drag$1 = d3.drag().on('drag', dragged).on('start', function (n) {
    selectNode(n.key);
}).on('end', function () {
    if (global$1.dragged) {
        global$1.dragged = false;
        saveSnapshot();
    }
});

function dragged(n) {
    var dy = d3.event.dy,
        dx = d3.event.dx,
        x = n.value.x += dx,
        y = n.value.y += dy,
        parent = n,
        sameOrientation = orientation(x) === orientation(x - dx);
    setNodeCoords(this, x, y);
    if (n.value.fixed) subnodes(n.key, function (n) {
        var x = n.x += dx,
            y = n.y += dy;
        if (!sameOrientation) n.x += (parent.value.x - n.x) * 2;
        setNodeCoords(this, x, y);
    });
    d3.selectAll('.branch').attr('d', drawBranch);
    global$1.dragged = true;
}

function newMap() {
    global$1.counter = 0;
    global$1.nodes.clear();
    createRootNode();
    redraw();
    center();
    saveSnapshot();
    event$1.call('mmcreate');
}

function clear() {
    selectNode('node0');
    nodeStroke('node0', '');
}

/**
 * @name image
 * @param {function} cb callback
 * @param {string} type type of image, default png
 * @param {string} background color of map background
 * @description
 * Get a DOMString containing the data URI of map image and
 * pass it to callback function.
*/


function center() {
    var root = global$1.nodes.get('node0'),
        center = {
        x: parseInt(global$1.container.style('width')) / 2,
        y: parseInt(global$1.container.style('height')) / 2
    },
        zoomId = d3.zoomIdentity.translate(center.x - root.x, center.y - root.y);
    global$1.svg.main.transition().duration(500).call(zoom$1.transform, zoomId);
    event$1.call('mmcenter');
}

function redraw() {
    d3.selectAll('.node, .branch').remove();
    update();
}

function update() {
    var map$$1 = global$1.nodes.entries(),
        nodes = global$1.svg.mmap.selectAll('.node').data(map$$1),
        branches = global$1.svg.mmap.selectAll('.branch').data(map$$1.slice(1));

    var node = nodes.enter().append('g').style('cursor', 'pointer').attr('class', 'node').attr('id', function (n) {
        return n.key;
    }).attr('transform', function (n) {
        return 'translate(' + n.value.x + ',' + n.value.y + ')';
    }).call(drag$1).on('dblclick', function (n) {
        d3.event.stopPropagation();
        event$1.call('nodedblclick', this, n.key, n.value);
    });

    node.append('text').text(function (n) {
        return n.value.name;
    }).style('font-family', 'sans-serif').style('text-anchor', 'middle').style('alignment-baseline', 'middle').style('fill', function (n) {
        return n.value['text-color'];
    }).style('font-size', function (n) {
        return n.value['font-size'];
    }).style('font-style', function (n) {
        return checkItalicFont(n.value.italic);
    }).style('font-weight', function (n) {
        return checkBoldFont(n.value.bold);
    });

    node.insert('path', 'text').style('fill', function (n) {
        return n.value['background-color'];
    }).style('stroke-width', 3).attr('d', drawBackgroundShape);

    branches.enter().insert('path', 'g').style('fill', function (n) {
        return n.value['branch-color'];
    }).style('stroke', function (n) {
        return n.value['branch-color'];
    }).attr('class', 'branch').attr('id', function (n) {
        return 'branchOf' + n.key;
    }).attr('d', drawBranch);

    nodes.exit().remove();
    branches.exit().remove();
}

function setShortcuts() {
    var map$$1 = {},
        sc = function sc() {
        return shortcut(arguments, map$$1);
    };
    window.onkeyup = window.onkeydown = function (e) {
        map$$1[e.keyCode] = e.type === 'keydown';
        if (sc('ctrl', 'maiusc', 'z')) return !!repeat();else if (sc('ctrl', 'z')) return !!undo();else if (sc('alt', 'maiusc', 'up')) moveNode('up');else if (sc('alt', 'maiusc', 'down')) moveNode('down');else if (sc('alt', 'maiusc', 'left')) moveNode('left');else if (sc('alt', 'maiusc', 'right')) moveNode('right');else if (sc('alt', 'maiusc', '+')) zoomIn();else if (sc('alt', 'maiusc', '-')) zoomOut();else if (sc('alt', 'up')) return !!moveSelection('up');else if (sc('alt', 'down')) return !!moveSelection('down');else if (sc('alt', 'right')) return !!moveSelection('right');else if (sc('alt', 'left')) return !!moveSelection('left');else if (sc('alt', 'c')) center();else if (sc('alt', 'n')) newMap();else if (sc('alt', '+')) addChildNode();else if (sc('alt', '-')) removeNode();else if (sc('esc')) clear();
    };
}

function shortcut(keys, map$$1) {
    var alias = {
        'up': 38, 'down': 40, 'right': 39, 'left': 37,
        'ctrl': 17, 'alt': 18, 'maiusc': 16, 'esc': 27, 'f': 70,
        'c': 67, 'n': 78, '+': 187, '-': 189, 'i': 73, 'z': 90
    };
    for (var i = 0; i < keys.length; i++) {
        if (!map$$1[alias[keys[i]]]) return false;
    }return true;
}

function moveSelectionOnLevel(dir) {
    var sel = global$1.nodes.get(global$1.selected),
        lev = getNodeLevel(sel),
        or = orientation(sel.x);
    var key,
        tmp = Number.MAX_VALUE;
    global$1.nodes.each(function (n, k) {
        var d = dir ? sel.y - n.y : n.y - sel.y,
            sameLevel = lev === getNodeLevel(n),
            sameNode = global$1.selected === k,
            sameOrientation = or === orientation(n.x);
        if (sameOrientation && sameLevel && !sameNode && d > 0 && d < tmp) {
            tmp = d;
            key = k;
        }
    });
    if (key !== undefined) selectNode(key);
}

function moveSelectionOnBranch(dir) {
    var sel = global$1.nodes.get(global$1.selected),
        root = global$1.nodes.get('node0');
    var key,
        checks,
        tmp = Number.MIN_VALUE;
    global$1.nodes.each(function (n, k) {
        if (sel.x < root.x) checks = dir ? n.parent === global$1.selected : sel.parent === k;else if (sel.x > root.x) checks = !dir ? n.parent === global$1.selected : sel.parent === k;else checks = (dir ? n.x < root.x : n.x > root.x) && n.parent === global$1.selected;
        if (checks && n.y > tmp) {
            tmp = n.y;
            key = k;
        }
    });
    if (key !== undefined) selectNode(key);
}

function moveSelection(dir) {
    var d = dir === 'up' || dir === 'left';
    if (dir === 'up' || dir === 'down') moveSelectionOnLevel(d);else moveSelectionOnBranch(d);
}

function moveNode(dir) {
    var s = global$1.nodes.get(global$1.selected),
        range = 10,
        oldOr = orientation(s.x),
        setCoord = {
        up: function up(n) {
            return n.y -= range;
        },
        down: function down(n) {
            return n.y += range;
        },
        right: function right(n) {
            return n.x += range;
        },
        left: function left(n) {
            return n.x -= range;
        }
    };
    setCoord[dir](s);
    var newOr = orientation(s.x);
    setNodeCoords(document.getElementById(global$1.selected), s.x, s.y);
    if (s.fixed) subnodes(global$1.selected, function (n) {
        setCoord[dir](n);
        if (newOr !== oldOr) n.x += (s.x - n.x) * 2;
        setNodeCoords(this, n.x, n.y);
    });
    d3.selectAll('.branch').attr('d', drawBranch);
    saveSnapshot();
}

/**
 * @name init
 * @description
 *
 */
var init = function (selector, options) {

    // Default options
    global$1.options = {
        'center-onresize': false,
        'shortcuts': true,
        'node': {
            'name': 'Node',
            'background-color': '#f9f9f9',
            'text-color': '#808080',
            'branch-color': '#9fad9c',
            'font-size': 16,
            'italic': false,
            'bold': false,
            'fixed': true
        },
        'root-node': {
            'name': 'Root node',
            'background-color': '#e6ede6',
            'text-color': '#828c82',
            'font-size': 20,
            'italic': false,
            'bold': false,
            'fixed': false
        }
    };

    global$1.container = d3.select(selector);
    global$1.history = { index: -1, snapshots: [] };
    global$1.svg = {};

    global$1.svg.main = global$1.container.append('svg').attr('width', '100%').attr('height', '100%').call(zoom$1);

    global$1.svg.main.append("rect").attr("width", '100%').attr("height", '100%').attr("fill", "white").attr("pointer-events", "all").on('click', clear);

    global$1.svg.mmap = global$1.svg.main.append('g');
    global$1.nodes = d3.map();
    global$1.counter = 0;

    // If opt is correct update the default options
    if (options !== undefined) options.constructor === Object ? overwriteProperties(global$1.options, options) : error$1('mmap options invalid');

    if (global$1.options['center-onresize'] === true) onresize = center;
    if (global$1.options['shortcuts'] === true) setShortcuts();

    event$1.call('mmcreate');

    createRootNode();
};

var node = {
    add: addChildNode,
    remove: removeNode,
    select: selectNode
};

exports.node = node;
exports.version = version;
exports.init = init;
exports.on = on;

Object.defineProperty(exports, '__esModule', { value: true });

})));
