// Global mind map parameters
export default class Global {

    static options = {
        "font-family": "Arial, Helvetica, sans-serif",
        "center-onresize": true,
        "drag": true,
        "zoom": true,
        // Default node properties
        "node": {
            // Variable values
            "name": "Node",
            "background-color": "#f9f9f9",
            "text-color": "#808080",
            "branch-color": "#c2d7aa",
            "image-src": "",
            "image-size": 60,
            "font-size": 16,
            "italic": false,
            "bold": false,
            "fixed": true,
            // Common constant values
            "padding": [30, 45]
        },
        // Default root node properties
        "root-node": {
            "name": "Root node",
            "background-color": "#f0f6f5",
            "text-color": "#828c82",
            "image-src": "",
            "image-size": 70,
            "font-size": 20,
            "italic": false,
            "bold": false,
            "fixed": false
        }
    };

    static nodes: any;

    static history: any;

    static svg: any;

    static container: any;

    static counter: number;

    static backup: any;

    static selected: any;

    static dragged: boolean;

}
