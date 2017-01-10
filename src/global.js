// Global mind map parameters
export default {
    options : {
        'center-onresize' : false,
        'shortcuts' : true,
        'node' : {
            'name' : 'Node',
            'background-color' : '#f9f9f9',
            'text-color' : '#808080',
            'branch-color' : '#c2d7aa',
            'font-size' : 16,
            'italic' : false,
            'bold' : false,
            'fixed' : true
        },
        'root-node' : {
            'name' : 'Root node',
            'background-color' : '#ebf4eb',
            'text-color' : '#828c82',
            'font-size' : 20,
            'italic' : false,
            'bold' : false,
            'fixed' : false
        }
    },
    history : {
        index : -1,
        snapshots : []
    },
    svg : {},
    counter : 0
}
