# Mmap

Mmap is a javaScript UMD module and a logic engine to create mind maps applications, allowing a separation between business logic and view. Mmap is easily editable and customizable, it is written using the latest features of es2015 syntax and the famous D3.js library. All its functions are documented with JSDoc markup language and tested with mocha and chai.

![mmap.js](https://github.com/cedoor/mmap/blob/master/test/img/logo.png)

**# For the moment only tested on the latest versions of Google Chrome**

## Installing

You can install this package with npm :

    npm install mmap --save

Then add the mmap library with d3.js to your `index.html` :
    
    <div id="mmap"></div>
    
    <script src="node_modules/d3/build/d3.min.js"></script>
    <script src="node_modules/mmap/build/mmap.min.js"></script>
    <script>
        mmap.init('mmap');
    </script>

## API Reference

### Map

\# mmap.**init**( id, *options* )

Initializes the mind map, creating the svg element and the root node. 
You can pass various options as the following example:
    
    mmap.init('mmap', {
        'center-onresize': true,
        'drag': false,
        'zoom': false,
        'node': {'name': 'Default name'},
        'root-node': {'background-color': '#E4DDC7'}
    });

\# mmap.**remove**()

Removes the svg element of the mind map and resets all default values. 

\# mmap.**new**()

Resets the mind map. Removes old mind map and creates a new. 

\# mmap.**zoomIn**()

Zooms in the mind map.

\# mmap.**zoomOut**()

Zooms out the mind map.

\# mmap.**center**()

Centers the mind map. Moves the root node at the center of the svg element.  

\# mmap.**undo**()

Undo the last change. Loads the previous snapshot of the mind map if it exists.

\# mmap.**repeat**()

Repeats the last change. Loads the next snapshot of the mind map if it exists.

\# mmap.**data**( *snapshot* )

Without parameter returns the data of the last snapshot of the mind map. If you pass the parameter with the data 
of an old snapshot of the mind map, these data will be loades creating a new snapshot.

\# mmap.**image**( callback, *type, background* )

Returns the data URL of the mind map image in the parameter of the callback. 

### Nodes

\# mmap.node.**add**( *options* )

Adds a new node in the mind map. 

\# mmap.node.**remove**()

Removes the current selected node in the mind map.

\# mmap.node.**select**( *key* )

Without parameter returns the key and the value of the current selected node. 
With a node key as parameter selects the node with that key. 

\# mmap.node.**moveTo**( direction, *range* )

Moves the current selected node in the specified direction.

\# mmap.node.**selectTo**( direction )

Moves the current selection in the specified direction.

\# mmap.node.**update**( property, value, *visual* )

Updates a property of the current selected node with a new value. 
If you pass `true` as third parameter the change will only visual.

### Events

\# mmap.**on**( event, callback )

Executes a callback when an event is detected.

| Events        |
|---------------|
| mmcreate      |
| mmcenter      |
| mmundo        |
| mmrepeat      |
| nodedblclick  |
| nodeselect    |
| nodeupdate    |
| nodecreate    |
| noderemove    |

### Shortcuts

| Shortcut              | Attached function               |
|-----------------------|---------------------------------|
| ctrl + shift + z      | `mmap.repeat()`                 |
| ctrl + z              | `mmap.undo()`                   |
| alt + c               | `mmap.center()`                 |
| alt + n               | `mmap.new()`                    |
| alt + shift + +       | `mmap.zoomIn()`                 |
| alt + shift + -       | `mmap.zoomOut()`                |
| alt +                 | `mmap.add()`                    |
| alt -                 | `mmap.remove()`                 |
| alt + shift + up      | `mmap.moveTo('up')`             |
| alt + shift + down    | `mmap.moveTo('down')`           |
| alt + shift + left    | `mmap.moveTo('left')`           |
| alt + shift + right   | `mmap.moveTo('right')`          |
| alt + up              | `mmap.selectionTo('up')`        |
| alt + down            | `mmap.selectionTo('down')`      |
| alt + left            | `mmap.selectionTo('left')`      |
| alt + right           | `mmap.selectionTo('right')`     |

## File tree
##### After `npm start`

    mmap
    |
    +--build
    |  +--mmap.js
    |  +--mmap.min.js
    |
    +--node_modules
    |
    +--src
    |  +--*.js
    |
    +--test
    |  +--img
    |  +--index.html
    |  +--app.js
    |  +--test.js
    |  +--layout.css
    |
    +--LICENSE.md
    +--README.md
    +--package.json
    +--rollup.config.js

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

and `body` must be should include the motivation for the change and contrast this with previous behavior (do not add body if the commit is trivial). 

* Use the imperative, present tense: "change" not "changed" nor "changes".
* Don't capitalize first letter.
* No dot (.) at the end.

### # branches

* There is a master branch, used only for release.
* There is a dev branch, used to marge all sub dev branch.
* Avoid long descriptive names for long-lived branches.
* No CamelCase.
* Use grouping tokens (words) at the beginning of your branch names (in a similar way to the `type` of commit).
* Define and use short lead tokens to differentiate branches in a way that is meaningful to your workflow.
* Use slashes to separate parts of your branch names.
* Remove branch after marge if it is not important.

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
* See [LICENSE](https://github.com/cedoor/mmap/blob/master/LICENSE.md) file

## Contact
#### Developer
* e-mail : omardesogus9@gmail.com
* github : [@cedoor](https://github.com/cedoor)
* website : http://omardesogus.com
