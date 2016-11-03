    /**
     * @name g
     * @description
     * Global dictionary that will contain all the properties of the
     * map shared by all functions within the module.
     *
     */
    const g = {};

    /**
     * @name init
     * @description
     * ...
     *
     * @param {string} selector The selector in which to draw
     * @param {Object} opt Additional options for the map
     */
    function init( selector, opt ) {
        // Dom elements
        g.dom = {};
        // Properties of nodes
        g.nodes = {
            list : [],
            selected : 0,
            style : {
                bgColor : '#f0f0f0',
                textColor : '#787878',
                fontSize : 15,
                text : 'Node'
            }
        };
        // Option settings
        if ( opt ) {

        }

        const container = d3.select( selector ).style('overflow', 'hidden');

        const svg = container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .append('g').call( zoom );

        svg.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "transparent")
            .attr("pointer-events", "all");

        g.dom.mmap = svg.append('g');

        // Creation of the root node
        createNode({
            x : parseInt(container.style('width'))/2,
            y : parseInt(container.style('height'))/2,
            bgColor : '#868f78', textColor : '#e3e3e3',
            fontSize : 19, text : 'Map name'
        });
    }
