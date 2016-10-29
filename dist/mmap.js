/**
 * @name mmap
 * @version 0.0.1
 * @author Omar Desogus
 * @license GNU GENERAL PUBLIC LICENSE
 *
 */
(function( window, d3 ) {

    /**
     * @name mmp
     * @description
     * Dictionary that will contain all the properties of the
     * map shared by all functions within the module.
     *
     */
    const mmp = {};

    /**
     * @name init
     * @description
     * ...
     *
     * @param {string} selector The selector in which to draw
     * @param {Object} options Additional options for the graph
     */
    function init( selector, options ) {

        // Option settings
        if ( options ) {
            mmp.width = options.width || 2000;
            mmp.height = options.height || 2000;
        } else {
            mmp.width = 2000;
            mmp.height = 2000;
        }

        mmp.nodes = [];

        mmp.container = d3.select( selector ).style('overflow', 'auto');
        mmp.mmap = mmp.container.append('svg')
            .attr('width', mmp.width )
            .attr('height', mmp.height );

        centerSheet();

        createNode({
            x : mmp.width/2,
            y : mmp.width/2,
            fill : '#b9c7a5'
        });

    }

    /****** Utils functions  ******/

    function centerSheet() {
        mmp.container.node().scrollTop = 600;
        mmp.container.node().scrollLeft = 500;
    }

    /****** Public functions ******/

    function createNode( opt ) {

        mmp.nodes.push( mmp.mmap.append('ellipse')
            .attr('cx', opt.x )
            .attr('cy', opt.y )
            .attr('rx', 40 )
            .attr('ry', 20 )
            .attr('fill', opt.fill || '#b9c7a5')
        );

    }

    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        init : init,
        createNode : createNode,
    };

}(this, window.d3));
