    /**
     * @name global
     * @description
     * Global dictionary that will contain all the properties of the
     * map shared by all functions within the module.
     *
     */
    const global = {};

    /**
     * @name init
     * @description
     * ...
     *
     * @param {string} selector The selector in which to draw
     */
    function init( selector ) {

        global.container = d3.select( selector );
        global.svg = {};

        global.svg.main = global.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g').call( zoom );

        global.svg.main.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "white")
            .attr("pointer-events", "all")
            .on('mousedown', deselectNode );

        global.svg.mmap = global.svg.main.append('g');
        global.nodes = d3.map();
        global.counter = 0;

        global.nodes.set('node' + global.counter, {
            x : parseInt( global.container.style('width') )/2,
            y : parseInt( global.container.style('height') )/2,
            background : '#e6ede6', textColor : '#828c82',
            font : 18, name : 'Root node'
        });

        update();
        selectNode('node0');

        events.call('mmcreate');
    }
