    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        // Basic
        init : init,
        center : center,
        undo : undo,
        repeat : repeat,
        newMap : newMap,
        addNode : addNode,
        removeNode : removeNode,

        // Advanced
        updateNode : updateNode,
        events : events,
        getPNG : getPNG
    };

}(this, window.d3));
