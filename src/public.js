    /****** Public functions ******/

    function createNode( opt ) {
        g.nodes.push({
            x : opt.x, y : opt.y,
            bgColor : opt.bgColor, textColor : opt.textColor,
            fontSize : opt.fontSize, text : opt.text
        });
        updateNodes();
    }
