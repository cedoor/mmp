var
// Dom elements
nodeName = document.getElementById('node-name'),
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
    var data = mmap.data(),
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
        mmap.data( data );
    };
}

// Save the image of the map
saveImg.onclick = function() {
    mmap.image( function( url ) {
        var a = document.createElement('a');
        a.download = 'example';
        a.href = url;
        a.click();
    }, 'jpeg');
}

// Load a node image with local links
imageSrc.onclick = function() {
    var src = mmap.node.select().value['image-src'];
    if ( src === '' ) {
        var v = prompt("Please enter your name", "logo.png");
        mmap.node.update('image-src', 'img/' + v );
    } else mmap.node.update('image-src', '');
}

// mmap events

mmap.on('mmcreate', function() {
    console.clear();
    message('# Mind map created', 0, this );
});

mmap.on('mmcenter', function() {
    message('§ mmap.center()', 1 );
});

mmap.on('mmundo', function() {
    message('§ mmap.undo()', 1 );
});

mmap.on('mmrepeat', function() {
    message('§ mmap.repeat()', 1 );
});

mmap.on('nodeselect',  function( key, value ) {
    nodeName.value = value['name'];
    fontSize.value = value['font-size'];
    imageSize.value = value['image-size'];
    backgroundColor.value = value['background-color'];
    branchColor.value = value['branch-color'] || '#ffffff';
    textColor.value = value['text-color'];
    message('§ mmap.node.select( '+ key +' )', 1, this );
});

mmap.on('nodedblclick', function( key, value ) {
    nodeName.focus();
});

mmap.on('nodeupdate', function( key, value, property ) {
    message('§ mmap.node.update( '+ property +', '+ value[ property ] +' )', 1, this );
});

mmap.on('nodecreate', function( key, value ) {
    message('§ mmap.node.add()', 1, this );
});

mmap.on('noderemove', function( key, value ) {
    message('§ mmap.node.remove()', 1, key );
});
