/**
 * @name mmap
 * @version 0.0.1
 * @author Omar Desogus
 * @license GNU GENERAL PUBLIC LICENSE
 *
 */
(function( window, d3 ) {

    /**
     * @name global
     * @description
     * Global dictionary that will contain all the properties of the
     * map shared by all functions within the module.
     *
     */
    const global = {};

    /**
     * @name init
     * @description
     * ...
     *
     * @param {string} selector The selector in which to draw
     */
    function init( selector ) {

        global.container = d3.select( selector );
        global.svg = {};

        global.svg.main = global.container.append('svg')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('id', 'mmap')
            .append('g').call( zoom );

        global.svg.main.append("rect")
            .attr("width", '100%')
            .attr("height", '100%')
            .attr("fill", "white")
            .attr("pointer-events", "all")
            .on('click', deselectNode );

        global.svg.mmap = global.svg.main.append('g');
        global.nodes = d3.map();
        global.counter = 0;

        global.nodes.set('node' + global.counter, {
            name : 'Root node',
            x : parseInt( global.container.style('width') )/2,
            y : parseInt( global.container.style('height') )/2,
            'background-color' : '#e6ede6',
            'text-color' : '#828c82', 'font-size' : 20,
            'font-style' : 'normal', 'font-weight' : 'normal'
        });

        update();
        deselectNode();

        window.onresize = center;
        events.call('mmcreate');
    }

    /****** Util functions  ******/

    const zoom = d3.zoom().scaleExtent([0.5, 2]).on('zoom', zoomed );

    const drag = d3.drag().on('drag', dragged ).on('start', function( n ) {
        selectNode( n.key );
    });

    function zoomed() {
        global.svg.mmap.attr('transform', d3.event.transform );
    }

    function dragged( n ) {
        const x = n.x = d3.event.x;
        const y = n.y = d3.event.y;
        d3.select(this).attr('transform','translate('+ x +','+ y +')');
        d3.selectAll('.branch').attr('d', drawBranch );
    }

    function selectNode( key ) {
        if( global.selected !== key || global.selected === 'node0' ) {
            d3.selectAll('.node > path').style('stroke', 'none');
            global.selected = key;
            const node = d3.select('#'+ key );
            const bg = node.select('path');
            bg.style('stroke', d3.color( bg.style('fill') ).darker( .5 ) );
            events.call('nodeselect', node.node(), global.nodes.get( key ));
        }
    }

    function deselectNode() {
        selectNode('node0');
        d3.select('#node0 > path').style('stroke', 'none');
    }

    function getNodeLevel( n ) {
        var p = n.parent, level = 0;
        while ( p ) {
            level++;
            p = p.parent;
        }
        return level < 5 ? level : 5;
    }

    function getNodesWithKeys() {
        const nodesWithKeys = [];
        global.nodes.each( function( n, k ) {
            n.key = k;
            nodesWithKeys.push( n );
        });
        return nodesWithKeys;
    }

    /****** Update functions  ******/

    function redraw() {
        d3.selectAll('.node, .branch').remove();
        update();
    }

    function update() {

        const nodes = getNodesWithKeys();

        const node = global.svg.mmap.selectAll('.node').data( nodes );

        const nodeContainer = node.enter().append('g')
            .attr('class', 'node')
            .attr('id', n => n.key )
            .attr('transform', n => 'translate(' + n.x + ',' + n.y + ')')
            .call( drag )
            .on('dblclick', function( n ) {
                events.call('nodedblclick', this, n);
                d3.event.stopPropagation();
            });

        nodeContainer.append('text').text( n => n.name )
            .attr('fill', n => n['text-color'])
            .attr('font-size', n => n['font-size'])
            .attr('font-style', n => n['font-style'])
            .attr('font-weight', n => n['font-weight']);

        nodeContainer.insert('path', 'text')
            .style('fill', n => n['background-color'])
            .attr('d', drawBgShape );

        node.exit().remove();

        const branch = global.svg.mmap.selectAll('.branch').data( nodes.slice(1) );

        branch.enter().insert('path', 'g')
            .attr('class', 'branch')
            .attr('id', n => 'branchOf' + n.key )
            .style('fill', n => n['branch-color'])
            .style('stroke', n => n['branch-color'])
            .attr('d', drawBranch );

        branch.exit().remove();
    }

    function updateName( sel, v ) {
        const text = this.childNodes[1];
        const bg = this.childNodes[0];
        sel.name = text.innerHTML = v;
        sel.width = text.textLength.baseVal.value + 45;
        d3.select( bg ).attr('d', drawBgShape );
    }

    function updateBackgroundColor( sel, v ) {
        const bg = this.childNodes[0];
        bg.style.setProperty('fill', sel['background-color'] = v );
        bg.style.setProperty('stroke', d3.color( v ).darker( .5 ) );
    }

    function updateTextColor( sel, v ) {
        const text = this.childNodes[1];
        text.style.setProperty('fill', sel['text-color'] = v );
    }

    function updateFontSize( sel, v ) {
        const text = this.childNodes[1];
        const bg = this.childNodes[0];
        text.style.setProperty('font-size', sel['font-size'] = v );
        sel.width = text.textLength.baseVal.value + 45;
        sel.height = sel['font-size']*11/10 + 30;
        d3.select( bg ).attr('d', drawBgShape );
        d3.selectAll('.branch').attr('d', drawBranch );
    }

    function updateFontStyle( sel ) {
        const text = this.childNodes[1];
        sel['font-style'] = sel['font-style'] === 'normal' ? 'italic' : 'normal';
        text.style.setProperty('font-style', sel['font-style'] );
    }

    function updateFontWeight( sel ) {
        const text = this.childNodes[1];
        sel['font-weight'] = sel['font-weight'] === 'normal' ? 'bold' : 'normal';
        text.style.setProperty('font-weight', sel['font-weight'] );
    }

    function updateBranchColor( sel, v ) {
        if( sel.key !== 'node0' ) {
            const branch = document.getElementById('branchOf'+ sel.key );
            branch.style.setProperty('fill', sel['branch-color'] = v );
            branch.style.setProperty('stroke', sel['branch-color'] = v );
        } else {
            console.warn('The root node has no branches');
        }
    }

    /****** Shape functions  ******/

    function drawBranch( n ) {

        const width = 22 - getNodeLevel( n ) * 3;
        const middleX = ( n.parent.x + n.x ) / 2;
        const orY = n.parent.y < n.y + n.height/2 ? -1 : 1;
        const orX = n.parent.x > n.x ? -1 : 1;
        const inv = orX*orY;

        const path = d3.path();
        path.moveTo( n.parent.x, n.parent.y - width*.8 );
        path.bezierCurveTo(
            middleX - width*inv, n.parent.y - width/2,
            n.parent.x - width/2*inv, n.y + n.height/2 - width/3,
            n.x - n.width/3*orX, n.y + n.height/2 + 3
        );
        path.bezierCurveTo(
            n.parent.x + width/2*inv, n.y + n.height/2 + width/3,
            middleX + width*inv, n.parent.y + width/2,
            n.parent.x, n.parent.y + width*.8
        );
        path.closePath();

        return path;
    }

    function drawBgShape( n ) {

        const path = d3.path();
        const x = ( n.width = this.nextSibling.getBBox().width + 45 )/2;
        const y = ( n.height = n['font-size']*11/10 + 30 )/2;
        const k = n.k = n.k || d3.randomUniform( -20, 20 )();

        path.moveTo( -x, k/3 );
        path.bezierCurveTo( -x, -y +10, -x + 10, -y, k, -y );
        path.bezierCurveTo( x - 10, -y, x, -y + 10, x, k/3 );
        path.bezierCurveTo( x, y - 10, x - 10, y, k, y );
        path.bezierCurveTo( -x + 10, y, -x, y - 10, -x, k/3 );
        path.closePath();

        return path;
    }

    /****** Public functions ******/

    const events = d3.dispatch(
        'mmcreate', 'mmcenter',
        'nodeselect', 'nodecreate', 'noderemove', 'nodedblclick'
    );

    function addNode( prop ) {
        if( global.selected ) {
            const sel = global.nodes.get( global.selected );
            const root = global.nodes.get('node0');

            const key = 'node' + ( ++global.counter );
            const value = {
                name : prop && prop.name || 'Node',
                'background-color' : prop && prop['background-color'] || '#f1f1f1',
                'text-color' : prop && prop['text-color'] || '#808080',
                'branch-color' : prop && prop['branch-color'] || '#9fad9c',
                'font-size' : prop && prop['font-size'] || 16,
                'font-style' : prop && prop['font-style'] || 'normal',
                'font-weight' : prop && prop['font-weight'] || 'normal',
                x : sel.x + ( sel.x > root.x ? 200 : -200 ),
                y : sel.y + 50,
                parent : sel
            };

            global.nodes.set( key, value );
            update();
            events.call('nodecreate');
        }
    }

    function removeNode() {
        if( global.selected !== 'node0' ) {
            global.nodes.remove( global.selected );

            const clean = function( key ) {
                global.nodes.each( function( n ) {
                    if ( n.key !== 'node0' && n.parent.key === key ) {
                        global.nodes.remove( n.key );
                        clean( n.key );
                        return;
                    }
                });
            }
            clean( global.selected );

            selectNode('node0');
            redraw();
            events.call('noderemove');
        } else {
            console.warn('The root node can not be deleted');
        }
    }

    function center() {
        const root = global.nodes.get('node0');
        const center = {
            x : parseInt( global.container.style('width') )/2,
            y : parseInt( global.container.style('height') )/2
        }
        const zoomId = d3.zoomIdentity.translate( center.x - root.x, center.y - root.y );
        global.svg.main.transition().duration(500).call( zoom.transform, zoomId );
        events.call('mmcenter');
    }

    function updateNode( k, v ) {
        const sel = global.nodes.get( global.selected );
        const dom = document.getElementById( sel.key );
        const prop = {
            'name' : updateName,
            'background-color' : updateBackgroundColor,
            'branch-color' : updateBranchColor,
            'text-color' : updateTextColor,
            'font-size' : updateFontSize,
            'font-style' : updateFontStyle,
            'font-weight' : updateFontWeight,
            default : function() {
                console.error('"'+ k +'" is not a valid node property');
            }
        };
        ( prop[k] || prop.default ).call( dom, sel, v );
    }

    function getPNG( name ) {

        svgAsDataUri( document.getElementById('mmap'), {}, function(uri) {
          var image = new Image();
          image.onload = function() {
            var canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            var context = canvas.getContext('2d');
            context.drawImage(image, 0, 0);
            var a = document.createElement('a'), png;
            try {
              png = canvas.toDataURL('image/png');
            } catch (e) {
              if ((typeof SecurityError !== 'undefined' && e instanceof SecurityError) || e.name == "SecurityError") {
                console.error("Rendered SVG images cannot be downloaded in this browser.");
                return;
              } else {
                throw e;
              }
            }

            const aa = document.createElement('a');
            aa.download = name;
            aa.href = png;
            document.body.appendChild(aa);
            aa.onclick = function(e) {
              aa.parentNode.removeChild(aa);
            };
            aa.click();

          }
          image.onerror = function(error) {
            console.error('There was an error loading the data URI as an image', error);
          }
          image.src = uri;
        });
    }

    function svgAsDataUri( el, options, cb ) {

      options = options || {};
      options.scale = options.scale || 1;
      options.responsive = options.responsive || false;
      var xmlns = "http://www.w3.org/2000/xmlns/";

      inlineImages(el, function() {
        var outer = document.createElement("div");
        var clone = el.cloneNode(true);
        var width, height;
        if(el.tagName == 'svg') {
          width = options.width || getDimension(el, clone, 'width');
          height = options.height || getDimension(el, clone, 'height');
        } else if(el.getBBox) {
          var box = el.getBBox();
          width = box.x + box.width;
          height = box.y + box.height;
          clone.setAttribute('transform', clone.getAttribute('transform').replace(/translate\(.*?\)/, ''));

          var svg = document.createElementNS('http://www.w3.org/2000/svg','svg')
          svg.appendChild(clone)
          clone = svg;
        } else {
          console.error('Attempted to render non-SVG element', el);
          return;
        }

        clone.setAttribute("version", "1.1");
        if (!clone.getAttribute('xmlns')) {
          clone.setAttributeNS(xmlns, "xmlns", "http://www.w3.org/2000/svg");
        }
        if (!clone.getAttribute('xmlns:xlink')) {
          clone.setAttributeNS(xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
        }

        if (options.responsive) {
          clone.removeAttribute('width');
          clone.removeAttribute('height');
          clone.setAttribute('preserveAspectRatio', 'xMinYMin meet');
        } else {
          clone.setAttribute("width", width * options.scale);
          clone.setAttribute("height", height * options.scale);
        }

        clone.setAttribute("viewBox", [
          options.left || 0,
          options.top || 0,
          width,
          height
        ].join(" "));

        var fos = clone.querySelectorAll('foreignObject > *');
        for (var i = 0; i < fos.length; i++) {
          fos[i].setAttributeNS(xmlns, "xmlns", "http://www.w3.org/1999/xhtml");
        }

        outer.appendChild(clone);

        var css = styles(el, options.selectorRemap);
        var s = document.createElement('style');
        s.setAttribute('type', 'text/css');
        s.innerHTML = "<![CDATA[\n" + css + "\n]]>";
        var defs = document.createElement('defs');
        defs.appendChild(s);
        clone.insertBefore(defs, clone.firstChild);

        var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

        var svg = doctype + outer.innerHTML;
        var uri = 'data:image/svg+xml;base64,' + window.btoa(reEncode(svg));
        if (cb) {
          cb(uri);
        }
      });
    }

    function inlineImages(el, callback) {

      var images = el.querySelectorAll('image'),
          left = images.length,
          checkDone = function() {
            if (left === 0) {
              callback();
            }
          };

      checkDone();
      for (var i = 0; i < images.length; i++) {
        (function(image) {
          var href = image.getAttributeNS("http://www.w3.org/1999/xlink", "href");
          if (href) {
            if (isExternal(href.value)) {
              console.warn("Cannot render embedded images linking to external hosts: "+href.value);
              return;
            }
          }
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');
          var img = new Image();
          href = href || image.getAttribute('href');
          if (href) {
            img.src = href;
            img.onload = function() {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);
              image.setAttributeNS("http://www.w3.org/1999/xlink", "href", canvas.toDataURL('image/png'));
              left--;
              checkDone();
            }
            img.onerror = function() {
              console.log("Could not load "+href);
              left--;
              checkDone();
            }
          } else {
            left--;
            checkDone();
          }
        })(images[i]);
      }
    }

    function getDimension(el, clone, dim) {
      var v = (el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal[dim]) ||
        (clone.getAttribute(dim) !== null && !clone.getAttribute(dim).match(/%$/) && parseInt(clone.getAttribute(dim))) ||
        el.getBoundingClientRect()[dim] ||
        parseInt(clone.style[dim]) ||
        parseInt(window.getComputedStyle(el).getPropertyValue(dim));
      return (typeof v === 'undefined' || v === null || isNaN(parseFloat(v))) ? 0 : v;
    }

    function styles(el, selectorRemap) {
      var css = "";
      var sheets = document.styleSheets;
      for (var i = 0; i < sheets.length; i++) {
        try {
          var rules = sheets[i].cssRules;
        } catch (e) {
          console.warn("Stylesheet could not be loaded: "+sheets[i].href);
          continue;
        }

        if (rules != null) {
          for (var j = 0; j < rules.length; j++) {
            var rule = rules[j];
            if (typeof(rule.style) != "undefined") {
              var match, selectorText;

              try {
                selectorText = rule.selectorText;
              } catch(err) {
                console.warn('The following CSS rule has an invalid selector: "' + rule + '"', err);
              }

              try {
                if (selectorText) {
                  match = el.querySelector(selectorText);
                }
              } catch(err) {
                console.warn('Invalid CSS selector "' + selectorText + '"', err);
              }

              if (match) {
                var selector = selectorRemap ? selectorRemap(rule.selectorText) : rule.selectorText;
                css += selector + " { " + rule.style.cssText + " }\n";
              } else if(rule.cssText.match(/^@font-face/)) {
                css += rule.cssText + '\n';
              }
            }
          }
        }
      }
      return css;
    }

    function reEncode(data) {
      data = encodeURIComponent(data);
      data = data.replace(/%([0-9A-F]{2})/g, function(match, p1) {
        var c = String.fromCharCode('0x'+p1);
        return c === '%' ? '%25' : c;
      });
      return decodeURIComponent(data);
    }

    /**
     * @description
     * Make visible public functions outside
     *
     */
    window.mmap = {
        // Basic
        init : init,
        center : center,
        addNode : addNode,
        removeNode : removeNode,

        // Advanced
        updateNode : updateNode,
        events : events,
        getPNG : getPNG
    };

}(this, window.d3));
