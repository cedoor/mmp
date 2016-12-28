    /**
     * @description
     * Make visible public functions outside
     *
     */
    exports.version = version;
    exports.center = center;
    exports.undo = undo;
    exports.repeat = repeat;
    exports.zoomIn = zoomIn;
    exports.zoomOut = zoomOut;
    exports.new = newMap;
    exports.on = on;
    exports.png = png;
    exports.data = data;
    exports.load = load;
    exports.node = {
        update : updateNode,
        remove : removeNode,
        add : addNode,
        selected : selectedNode
    };

    Object.defineProperty( exports, '__esModule', { value: true } );

    // Initialize the mind map
    init();

})));
