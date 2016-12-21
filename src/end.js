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
    exports.new = newMap;
    exports.events = events;
    exports.png = png;
    exports.data = data;
    exports.load = load;
    exports.node = {
        update : updateNode,
        remove : removeNode,
        add : addNode
    };

    Object.defineProperty( exports, '__esModule', { value: true } );

})));
