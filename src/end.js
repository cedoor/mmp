    /**
     * @description
     * Make visible public functions outside
     *
     */
    exports.version = version;
    exports.init = init;
    exports.center = center;
    exports.undo = undo;
    exports.repeat = repeat;
    exports.zoomIn = zoomIn;
    exports.zoomOut = zoomOut;
    exports.new = newMap;
    exports.on = on;
    exports.image = image;
    exports.data = data;
    exports.load = load;
    exports.node = {
        update : updateNode,
        remove : removeNode,
        add : addChildNode,
        selected : selectedNode
    };

    Object.defineProperty( exports, '__esModule', { value: true } );

})));
