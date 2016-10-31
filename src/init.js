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

        // Option settings
        if ( opt ) {} else {}

        g.width = 900;
        g.height = 600;

        g.nodes = [{
            x : g.width/2, y : g.height/2,
            bgColor : '#868f78', textColor : '#e3e3e3',
            fontSize : 19, text : 'Map name'
        }];

        g.dom = {};

        const svg = d3.select( selector ).append('svg')
            .attr('width', g.width )
            .attr('height', g.height )
            .append('g').call( zoom );

        svg.append("rect")
            .attr("width", g.width)
            .attr("height", g.height)
            .attr("fill", "#ececec")
            .attr("pointer-events", "all");

        g.dom.mmap = svg.append('g');
    }
