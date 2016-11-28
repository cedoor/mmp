    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        init : init,
        createNode : createNode,
        getNodes : getNodes,
        removeNode : removeNode,
        selectNode : selectNode,
        centerMap : centerMap
    };

}(this, window.d3));
