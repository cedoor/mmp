    /**
     * @name global
     * @description
     * Global dictionary that will contain all the properties of the
     * map shared by all functions within the module.
     */
    const global = {};

    /**
     * @name init
     * @description
     *
     */
    function init( selector, options ) {

        // Default options
        global.options = {
            'center-onresize' : false,
            'shortcuts' : true,
            'node' : {
                'name' : 'Node',
                'background-color' : '#f9f9f9',
                'text-color' : '#808080',
                'branch-color' : '#9fad9c',
                'font-size' : 16,
                'italic' : false,
                'bold' : false,
                'fixed' : true
            },
            'root-node' : {
                'name' : 'Root node',
                'background-color' : '#e6ede6',
                'text-color' : '#828c82',
                'font-size' : 20,
                'italic' : false,
                'bold' : false,
                'fixed' : false
            }
        };

        global.container = d3.select( selector );
        global.history = { index : -1, snapshots : [] };
        global.svg = {};

        global.svg.main = global.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .call( zoom );

        global.svg.main.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "white")
            .attr("pointer-events", "all")
            .on('click', clean );

        global.svg.mmap = global.svg.main.append('g');
        global.nodes = d3.map();
        global.counter = 0;

        // If opt is correct update the default options
        if ( options !== undefined )
            options.constructor === Object
                ? overwriteProperties( global.options, options )
                : error('mmap options invalid');

        if ( global.options['center-onresize'] === true ) onresize = center;
        if ( global.options['shortcuts'] === true ) setShortcuts();

        events.call('mmcreate');

        createRootNode();
    }
