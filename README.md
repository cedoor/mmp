# ![](https://raw.githubusercontent.com/Mindmapp/mindmapp/master/resources/icons/32x32.png) Mmp<sup>beta</sup>

[![](https://img.shields.io/badge/project-Mindmapp-blue.svg?style=flat-square)](https://github.com/Mindmapp)
[![](https://img.shields.io/github/license/mindmapp/mmp.svg?style=flat-square)](https://github.com/Mindmapp/mmp/blob/dev/LICENSE)
[![](https://img.shields.io/david/mindmapp/mmp.svg?style=flat-square)](https://david-dm.org/mindmapp/mmp)
[![](https://img.shields.io/david/dev/mindmapp/mmp.svg?style=flat-square)](https://david-dm.org/mindmapp/mmp?type=dev)
[![](https://img.shields.io/npm/dt/mmp.svg)](https://www.npmjs.com/package/mmp)
[![](https://img.shields.io/readthedocs/mmp.svg)](http://mmp.readthedocs.io/en/latest/)

Mmp was born with the intention to make the creation of maps extremely simple, while maintaining the fundamental properties that make the mind maps so efficient:

* Colors :rainbow:
* Images :mount_fuji:
* Neural branches :arrow_heading_up:
* Hierarchical structure :family:
* Radial geometry :palm_tree:

Mmp is a light JavaScript library (which uses the UMD pattern) with which it is possible to create mind map applications. 
It is highly customizable, easy to use and it is written using TypeScript and the famous D3.js library. All its functions are documented with JSDoc markup language and tested with mocha and chai.

## Installing

### npm

You can install mmp package with npm:

    npm install mmp --save

Then add the mmp library with d3.js to your `index.html`:
    
    <div id="map"></div>
    
    <script src="node_modules/d3/build/d3.min.js"></script>
    <script src="node_modules/mmp/build/mmp.min.js"></script>
    <script>
        let myMap = mmp.create("map");
    </script>
    
### CDN

You can also load it using a \<script> using the unpkg CDN:
    
    <div id="map"></div>
    
    <script src="https://unpkg.com/d3/build/d3.min.js"></script>
    <script src="https://unpkg.com/mmp/build/mmp.min.js"></script>
    <script>
        let myMap = mmp.create("map");
    </script>
    
## API Reference

The library uses an OOP paradigm and allows you to create multiple instances.

<a name="mmp_create" href="#mmp_create">#</a> *mmp*.**create**(*id*, [*options*])

Creates a mmp instance. Draw the mind map creating an svg element with the root node within the div element with id equal to the id string passed as parameter. You can optionally pass various options as the following example:

    var map = mmp.create("map", {
        fontFamily: "Arial, Helvetica, sans-serif",
        centerOnResize: true,
        addNodeOnRightClick: true
        drag: false,
        zoom: false,
        defaultNode: {
            name: "Default node name",
            image: {
                src: "",
                size: 60
            },
            colors: {
                name: "#787878",
                background: "#f9f9f9",
                branch: "#577a96"
            },
            font: {
                size: 16,
                style: "normal",
                weight: "normal"
            },
            locked: true
        },
        rootNode: {
            name: "Default root node name",
            image: {
                src: "",
                size: 70
            },
            colors: {
                name: "#787878",
                background: "#f0f6f5",
                branch: ""
            },
            font: {
                size: 20,
                style: "normal",
                weight: "normal"
            }
        }
    });
    
You can change these options later using the function [map.updateOptions](#map_updateOptions).

<a name="mmp_version" href="#mmp_version">#</a> *mmp*.**version**

Contains the version of the current used mmp library.

<a name="map_remove" href="#map_remove">#</a> *map*.**remove**()

Removes the map instance and the svg element of the mind map. 

<a name="map_new" href="#map_new">#</a> *map*.**new**([*map*])

Creates a new empty mind map. If *map* is specified, creates a new mind map using mmp json structure. The *map* parameter must be a JSON-like object, [here](https://gist.github.com/cedoor/9f884ab0d7ad0550aa8edbc3326d6d05) an example. The function [map.exportAsJson](#map_exportAsJson) is available to obtain the json of a map.

<a name="map_zoomIn" href="#map_zoomIn">#</a> *map*.**zoomIn**([*duration*])

Zooms in the mind map. If *duration* (int, milliseconds) is specified, sets the duration of the zoom animation.

<a name="map_zoomOut" href="#map_zoomOut">#</a> *map*.**zoomOut**([*duration*])

Zooms out the mind map. If *duration* (int, milliseconds) is specified, sets the duration of the zoom animation.

<a name="map_updateOptions" href="#map_updateOptions">#</a> *map*.**updateOptions**(*property*, *value*)

Updates the option *property* (string, "fontFamily", "centerOnResize", "addNodeOnRightClick", "drag", "zoom", "defaultNode", "rootNode") with the relative value passed as parameter.

<a name="map_exportAsJson" href="#map_exportAsJson">#</a> *map*.**exportAsJson**()

Returns a json with the structure of the current mind map.

<a name="map_exportAsImage" href="#map_exportAsImage">#</a> *map*.**exportAsImage**(*callback*, [*type*])

Calls the callback passing the URI of the map image as parameter. The *type* (string) optional parameter is the standard MIME type for the image format to return. If you do not specify this parameter, the default value is a PNG format image.

<a name="map_undo" href="#map_undo">#</a> *map*.**undo**()

Allows to reverse the last one change.

<a name="map_redo" href="#map_redo">#</a> *map*.**redo**()

Repeats a previously undoed change.

<a name="map_history" href="#map_history">#</a> *map*.**history**()

Return all snapshots of the map.

<a name="map_center" href="#map_center">#</a> *map*.**center**([*type*], [*duration*])

Places the root node in the middle of the map and sets the zoom to the original state. If *type* (string, "position" or "zoom") is specified, updates only the location or updates only the zoom. If *duration* (int, milliseconds) is specified, sets the duration of the center animation.

<a name="map_on" href="#map_on">#</a> *map*.**on**(*event*, *callback*)

Calls the callback of the related event passing some parameters.

| Events         | Callback parameters |
| -------------- | ------------------- |
| create         | (nothing)           |
| center         | (nothing)           |
| undo           | (nothing)           |
| redo           | (nothing)           |
| exportJSON     | (nothing)           |
| exportImage    | (nothing)           |
| zoomIn         | (nothing)           |
| zoomOut        | (nothing)           |
| nodeSelect     | (node*)             |
| nodeDeselect   | (nothing)           |
| nodeUpdate     | (node*)             |
| nodeCreate     | (node*)             |
| nodeRemove     | (node*)             |

\*node properties:

    {
        id: string;
        parent: string;
        k: number;
        name: string;
        coordinates: {
            x: number;
            y: number;
        };
        image: {
            src: string;
            size: number;
        };
        colors: {
            name: string;
            background: string;
            branch: string
        };
        font: {
            size: number;
            style: string;
            weight: string
        };
        locked: boolean;
    }

<a name="map_addNode" href="#map_addNode">#</a> *map*.**addNode**([*properties*], [*id*])

Adds a node in the map. The added node will be the child of the current selected node. If *properties* is specified, adds the node with those node properties. If *id* is not specified, adds the node as child of the selected node.

Properties:

    {
        name: string;
        coordinates: {
            x: number;
            y: number;
        };
        image: {
            src: string;
            size: number;
        };
        colors: {
            name: string;
            background: string;
            branch: string
        };
        font: {
            size: number;
            style: string;
            weight: string
        };
        locked: boolean;
    }

<a name="map_selectNode" href="#map_selectNode">#</a> *map*.**selectNode**([*id*])

Selects the node with the *id* (string) passed as parameter or the position ("left", "right", "down", "up"). If the id is not specified returns the current selected node.

<a name="map_editNode" href="#map_editNode">#</a> *map*.**editNode**()

Focus on the text of the selected node.

<a name="map_deselectNode" href="#map_deselectNode">#</a> *map*.**deselectNode**()

Deselects the selected node. The deselection is the same as selecting the root node without highlighting.

<a name="map_updateNode" href="#map_updateNode">#</a> *map*.**updateNode**(*property*, *value*, [*graphic*], [*id*])

Updates the node *property* (string, "name", "locked", "coordinates", "imageSrc", "imageSize", "backgroundColor", "branchColor", "fontWeight", "fontStyle", "fontSize", "nameColor") with the relative value passed as parameter. If *graphic* (boolean) is specified and is true, update only graphically the node. If *id* is not specified, update the selected node.

<a name="map_removeNode" href="#map_removeNode">#</a> *map*.**removeNode**([*id*])

Removes the selected node or if *id* (string) is specified, removes the node with the id passed as parameter.

<a name="map_copyNode" href="#map_copyNode">#</a> *map*.**copyNode**([*id*])

Copies a node with his children in the mmp clipboard. If *id* is not specified, copies the selected node.

<a name="map_cutNode" href="#map_cutNode">#</a> *map*.**cutNode**([*id*])

Removes and copy a node with his children in the mmp clipboard. If *id* is not specified, copies the selected node.

<a name="map_pasteNode" href="#map_pasteNode">#</a> *map*.**pasteNode**([*id*])

Paste the node of the mmp clipboard in the map. If *id* is not specified, paste the nodes of the mmp clipboard in the selected node.

<a name="map_nodeChildren" href="#map_nodeChildren">#</a> *map*.**nodeChildren**([*id*])

Return the children of the node specified with id. If *id* is not specified, return the children of the selected node.


## File tree
##### After `npm start`

    mmp
    |
    +--build
    |  +--mmp.js
    |  +--mmp.min.js
    |
    +--docs
    |
    +--example
    |  +--img
    |  +--app.js
    |  +--layout.css
    |  +--test.js
    |
    +--node_modules
    |
    +--src
    |  +--map
    |  +--utils
    |  +--index.ts
    |  +--typings.ts
    |
    +--index.html
    |
    +--LICENSE
    +--README.md
    +--package.json
    +--rollup.config.js
    +--tsconfig.json

## Compatibility

| Browser        | Version       |
| -------------- | ------------- |
| Chromium       | 64.0.3282.140 |
| Chrome         | 64.0.3282.167 |
| Firefox        | 58.0.2        |
| Opera          | 51.0.2830.34  |

## Development

For a faster and more efficient development, some rules are used in the commits, in the branches and in the ECMAScript 2015 syntax.

### # commits

* Use this commit message format (angular style):  

    `[<type>]: <subject>`
    `<BLANK LINE>`
    `<body>`

    where `type` must be one of the following:

    - feat: A new feature
    - fix: A bug fix
    - docs: Documentation only changes
    - style: Changes that do not affect the meaning of the code
    - refactor: A code change that neither fixes a bug nor adds a feature
    - test: Adding missing or correcting existing tests
    - chore: Changes to the build process or auxiliary tools and libraries such as documentation generation
    - update: Update of the library version or of the dependencies

and `body` must be should include the motivation for the change and contrast this with previous behavior (do not add body if the commit is trivial). 

* Use the imperative, present tense: "change" not "changed" nor "changes".
* Don't capitalize first letter.
* No dot (.) at the end.

### # branches

* There is a master branch, used only for release.
* There is a dev branch, used to merge all sub dev branch.
* Avoid long descriptive names for long-lived branches.
* No CamelCase.
* Use grouping tokens (words) at the beginning of your branch names (in a similar way to the `type` of commit).
* Define and use short lead tokens to differentiate branches in a way that is meaningful to your workflow.
* Use slashes to separate parts of your branch names.
* Remove branch after merge if it is not important.

Examples:
    
    git branch -b doc/README
    git branch -b test/one-function
    git branch -b feat/side-bar
    git branch -b style/header

### # es2015

* Use `let` and `const`, not `var`.
* Use Arrow Functions in place of function expressions when possible.
* Use Arrow Functions whenever you need to preserve the lexical value of this.

## Third-party libs

| Library           | Authors or maintainers               | License    | Link |
|-------------------|:------------------------------------:|:----------:|:----:|
| D3 | Mike Bostock | [BSD-3-Clause](https://github.com/d3/d3/blob/master/LICENSE) | https://d3js.org/ |

## License
* See [LICENSE](https://github.com/cedoor/mmp/blob/master/LICENSE) file

## Contacts
#### Developer
* e-mail : omardesogus9@gmail.com
* github : [@cedoor](https://github.com/cedoor)
* website : https://cedoor.github.io
