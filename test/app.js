var
// Dom elements
fontSize = document.getElementById('font-size'),
imageSize = document.getElementById('image-size'),
imageSrc = document.getElementById('image-src'),
saveMap = document.getElementById('save-map'),
saveImg = document.getElementById('save-img'),
uploadMap = document.getElementById('upload-map'),
backgroundColor = document.getElementById('background-color'),
branchColor = document.getElementById('branch-color'),
textColor = document.getElementById('text-color'),
// js console styles
message = function( msg, style, arg ) {
    var styles = [
        'color: #406536; font-weight: bold; font-size: 14px',
        'color: #2f5226; font-size: 14px',
    ];
    if ( arg ) console.log( '%c' + msg, styles[style], arg )
    else console.log( '%c' + msg, styles[style] )
};

// Save the map as json file
saveMap.onclick = function() {
    var data = mmp.data(),
        json = JSON.stringify( data ),
        blob = new Blob([ json ], { type: "application/json" }),
        a = document.createElement('a');
    a.download = "example.json";
    a.href = URL.createObjectURL( blob );
    a.click();
}

// Load a map from external json file
uploadMap.onchange = function( e ) {
    var reader = new FileReader();
    reader.readAsText( e.target.files[0] );
    reader.onload = function( e ) {
        var data = JSON.parse( event.target.result );
        mmp.data( data );
    };
}

// Save the image of the map
saveImg.onclick = function() {
    mmp.image( function( url ) {
        var a = document.createElement('a');
        a.download = 'example';
        a.href = url;
        a.click();
    }, 'jpeg');
}

// Load a node image with local links
imageSrc.onclick = function() {
    var src = mmp.node.select().value['image-src'];
    if ( src === '' ) {
        var v = prompt("Please enter your name", "logo.png");
        mmp.node.update('image-src', 'img/' + v );
    } else mmp.node.update('image-src', '');
}

// mmp events

mmp.on('mmcreate', function() {
    message('\n§ Mind map created', 0, this );
});

mmp.on('mmcenter', function() {
    message('§ mmp.center()', 1 );
});

mmp.on('mmundo', function() {
    message('§ mmp.undo()', 1 );
});

mmp.on('mmrepeat', function() {
    message('§ mmp.repeat()', 1 );
});

mmp.on('nodeselect',  function( key, value ) {
    fontSize.value = value['font-size'];
    imageSize.value = value['image-size'];
    backgroundColor.value = value['background-color'];
    branchColor.value = value['branch-color'] || '#ffffff';
    textColor.value = value['text-color'];
    message('§ mmp.node.select( '+ key +' )', 1, this );
});

mmp.on('nodeupdate', function( key, value, property ) {
    var newValue = property === 'position' ?  value.x + ", " + value.y : value[ property ];
    message('§ mmp.node.update( '+ property +', '+ newValue +' )', 1, this );
});

mmp.on('nodecreate', function( key, value ) {
    message('§ mmp.node.add()', 1, this );
});

mmp.on('noderemove', function( key, value ) {
    message('§ mmp.node.remove()', 1, key );
});
