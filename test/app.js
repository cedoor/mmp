// Dom elements
var nodeName = document.getElementById('node-name'),
    fontSize = document.getElementById('font-size'),
    saveMap = document.getElementById('save-map'),
    saveImg = document.getElementById('save-img'),
    uploadMap = document.getElementById('upload-map'),
    backgroundColor = document.getElementById('background-color'),
    branchColor = document.getElementById('branch-color'),
    textColor = document.getElementById('text-color');

saveMap.onclick = function() {
    var data = mmap.data(),
        json = JSON.stringify( data ),
        blob = new Blob([ json ], { type: "application/json" }),
        a = document.createElement('a');
    a.download = "example.mmp";
    a.href = URL.createObjectURL( blob );
    a.click();
}

uploadMap.onchange = function( e ) {
    var reader = new FileReader();
    reader.readAsText( e.target.files[0] );
    reader.onload = function( e ) {
        var data = JSON.parse( event.target.result );
        mmap.data( data );
    };
}

saveImg.onclick = function() {
    mmap.image( function( url ) {
        var a = document.createElement('a');
        a.download = 'example';
        a.href = url;
        a.click();
    }, 'jpeg');
}

// mmap events

mmap.on('mmcreate', function(){
    console.log('Mindmap created!');
});

mmap.on('nodeselect',  function( key, value ) {
    nodeName.value = value['name'];
    fontSize.value = value['font-size'];
    backgroundColor.value = value['background-color'];
    branchColor.value = value['branch-color'] || '#ffffff';
    textColor.value = value['text-color'];
    console.log('The node \"'+ key +'\" has been selected');
});

mmap.on('nodedblclick', function( key, value ) {
    nodeName.focus();
});

mmap.on('nodeupdate', function( key, value, property ) {
    console.log('The node \"'+ key +'\" has updated its property \"'+ property + '\"');
});

mmap.on('nodecreate', function( key, value ) {
    console.log('The node \"'+ key +'\" has been created');
});

mmap.init();
