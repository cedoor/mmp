    /** Nodes **/

    d3.timeout(function(){
        mmap.createNode({
            background : '#ece0e0', color : '#8d9f8e',
            font : 15, name : 'Another node'
        });
        mmap.selectNode('node1');
    }, 1000);

    d3.timeout(function(){
        mmap.createNode({
            background : '#e2ecdf', color : '#8d9f8e',
            font : 15, name : 'Another node'
        });
        mmap.selectNode('node0');
    }, 2000);

    d3.timeout(function(){
        mmap.createNode({
            background : '#dfe8ec', color : '#8d9f8e',
            font : 15, name : 'Another node'
        });
    }, 3000);
