// Global mind map parameters
export default {
    options: {
        'center-onresize': true,
        'drag': true,
        'zoom': true,
        // Mind map shortcuts
        'shortcuts': {
            'repeat': [ 17, 16, 90 ], // ctrl shift z
            'undo': [ 17, 90 ], // ctrl z
            'center': [ 18, 67 ], // alt c
            'new': [ 18, 78 ], // alt n
            'zoom-in': [ 18, 16, 187 ], // alt shift +
            'zoom-out': [ 18, 16, 189 ], // alt shift -
            'add-node': [ 18, 187 ], // alt +
            'remove-node': [ 18, 189 ], // alt -
            'move-node-up': [ 18, 16, 38 ], // alt shift up
            'move-node-down': [ 18, 16, 40 ], // alt shift down
            'move-node-left': [ 18, 16, 37 ], // alt shift left
            'move-node-right': [ 18, 16, 39 ], // alt shift right
            'move-selection-up': [ 18, 38 ], // alt up
            'move-selection-down': [ 18, 40 ], // alt down
            'move-selection-left': [ 18, 37 ], // alt left
            'move-selection-right': [ 18, 39 ] // alt right
        },
        // Default node properties
        'node': {
            'name': 'Node',
            'background-color': '#f9f9f9',
            'text-color': '#808080',
            'branch-color': '#c2d7aa',
            'image': '',
            'font-size': 16,
            'italic': false,
            'bold': false,
            'fixed': true
        },
        // Default root node properties
        'root-node': {
            'name': 'Root node',
            'background-color': '#f0f6f5',
            'text-color': '#828c82',
            'image': '',
            'font-size': 20,
            'italic': false,
            'bold': false,
            'fixed': false
        }
    },
    history : {},
    svg : {}
}
