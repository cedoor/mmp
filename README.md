<h1>
    <img src="https://raw.githubusercontent.com/Mindmapp/mindmapp/master/src/assets/icon/png/32x32.png">
    Mmp<sup>beta</sup>
</h1>

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

You can also load it using a <script> using the unpkg CDN:
    
    <div id="map"></div>
    
    <script src="https://unpkg.com/d3/build/d3.min.js"></script>
    <script src="https://unpkg.com/mmp/build/mmp.min.js"></script>
    <script>
        let myMap = mmp.create("map");
    </script>
    
## API Reference

The library uses an OOP paradigm and allows you to create multiple instances.

<a name="mmp_create" href="#mmp_create">#</a> <i>mmp</i>.<b>create</b>(<i>id</i>, [<i>options</i>])

Creates a mmp instance. Draw the mind map creating an svg element with the root node within the div element with id equal to the id string passed as parameter. You can optionally pass various options as the following example:

    var map = mmp.create("map", {
        fontFamily: "Arial, Helvetica, sans-serif",
        centerOnResize: true,
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

<a name="mmp_version" href="#mmp_version">#</a> <i>mmp</i>.<b>version</b>

Contains the version of the current used mmp library.

<a name="map_remove" href="#map_remove">#</a> <i>map</i>.<b>remove</b>()

Removes the map instance and the svg element of the mind map. 

<a name="map_new" href="#map_new">#</a> <i>map</i>.<b>new</b>([<i>map</i>])

Creates a new empty mind map or an existance map passed as parameter. The <i>map</i> parameter must be a JSON-like object, [here](https://gist.github.com/cedoor/9f884ab0d7ad0550aa8edbc3326d6d05) an example.

<a name="map_zoomIn" href="#map_zoomIn">#</a> <i>map</i>.<b>zoomIn</b>([<i>duration</i>])

Zooms in the mind map. If <i>duration</i> is specified, sets the duration of the zoom animation.

<a name="map_zoomOut" href="#map_zoomOut">#</a> <i>map</i>.<b>zoomOut</b>([<i>duration</i>])

Zooms out the mind map. If <i>duration</i> is specified, sets the duration of the zoom animation.

<a name="map_updateOptions" href="#map_updateOptions">#</a> <i>map</i>.<b>updateOptions</b>(<i>property</i>, <i>value</i>)

Updates the option property (fontFamily, centerOnResize, drag, zoom, defaultNode or rootNode) with the relative value passed as parameter.

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

## Contact
#### Developer
* e-mail : omardesogus9@gmail.com
* github : [@cedoor](https://github.com/cedoor)
* website : https://cedoor.github.io
