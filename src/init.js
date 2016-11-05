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
     * @param {Object} opt Additional options for the map
     */
    function init( selector, opt ) {

        const frame = d3.select( selector ).style('overflow', 'hidden');

        const svg = frame.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g').call( zoom );

        svg.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "transparent")
            .attr("pointer-events", "all");

        global.mmap = svg.append('g').attr('class', 'mmap');

        global.nodes = d3.map([{
            id : 'node0',
            x : parseInt( frame.style('width') )/2,
            y : parseInt( frame.style('height') )/2,
            background : '#f5f5f5', color : '#8d9f8e',
            font : 18, name : 'Root node'
        }], n => n.id );

        global.selected = 'node0';

        update();

    }
