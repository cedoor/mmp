    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        // Basic
        init : init,
        center : center,
        newMap : newMap,
        addNode : addNode,
        removeNode : removeNode,

        // Advanced
        updateNode : updateNode,
        events : events,
        getPNG : getPNG
    };

}(this, window.d3));
