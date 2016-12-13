# mmap
Small library to create mind maps

**Tested on the latest versions of Google Chrome**

## Install

You can install this package with bower :

    bower install mmap --save

Then add the mmap library with the dependencies to your `index.html` :

    <script src="/bower_components/d3/d3.min.js"></script>
    <script src="/bower_components/mmap/dist/mmap.min.js"></script>

## Usage

## Shortcuts

| Shortcut           | Related function                |
|--------------------|---------------------------------|
| ctrl + arrow key   | Moves the selected node         |
| arrow key          | Moves the node selection        |
| c                  | Centers the map                 |
| n                  | Creates a new map               |
| +                  | Creates a new branch ( starting from the selected node ) |
| -                  | Removes the selected branch     |
| enter              | Simulates a double click on the selected node ( useful to focus a possible input text field ) |
| esc                | Deselects the selected node ( selects the root node without stroke ) |

## File tree

    mmap
    |
    +--LICENSE.md
    +--README.md
    +--package.json
    +--bower.json
    +--gulpfile.js
    +--index.html
    |
    +--dist
    |  +--mmap.js
    |  +--mmap.min.js
    |
    +--src
    |  +--start.js
    |  +--init.js
    |  +--public.js
    |  +--shapes.js
    |  +--shortcuts.js
    |  +--update.js
    |  +--utils.js
    |  +--end.js
    |
    +--test
    |  +--img
    |  +--index.html
    |  +--test.css
    |
    +--server.js

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
