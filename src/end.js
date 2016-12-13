    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        init : init,
        center : center,
        undo : undo,
        repeat : repeat,
        new : newMap,
        events : events,
        png : png,
        data : data,
        load : load,
        addNode : addNode,
        removeNode : removeNode,
        updateNode : updateNode
    };

}(this, window.d3));
