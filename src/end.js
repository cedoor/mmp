    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        init : init,
        createNode : createNode,
        getNodes : getNodes,
        deleteNode : deleteNode,
        selectNode : selectNode
    };

}(this, window.d3));
