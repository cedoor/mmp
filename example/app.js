
// Dom elements

const
nodeName = document.getElementById('node-name'),
fontSize = document.getElementById('font-size'),
fixedNode = document.getElementById('fixed-node'),
italicFont = document.getElementById('italic-font'),
boldFont = document.getElementById('bold-font'),
saveMap = document.getElementById('save-map'),
saveImg = document.getElementById('save-img'),
uploadMap = document.getElementById('upload-map'),
upload = document.getElementById('upload'),
backgroundColor = document.getElementsByClassName('color-btn')[0],
branchColor = document.getElementsByClassName('color-btn')[1],
textColor = document.getElementsByClassName('color-btn')[2];

// Button events

fontSize.oninput = function() {
    mmap.node.update('font-size', fontSize.value, true );
}

fontSize.onchange = function() {
    mmap.node.update('font-size', fontSize.value );
}

nodeName.oninput = function() {
    mmap.node.update('name', nodeName.value, true );
}

nodeName.onchange = function() {
    mmap.node.update('name', nodeName.value );
}

nodeName.onkeyup = function( e ) {
    if ( e.key === "Enter" ) {
        nodeName.blur();
        if( nodeName.value === '' )
            mmap.node.update('name', nodeName.value = 'Node');
    }
}

saveMap.onclick = function() {
    const data = mmap.data();
    const json = JSON.stringify( data );
    const blob = new Blob([ json ], { type: "application/json" });
    const a = document.createElement('a');
    a.download = "mymap.mmap";
    a.href = URL.createObjectURL( blob );
    a.click();
}

uploadMap.onclick = function() {
    upload.click();
}
upload.onchange = function( e ) {
    var reader = new FileReader();
    reader.readAsText( e.target.files[0] );
    reader.onload = function( e ) {
        var data = JSON.parse( event.target.result );
        mmap.load( data );
    };
}

saveImg.onclick = function() {
    mmap.image( function( url ) {
        const a = document.createElement('a');
        a.download = 'mmap';
        a.href = url;
        a.click();
    });
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
    italicFont.checked = value['italic'];
    boldFont.checked = value['bold'];
    fixedNode.checked = value.fixed;
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

mmap.init('#mmap',{
    'center-onresize' : true
});
