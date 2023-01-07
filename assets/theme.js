var _createClass$1 = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck$1(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * This work is licensed under the W3C Software and Document License
 * (http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).
 */

(function () {
  // Return early if we're not running inside of the browser.
  if (typeof window === 'undefined') {
    return;
  }

  // Convenience function for converting NodeLists.
  /** @type {typeof Array.prototype.slice} */
  var slice = Array.prototype.slice;

  /**
   * IE has a non-standard name for "matches".
   * @type {typeof Element.prototype.matches}
   */
  var matches = Element.prototype.matches || Element.prototype.msMatchesSelector;

  /** @type {string} */
  var _focusableElementsString = ['a[href]', 'area[href]', 'input:not([disabled])', 'select:not([disabled])', 'textarea:not([disabled])', 'button:not([disabled])', 'details', 'summary', 'iframe', 'object', 'embed', '[contenteditable]'].join(',');

  /**
   * `InertRoot` manages a single inert subtree, i.e. a DOM subtree whose root element has an `inert`
   * attribute.
   *
   * Its main functions are:
   *
   * - to create and maintain a set of managed `InertNode`s, including when mutations occur in the
   *   subtree. The `makeSubtreeUnfocusable()` method handles collecting `InertNode`s via registering
   *   each focusable node in the subtree with the singleton `InertManager` which manages all known
   *   focusable nodes within inert subtrees. `InertManager` ensures that a single `InertNode`
   *   instance exists for each focusable node which has at least one inert root as an ancestor.
   *
   * - to notify all managed `InertNode`s when this subtree stops being inert (i.e. when the `inert`
   *   attribute is removed from the root node). This is handled in the destructor, which calls the
   *   `deregister` method on `InertManager` for each managed inert node.
   */

  var InertRoot = function () {
    /**
     * @param {!Element} rootElement The Element at the root of the inert subtree.
     * @param {!InertManager} inertManager The global singleton InertManager object.
     */
    function InertRoot(rootElement, inertManager) {
      _classCallCheck$1(this, InertRoot);

      /** @type {!InertManager} */
      this._inertManager = inertManager;

      /** @type {!Element} */
      this._rootElement = rootElement;

      /**
       * @type {!Set<!InertNode>}
       * All managed focusable nodes in this InertRoot's subtree.
       */
      this._managedNodes = new Set();

      // Make the subtree hidden from assistive technology
      if (this._rootElement.hasAttribute('aria-hidden')) {
        /** @type {?string} */
        this._savedAriaHidden = this._rootElement.getAttribute('aria-hidden');
      } else {
        this._savedAriaHidden = null;
      }
      this._rootElement.setAttribute('aria-hidden', 'true');

      // Make all focusable elements in the subtree unfocusable and add them to _managedNodes
      this._makeSubtreeUnfocusable(this._rootElement);

      // Watch for:
      // - any additions in the subtree: make them unfocusable too
      // - any removals from the subtree: remove them from this inert root's managed nodes
      // - attribute changes: if `tabindex` is added, or removed from an intrinsically focusable
      //   element, make that node a managed node.
      this._observer = new MutationObserver(this._onMutation.bind(this));
      this._observer.observe(this._rootElement, { attributes: true, childList: true, subtree: true });
    }

    /**
     * Call this whenever this object is about to become obsolete.  This unwinds all of the state
     * stored in this object and updates the state of all of the managed nodes.
     */


    _createClass$1(InertRoot, [{
      key: 'destructor',
      value: function destructor() {
        this._observer.disconnect();

        if (this._rootElement) {
          if (this._savedAriaHidden !== null) {
            this._rootElement.setAttribute('aria-hidden', this._savedAriaHidden);
          } else {
            this._rootElement.removeAttribute('aria-hidden');
          }
        }

        this._managedNodes.forEach(function (inertNode) {
          this._unmanageNode(inertNode.node);
        }, this);

        // Note we cast the nulls to the ANY type here because:
        // 1) We want the class properties to be declared as non-null, or else we
        //    need even more casts throughout this code. All bets are off if an
        //    instance has been destroyed and a method is called.
        // 2) We don't want to cast "this", because we want type-aware optimizations
        //    to know which properties we're setting.
        this._observer = /** @type {?} */null;
        this._rootElement = /** @type {?} */null;
        this._managedNodes = /** @type {?} */null;
        this._inertManager = /** @type {?} */null;
      }

      /**
       * @return {!Set<!InertNode>} A copy of this InertRoot's managed nodes set.
       */

    }, {
      key: '_makeSubtreeUnfocusable',


      /**
       * @param {!Node} startNode
       */
      value: function _makeSubtreeUnfocusable(startNode) {
        var _this2 = this;

        composedTreeWalk(startNode, function (node) {
          return _this2._visitNode(node);
        });

        var activeElement = document.activeElement;

        if (!document.body.contains(startNode)) {
          // startNode may be in shadow DOM, so find its nearest shadowRoot to get the activeElement.
          var node = startNode;
          /** @type {!ShadowRoot|undefined} */
          var root = undefined;
          while (node) {
            if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
              root = /** @type {!ShadowRoot} */node;
              break;
            }
            node = node.parentNode;
          }
          if (root) {
            activeElement = root.activeElement;
          }
        }
        if (startNode.contains(activeElement)) {
          activeElement.blur();
          // In IE11, if an element is already focused, and then set to tabindex=-1
          // calling blur() will not actually move the focus.
          // To work around this we call focus() on the body instead.
          if (activeElement === document.activeElement) {
            document.body.focus();
          }
        }
      }

      /**
       * @param {!Node} node
       */

    }, {
      key: '_visitNode',
      value: function _visitNode(node) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        var element = /** @type {!Element} */node;

        // If a descendant inert root becomes un-inert, its descendants will still be inert because of
        // this inert root, so all of its managed nodes need to be adopted by this InertRoot.
        if (element !== this._rootElement && element.hasAttribute('inert')) {
          this._adoptInertRoot(element);
        }

        if (matches.call(element, _focusableElementsString) || element.hasAttribute('tabindex')) {
          this._manageNode(element);
        }
      }

      /**
       * Register the given node with this InertRoot and with InertManager.
       * @param {!Node} node
       */

    }, {
      key: '_manageNode',
      value: function _manageNode(node) {
        var inertNode = this._inertManager.register(node, this);
        this._managedNodes.add(inertNode);
      }

      /**
       * Unregister the given node with this InertRoot and with InertManager.
       * @param {!Node} node
       */

    }, {
      key: '_unmanageNode',
      value: function _unmanageNode(node) {
        var inertNode = this._inertManager.deregister(node, this);
        if (inertNode) {
          this._managedNodes['delete'](inertNode);
        }
      }

      /**
       * Unregister the entire subtree starting at `startNode`.
       * @param {!Node} startNode
       */

    }, {
      key: '_unmanageSubtree',
      value: function _unmanageSubtree(startNode) {
        var _this3 = this;

        composedTreeWalk(startNode, function (node) {
          return _this3._unmanageNode(node);
        });
      }

      /**
       * If a descendant node is found with an `inert` attribute, adopt its managed nodes.
       * @param {!Element} node
       */

    }, {
      key: '_adoptInertRoot',
      value: function _adoptInertRoot(node) {
        var inertSubroot = this._inertManager.getInertRoot(node);

        // During initialisation this inert root may not have been registered yet,
        // so register it now if need be.
        if (!inertSubroot) {
          this._inertManager.setInert(node, true);
          inertSubroot = this._inertManager.getInertRoot(node);
        }

        inertSubroot.managedNodes.forEach(function (savedInertNode) {
          this._manageNode(savedInertNode.node);
        }, this);
      }

      /**
       * Callback used when mutation observer detects subtree additions, removals, or attribute changes.
       * @param {!Array<!MutationRecord>} records
       * @param {!MutationObserver} self
       */

    }, {
      key: '_onMutation',
      value: function _onMutation(records, self) {
        records.forEach(function (record) {
          var target = /** @type {!Element} */record.target;
          if (record.type === 'childList') {
            // Manage added nodes
            slice.call(record.addedNodes).forEach(function (node) {
              this._makeSubtreeUnfocusable(node);
            }, this);

            // Un-manage removed nodes
            slice.call(record.removedNodes).forEach(function (node) {
              this._unmanageSubtree(node);
            }, this);
          } else if (record.type === 'attributes') {
            if (record.attributeName === 'tabindex') {
              // Re-initialise inert node if tabindex changes
              this._manageNode(target);
            } else if (target !== this._rootElement && record.attributeName === 'inert' && target.hasAttribute('inert')) {
              // If a new inert root is added, adopt its managed nodes and make sure it knows about the
              // already managed nodes from this inert subroot.
              this._adoptInertRoot(target);
              var inertSubroot = this._inertManager.getInertRoot(target);
              this._managedNodes.forEach(function (managedNode) {
                if (target.contains(managedNode.node)) {
                  inertSubroot._manageNode(managedNode.node);
                }
              });
            }
          }
        }, this);
      }
    }, {
      key: 'managedNodes',
      get: function get() {
        return new Set(this._managedNodes);
      }

      /** @return {boolean} */

    }, {
      key: 'hasSavedAriaHidden',
      get: function get() {
        return this._savedAriaHidden !== null;
      }

      /** @param {?string} ariaHidden */

    }, {
      key: 'savedAriaHidden',
      set: function set(ariaHidden) {
        this._savedAriaHidden = ariaHidden;
      }

      /** @return {?string} */
      ,
      get: function get() {
        return this._savedAriaHidden;
      }
    }]);

    return InertRoot;
  }();

  /**
   * `InertNode` initialises and manages a single inert node.
   * A node is inert if it is a descendant of one or more inert root elements.
   *
   * On construction, `InertNode` saves the existing `tabindex` value for the node, if any, and
   * either removes the `tabindex` attribute or sets it to `-1`, depending on whether the element
   * is intrinsically focusable or not.
   *
   * `InertNode` maintains a set of `InertRoot`s which are descendants of this `InertNode`. When an
   * `InertRoot` is destroyed, and calls `InertManager.deregister()`, the `InertManager` notifies the
   * `InertNode` via `removeInertRoot()`, which in turn destroys the `InertNode` if no `InertRoot`s
   * remain in the set. On destruction, `InertNode` reinstates the stored `tabindex` if one exists,
   * or removes the `tabindex` attribute if the element is intrinsically focusable.
   */


  var InertNode = function () {
    /**
     * @param {!Node} node A focusable element to be made inert.
     * @param {!InertRoot} inertRoot The inert root element associated with this inert node.
     */
    function InertNode(node, inertRoot) {
      _classCallCheck$1(this, InertNode);

      /** @type {!Node} */
      this._node = node;

      /** @type {boolean} */
      this._overrodeFocusMethod = false;

      /**
       * @type {!Set<!InertRoot>} The set of descendant inert roots.
       *    If and only if this set becomes empty, this node is no longer inert.
       */
      this._inertRoots = new Set([inertRoot]);

      /** @type {?number} */
      this._savedTabIndex = null;

      /** @type {boolean} */
      this._destroyed = false;

      // Save any prior tabindex info and make this node untabbable
      this.ensureUntabbable();
    }

    /**
     * Call this whenever this object is about to become obsolete.
     * This makes the managed node focusable again and deletes all of the previously stored state.
     */


    _createClass$1(InertNode, [{
      key: 'destructor',
      value: function destructor() {
        this._throwIfDestroyed();

        if (this._node && this._node.nodeType === Node.ELEMENT_NODE) {
          var element = /** @type {!Element} */this._node;
          if (this._savedTabIndex !== null) {
            element.setAttribute('tabindex', this._savedTabIndex);
          } else {
            element.removeAttribute('tabindex');
          }

          // Use `delete` to restore native focus method.
          if (this._overrodeFocusMethod) {
            delete element.focus;
          }
        }

        // See note in InertRoot.destructor for why we cast these nulls to ANY.
        this._node = /** @type {?} */null;
        this._inertRoots = /** @type {?} */null;
        this._destroyed = true;
      }

      /**
       * @type {boolean} Whether this object is obsolete because the managed node is no longer inert.
       * If the object has been destroyed, any attempt to access it will cause an exception.
       */

    }, {
      key: '_throwIfDestroyed',


      /**
       * Throw if user tries to access destroyed InertNode.
       */
      value: function _throwIfDestroyed() {
        if (this.destroyed) {
          throw new Error('Trying to access destroyed InertNode');
        }
      }

      /** @return {boolean} */

    }, {
      key: 'ensureUntabbable',


      /** Save the existing tabindex value and make the node untabbable and unfocusable */
      value: function ensureUntabbable() {
        if (this.node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        var element = /** @type {!Element} */this.node;
        if (matches.call(element, _focusableElementsString)) {
          if ( /** @type {!HTMLElement} */element.tabIndex === -1 && this.hasSavedTabIndex) {
            return;
          }

          if (element.hasAttribute('tabindex')) {
            this._savedTabIndex = /** @type {!HTMLElement} */element.tabIndex;
          }
          element.setAttribute('tabindex', '-1');
          if (element.nodeType === Node.ELEMENT_NODE) {
            element.focus = function () {};
            this._overrodeFocusMethod = true;
          }
        } else if (element.hasAttribute('tabindex')) {
          this._savedTabIndex = /** @type {!HTMLElement} */element.tabIndex;
          element.removeAttribute('tabindex');
        }
      }

      /**
       * Add another inert root to this inert node's set of managing inert roots.
       * @param {!InertRoot} inertRoot
       */

    }, {
      key: 'addInertRoot',
      value: function addInertRoot(inertRoot) {
        this._throwIfDestroyed();
        this._inertRoots.add(inertRoot);
      }

      /**
       * Remove the given inert root from this inert node's set of managing inert roots.
       * If the set of managing inert roots becomes empty, this node is no longer inert,
       * so the object should be destroyed.
       * @param {!InertRoot} inertRoot
       */

    }, {
      key: 'removeInertRoot',
      value: function removeInertRoot(inertRoot) {
        this._throwIfDestroyed();
        this._inertRoots['delete'](inertRoot);
        if (this._inertRoots.size === 0) {
          this.destructor();
        }
      }
    }, {
      key: 'destroyed',
      get: function get() {
        return (/** @type {!InertNode} */this._destroyed
        );
      }
    }, {
      key: 'hasSavedTabIndex',
      get: function get() {
        return this._savedTabIndex !== null;
      }

      /** @return {!Node} */

    }, {
      key: 'node',
      get: function get() {
        this._throwIfDestroyed();
        return this._node;
      }

      /** @param {?number} tabIndex */

    }, {
      key: 'savedTabIndex',
      set: function set(tabIndex) {
        this._throwIfDestroyed();
        this._savedTabIndex = tabIndex;
      }

      /** @return {?number} */
      ,
      get: function get() {
        this._throwIfDestroyed();
        return this._savedTabIndex;
      }
    }]);

    return InertNode;
  }();

  /**
   * InertManager is a per-document singleton object which manages all inert roots and nodes.
   *
   * When an element becomes an inert root by having an `inert` attribute set and/or its `inert`
   * property set to `true`, the `setInert` method creates an `InertRoot` object for the element.
   * The `InertRoot` in turn registers itself as managing all of the element's focusable descendant
   * nodes via the `register()` method. The `InertManager` ensures that a single `InertNode` instance
   * is created for each such node, via the `_managedNodes` map.
   */


  var InertManager = function () {
    /**
     * @param {!Document} document
     */
    function InertManager(document) {
      _classCallCheck$1(this, InertManager);

      if (!document) {
        throw new Error('Missing required argument; InertManager needs to wrap a document.');
      }

      /** @type {!Document} */
      this._document = document;

      /**
       * All managed nodes known to this InertManager. In a map to allow looking up by Node.
       * @type {!Map<!Node, !InertNode>}
       */
      this._managedNodes = new Map();

      /**
       * All inert roots known to this InertManager. In a map to allow looking up by Node.
       * @type {!Map<!Node, !InertRoot>}
       */
      this._inertRoots = new Map();

      /**
       * Observer for mutations on `document.body`.
       * @type {!MutationObserver}
       */
      this._observer = new MutationObserver(this._watchForInert.bind(this));

      // Add inert style.
      addInertStyle(document.head || document.body || document.documentElement);

      // Wait for document to be loaded.
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', this._onDocumentLoaded.bind(this));
      } else {
        this._onDocumentLoaded();
      }
    }

    /**
     * Set whether the given element should be an inert root or not.
     * @param {!Element} root
     * @param {boolean} inert
     */


    _createClass$1(InertManager, [{
      key: 'setInert',
      value: function setInert(root, inert) {
        if (inert) {
          if (this._inertRoots.has(root)) {
            // element is already inert
            return;
          }

          var inertRoot = new InertRoot(root, this);
          root.setAttribute('inert', '');
          this._inertRoots.set(root, inertRoot);
          // If not contained in the document, it must be in a shadowRoot.
          // Ensure inert styles are added there.
          if (!this._document.body.contains(root)) {
            var parent = root.parentNode;
            while (parent) {
              if (parent.nodeType === 11) {
                addInertStyle(parent);
              }
              parent = parent.parentNode;
            }
          }
        } else {
          if (!this._inertRoots.has(root)) {
            // element is already non-inert
            return;
          }

          var _inertRoot = this._inertRoots.get(root);
          _inertRoot.destructor();
          this._inertRoots['delete'](root);
          root.removeAttribute('inert');
        }
      }

      /**
       * Get the InertRoot object corresponding to the given inert root element, if any.
       * @param {!Node} element
       * @return {!InertRoot|undefined}
       */

    }, {
      key: 'getInertRoot',
      value: function getInertRoot(element) {
        return this._inertRoots.get(element);
      }

      /**
       * Register the given InertRoot as managing the given node.
       * In the case where the node has a previously existing inert root, this inert root will
       * be added to its set of inert roots.
       * @param {!Node} node
       * @param {!InertRoot} inertRoot
       * @return {!InertNode} inertNode
       */

    }, {
      key: 'register',
      value: function register(node, inertRoot) {
        var inertNode = this._managedNodes.get(node);
        if (inertNode !== undefined) {
          // node was already in an inert subtree
          inertNode.addInertRoot(inertRoot);
        } else {
          inertNode = new InertNode(node, inertRoot);
        }

        this._managedNodes.set(node, inertNode);

        return inertNode;
      }

      /**
       * De-register the given InertRoot as managing the given inert node.
       * Removes the inert root from the InertNode's set of managing inert roots, and remove the inert
       * node from the InertManager's set of managed nodes if it is destroyed.
       * If the node is not currently managed, this is essentially a no-op.
       * @param {!Node} node
       * @param {!InertRoot} inertRoot
       * @return {?InertNode} The potentially destroyed InertNode associated with this node, if any.
       */

    }, {
      key: 'deregister',
      value: function deregister(node, inertRoot) {
        var inertNode = this._managedNodes.get(node);
        if (!inertNode) {
          return null;
        }

        inertNode.removeInertRoot(inertRoot);
        if (inertNode.destroyed) {
          this._managedNodes['delete'](node);
        }

        return inertNode;
      }

      /**
       * Callback used when document has finished loading.
       */

    }, {
      key: '_onDocumentLoaded',
      value: function _onDocumentLoaded() {
        // Find all inert roots in document and make them actually inert.
        var inertElements = slice.call(this._document.querySelectorAll('[inert]'));
        inertElements.forEach(function (inertElement) {
          this.setInert(inertElement, true);
        }, this);

        // Comment this out to use programmatic API only.
        this._observer.observe(this._document.body || this._document.documentElement, { attributes: true, subtree: true, childList: true });
      }

      /**
       * Callback used when mutation observer detects attribute changes.
       * @param {!Array<!MutationRecord>} records
       * @param {!MutationObserver} self
       */

    }, {
      key: '_watchForInert',
      value: function _watchForInert(records, self) {
        var _this = this;
        records.forEach(function (record) {
          switch (record.type) {
            case 'childList':
              slice.call(record.addedNodes).forEach(function (node) {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                  return;
                }
                var inertElements = slice.call(node.querySelectorAll('[inert]'));
                if (matches.call(node, '[inert]')) {
                  inertElements.unshift(node);
                }
                inertElements.forEach(function (inertElement) {
                  this.setInert(inertElement, true);
                }, _this);
              }, _this);
              break;
            case 'attributes':
              if (record.attributeName !== 'inert') {
                return;
              }
              var target = /** @type {!Element} */record.target;
              var inert = target.hasAttribute('inert');
              _this.setInert(target, inert);
              break;
          }
        }, this);
      }
    }]);

    return InertManager;
  }();

  /**
   * Recursively walk the composed tree from |node|.
   * @param {!Node} node
   * @param {(function (!Element))=} callback Callback to be called for each element traversed,
   *     before descending into child nodes.
   * @param {?ShadowRoot=} shadowRootAncestor The nearest ShadowRoot ancestor, if any.
   */


  function composedTreeWalk(node, callback, shadowRootAncestor) {
    if (node.nodeType == Node.ELEMENT_NODE) {
      var element = /** @type {!Element} */node;
      if (callback) {
        callback(element);
      }

      // Descend into node:
      // If it has a ShadowRoot, ignore all child elements - these will be picked
      // up by the <content> or <shadow> elements. Descend straight into the
      // ShadowRoot.
      var shadowRoot = /** @type {!HTMLElement} */element.shadowRoot;
      if (shadowRoot) {
        composedTreeWalk(shadowRoot, callback);
        return;
      }

      // If it is a <content> element, descend into distributed elements - these
      // are elements from outside the shadow root which are rendered inside the
      // shadow DOM.
      if (element.localName == 'content') {
        var content = /** @type {!HTMLContentElement} */element;
        // Verifies if ShadowDom v0 is supported.
        var distributedNodes = content.getDistributedNodes ? content.getDistributedNodes() : [];
        for (var i = 0; i < distributedNodes.length; i++) {
          composedTreeWalk(distributedNodes[i], callback);
        }
        return;
      }

      // If it is a <slot> element, descend into assigned nodes - these
      // are elements from outside the shadow root which are rendered inside the
      // shadow DOM.
      if (element.localName == 'slot') {
        var slot = /** @type {!HTMLSlotElement} */element;
        // Verify if ShadowDom v1 is supported.
        var _distributedNodes = slot.assignedNodes ? slot.assignedNodes({ flatten: true }) : [];
        for (var _i = 0; _i < _distributedNodes.length; _i++) {
          composedTreeWalk(_distributedNodes[_i], callback);
        }
        return;
      }
    }

    // If it is neither the parent of a ShadowRoot, a <content> element, a <slot>
    // element, nor a <shadow> element recurse normally.
    var child = node.firstChild;
    while (child != null) {
      composedTreeWalk(child, callback);
      child = child.nextSibling;
    }
  }

  /**
   * Adds a style element to the node containing the inert specific styles
   * @param {!Node} node
   */
  function addInertStyle(node) {
    if (node.querySelector('style#inert-style, link#inert-style')) {
      return;
    }
    var style = document.createElement('style');
    style.setAttribute('id', 'inert-style');
    style.textContent = '\n' + '[inert] {\n' + '  pointer-events: none;\n' + '  cursor: default;\n' + '}\n' + '\n' + '[inert], [inert] * {\n' + '  -webkit-user-select: none;\n' + '  -moz-user-select: none;\n' + '  -ms-user-select: none;\n' + '  user-select: none;\n' + '}\n';
    node.appendChild(style);
  }

  if (!Element.prototype.hasOwnProperty('inert')) {
    /** @type {!InertManager} */
    var inertManager = new InertManager(document);

    Object.defineProperty(Element.prototype, 'inert', {
      enumerable: true,
      /** @this {!Element} */
      get: function get() {
        return this.hasAttribute('inert');
      },
      /** @this {!Element} */
      set: function set(inert) {
        inertManager.setInert(this, inert);
      }
    });
  }
})();

var SECTION_ID_ATTR$1 = 'data-section-id';

function Section(container, properties) {
  this.container = validateContainerElement(container);
  this.id = container.getAttribute(SECTION_ID_ATTR$1);
  this.extensions = [];

  // eslint-disable-next-line es5/no-es6-static-methods
  Object.assign(this, validatePropertiesObject(properties));

  this.onLoad();
}

Section.prototype = {
  onLoad: Function.prototype,
  onUnload: Function.prototype,
  onSelect: Function.prototype,
  onDeselect: Function.prototype,
  onBlockSelect: Function.prototype,
  onBlockDeselect: Function.prototype,

  extend: function extend(extension) {
    this.extensions.push(extension); // Save original extension

    // eslint-disable-next-line es5/no-es6-static-methods
    var extensionClone = Object.assign({}, extension);
    delete extensionClone.init; // Remove init function before assigning extension properties

    // eslint-disable-next-line es5/no-es6-static-methods
    Object.assign(this, extensionClone);

    if (typeof extension.init === 'function') {
      extension.init.apply(this);
    }
  }
};

function validateContainerElement(container) {
  if (!(container instanceof Element)) {
    throw new TypeError(
      'Theme Sections: Attempted to load section. The section container provided is not a DOM element.'
    );
  }
  if (container.getAttribute(SECTION_ID_ATTR$1) === null) {
    throw new Error(
      'Theme Sections: The section container provided does not have an id assigned to the ' +
        SECTION_ID_ATTR$1 +
        ' attribute.'
    );
  }

  return container;
}

function validatePropertiesObject(value) {
  if (
    (typeof value !== 'undefined' && typeof value !== 'object') ||
    value === null
  ) {
    throw new TypeError(
      'Theme Sections: The properties object provided is not a valid'
    );
  }

  return value;
}

// Object.assign() polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, 'assign', {
    value: function assign(target) {
      if (target == null) {
        // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) {
          // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

/*
 * @shopify/theme-sections
 * -----------------------------------------------------------------------------
 *
 * A framework to provide structure to your Shopify sections and a load and unload
 * lifecycle. The lifecycle is automatically connected to theme editor events so
 * that your sections load and unload as the editor changes the content and
 * settings of your sections.
 */

var SECTION_TYPE_ATTR = 'data-section-type';
var SECTION_ID_ATTR = 'data-section-id';

window.Shopify = window.Shopify || {};
window.Shopify.theme = window.Shopify.theme || {};
window.Shopify.theme.sections = window.Shopify.theme.sections || {};

var registered = (window.Shopify.theme.sections.registered =
  window.Shopify.theme.sections.registered || {});
var instances = (window.Shopify.theme.sections.instances =
  window.Shopify.theme.sections.instances || []);

function register(type, properties) {
  if (typeof type !== 'string') {
    throw new TypeError(
      'Theme Sections: The first argument for .register must be a string that specifies the type of the section being registered'
    );
  }

  if (typeof registered[type] !== 'undefined') {
    throw new Error(
      'Theme Sections: A section of type "' +
        type +
        '" has already been registered. You cannot register the same section type twice'
    );
  }

  function TypedSection(container) {
    Section.call(this, container, properties);
  }

  TypedSection.constructor = Section;
  TypedSection.prototype = Object.create(Section.prototype);
  TypedSection.prototype.type = type;

  return (registered[type] = TypedSection);
}

function load(types, containers) {
  types = normalizeType(types);

  if (typeof containers === 'undefined') {
    containers = document.querySelectorAll('[' + SECTION_TYPE_ATTR + ']');
  }

  containers = normalizeContainers(containers);

  types.forEach(function(type) {
    var TypedSection = registered[type];

    if (typeof TypedSection === 'undefined') {
      return;
    }

    containers = containers.filter(function(container) {
      // Filter from list of containers because container already has an instance loaded
      if (isInstance(container)) {
        return false;
      }

      // Filter from list of containers because container doesn't have data-section-type attribute
      if (container.getAttribute(SECTION_TYPE_ATTR) === null) {
        return false;
      }

      // Keep in list of containers because current type doesn't match
      if (container.getAttribute(SECTION_TYPE_ATTR) !== type) {
        return true;
      }

      instances.push(new TypedSection(container));

      // Filter from list of containers because container now has an instance loaded
      return false;
    });
  });
}

function unload(selector) {
  var instancesToUnload = getInstances(selector);

  instancesToUnload.forEach(function(instance) {
    var index = instances
      .map(function(e) {
        return e.id;
      })
      .indexOf(instance.id);
    instances.splice(index, 1);
    instance.onUnload();
  });
}

function getInstances(selector) {
  var filteredInstances = [];

  // Fetch first element if its an array
  if (NodeList.prototype.isPrototypeOf(selector) || Array.isArray(selector)) {
    var firstElement = selector[0];
  }

  // If selector element is DOM element
  if (selector instanceof Element || firstElement instanceof Element) {
    var containers = normalizeContainers(selector);

    containers.forEach(function(container) {
      filteredInstances = filteredInstances.concat(
        instances.filter(function(instance) {
          return instance.container === container;
        })
      );
    });

    // If select is type string
  } else if (typeof selector === 'string' || typeof firstElement === 'string') {
    var types = normalizeType(selector);

    types.forEach(function(type) {
      filteredInstances = filteredInstances.concat(
        instances.filter(function(instance) {
          return instance.type === type;
        })
      );
    });
  }

  return filteredInstances;
}

function getInstanceById(id) {
  var instance;

  for (var i = 0; i < instances.length; i++) {
    if (instances[i].id === id) {
      instance = instances[i];
      break;
    }
  }
  return instance;
}

function isInstance(selector) {
  return getInstances(selector).length > 0;
}

function normalizeType(types) {
  // If '*' then fetch all registered section types
  if (types === '*') {
    types = Object.keys(registered);

    // If a single section type string is passed, put it in an array
  } else if (typeof types === 'string') {
    types = [types];

    // If single section constructor is passed, transform to array with section
    // type string
  } else if (types.constructor === Section) {
    types = [types.prototype.type];

    // If array of typed section constructors is passed, transform the array to
    // type strings
  } else if (Array.isArray(types) && types[0].constructor === Section) {
    types = types.map(function(TypedSection) {
      return TypedSection.prototype.type;
    });
  }

  types = types.map(function(type) {
    return type.toLowerCase();
  });

  return types;
}

function normalizeContainers(containers) {
  // Nodelist with entries
  if (NodeList.prototype.isPrototypeOf(containers) && containers.length > 0) {
    containers = Array.prototype.slice.call(containers);

    // Empty Nodelist
  } else if (
    NodeList.prototype.isPrototypeOf(containers) &&
    containers.length === 0
  ) {
    containers = [];

    // Handle null (document.querySelector() returns null with no match)
  } else if (containers === null) {
    containers = [];

    // Single DOM element
  } else if (!Array.isArray(containers) && containers instanceof Element) {
    containers = [containers];
  }

  return containers;
}

if (window.Shopify.designMode) {
  document.addEventListener('shopify:section:load', function(event) {
    var id = event.detail.sectionId;
    var container = event.target.querySelector(
      '[' + SECTION_ID_ATTR + '="' + id + '"]'
    );

    if (container !== null) {
      load(container.getAttribute(SECTION_TYPE_ATTR), container);
    }
  });

  document.addEventListener('shopify:section:unload', function(event) {
    var id = event.detail.sectionId;
    var container = event.target.querySelector(
      '[' + SECTION_ID_ATTR + '="' + id + '"]'
    );
    var instance = getInstances(container)[0];

    if (typeof instance === 'object') {
      unload(container);
    }
  });

  document.addEventListener('shopify:section:select', function(event) {
    var instance = getInstanceById(event.detail.sectionId);

    if (typeof instance === 'object') {
      instance.onSelect(event);
    }
  });

  document.addEventListener('shopify:section:deselect', function(event) {
    var instance = getInstanceById(event.detail.sectionId);

    if (typeof instance === 'object') {
      instance.onDeselect(event);
    }
  });

  document.addEventListener('shopify:block:select', function(event) {
    var instance = getInstanceById(event.detail.sectionId);

    if (typeof instance === 'object') {
      instance.onBlockSelect(event);
    }
  });

  document.addEventListener('shopify:block:deselect', function(event) {
    var instance = getInstanceById(event.detail.sectionId);

    if (typeof instance === 'object') {
      instance.onBlockDeselect(event);
    }
  });
}

function n$2(n,t){return void 0===t&&(t=document),t.querySelector(n)}function t$3(n,t){return void 0===t&&(t=document),[].slice.call(t.querySelectorAll(n))}function c$1(n,t){return Array.isArray(n)?n.forEach(t):t(n)}function r$3(n){return function(t,r,e){return c$1(t,function(t){return t[n+"EventListener"](r,e)})}}function e$3(n,t,c){return r$3("add")(n,t,c),function(){return r$3("remove")(n,t,c)}}function o$2(n){return function(t){var r=arguments;return c$1(t,function(t){var c;return (c=t.classList)[n].apply(c,[].slice.call(r,1))})}}function u$1(n){o$2("add").apply(void 0,[n].concat([].slice.call(arguments,1)));}function i$1(n){o$2("remove").apply(void 0,[n].concat([].slice.call(arguments,1)));}function l(n){o$2("toggle").apply(void 0,[n].concat([].slice.call(arguments,1)));}function a$1(n,t){return n.classList.contains(t)}

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var isMobile$2 = {exports: {}};

isMobile$2.exports = isMobile;
isMobile$2.exports.isMobile = isMobile;
isMobile$2.exports.default = isMobile;

var mobileRE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;

var tabletRE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i;

function isMobile (opts) {
  if (!opts) opts = {};
  var ua = opts.ua;
  if (!ua && typeof navigator !== 'undefined') ua = navigator.userAgent;
  if (ua && ua.headers && typeof ua.headers['user-agent'] === 'string') {
    ua = ua.headers['user-agent'];
  }
  if (typeof ua !== 'string') return false

  var result = opts.tablet ? tabletRE.test(ua) : mobileRE.test(ua);

  if (
    !result &&
    opts.tablet &&
    opts.featureDetect &&
    navigator &&
    navigator.maxTouchPoints > 1 &&
    ua.indexOf('Macintosh') !== -1 &&
    ua.indexOf('Safari') !== -1
  ) {
    result = true;
  }

  return result
}

var isMobile$1 = isMobile$2.exports;

var browser = {exports: {}};

(function (module, exports) {

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * DOM event delegator
 *
 * The delegator will listen
 * for events that bubble up
 * to the root node.
 *
 * @constructor
 * @param {Node|string} [root] The root node or a selector string matching the root node
 */
function Delegate(root) {
  /**
   * Maintain a map of listener
   * lists, keyed by event name.
   *
   * @type Object
   */
  this.listenerMap = [{}, {}];

  if (root) {
    this.root(root);
  }
  /** @type function() */


  this.handle = Delegate.prototype.handle.bind(this); // Cache of event listeners removed during an event cycle

  this._removedListeners = [];
}
/**
 * Start listening for events
 * on the provided DOM element
 *
 * @param  {Node|string} [root] The root node or a selector string matching the root node
 * @returns {Delegate} This method is chainable
 */


Delegate.prototype.root = function (root) {
  var listenerMap = this.listenerMap;
  var eventType; // Remove master event listeners

  if (this.rootElement) {
    for (eventType in listenerMap[1]) {
      if (listenerMap[1].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, true);
      }
    }

    for (eventType in listenerMap[0]) {
      if (listenerMap[0].hasOwnProperty(eventType)) {
        this.rootElement.removeEventListener(eventType, this.handle, false);
      }
    }
  } // If no root or root is not
  // a dom node, then remove internal
  // root reference and exit here


  if (!root || !root.addEventListener) {
    if (this.rootElement) {
      delete this.rootElement;
    }

    return this;
  }
  /**
   * The root node at which
   * listeners are attached.
   *
   * @type Node
   */


  this.rootElement = root; // Set up master event listeners

  for (eventType in listenerMap[1]) {
    if (listenerMap[1].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, true);
    }
  }

  for (eventType in listenerMap[0]) {
    if (listenerMap[0].hasOwnProperty(eventType)) {
      this.rootElement.addEventListener(eventType, this.handle, false);
    }
  }

  return this;
};
/**
 * @param {string} eventType
 * @returns boolean
 */


Delegate.prototype.captureForType = function (eventType) {
  return ['blur', 'error', 'focus', 'load', 'resize', 'scroll'].indexOf(eventType) !== -1;
};
/**
 * Attach a handler to one
 * event for all elements
 * that match the selector,
 * now or in the future
 *
 * The handler function receives
 * three arguments: the DOM event
 * object, the node that matched
 * the selector while the event
 * was bubbling and a reference
 * to itself. Within the handler,
 * 'this' is equal to the second
 * argument.
 *
 * The node that actually received
 * the event can be accessed via
 * 'event.target'.
 *
 * @param {string} eventType Listen for these events
 * @param {string|undefined} selector Only handle events on elements matching this selector, if undefined match root element
 * @param {function()} handler Handler function - event data passed here will be in event.data
 * @param {boolean} [useCapture] see 'useCapture' in <https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener>
 * @returns {Delegate} This method is chainable
 */


Delegate.prototype.on = function (eventType, selector, handler, useCapture) {
  var root;
  var listenerMap;
  var matcher;
  var matcherParam;

  if (!eventType) {
    throw new TypeError('Invalid event type: ' + eventType);
  } // handler can be passed as
  // the second or third argument


  if (typeof selector === 'function') {
    useCapture = handler;
    handler = selector;
    selector = null;
  } // Fallback to sensible defaults
  // if useCapture not set


  if (useCapture === undefined) {
    useCapture = this.captureForType(eventType);
  }

  if (typeof handler !== 'function') {
    throw new TypeError('Handler must be a type of Function');
  }

  root = this.rootElement;
  listenerMap = this.listenerMap[useCapture ? 1 : 0]; // Add master handler for type if not created yet

  if (!listenerMap[eventType]) {
    if (root) {
      root.addEventListener(eventType, this.handle, useCapture);
    }

    listenerMap[eventType] = [];
  }

  if (!selector) {
    matcherParam = null; // COMPLEX - matchesRoot needs to have access to
    // this.rootElement, so bind the function to this.

    matcher = matchesRoot.bind(this); // Compile a matcher for the given selector
  } else if (/^[a-z]+$/i.test(selector)) {
    matcherParam = selector;
    matcher = matchesTag;
  } else if (/^#[a-z0-9\-_]+$/i.test(selector)) {
    matcherParam = selector.slice(1);
    matcher = matchesId;
  } else {
    matcherParam = selector;
    matcher = Element.prototype.matches;
  } // Add to the list of listeners


  listenerMap[eventType].push({
    selector: selector,
    handler: handler,
    matcher: matcher,
    matcherParam: matcherParam
  });
  return this;
};
/**
 * Remove an event handler
 * for elements that match
 * the selector, forever
 *
 * @param {string} [eventType] Remove handlers for events matching this type, considering the other parameters
 * @param {string} [selector] If this parameter is omitted, only handlers which match the other two will be removed
 * @param {function()} [handler] If this parameter is omitted, only handlers which match the previous two will be removed
 * @returns {Delegate} This method is chainable
 */


Delegate.prototype.off = function (eventType, selector, handler, useCapture) {
  var i;
  var listener;
  var listenerMap;
  var listenerList;
  var singleEventType; // Handler can be passed as
  // the second or third argument

  if (typeof selector === 'function') {
    useCapture = handler;
    handler = selector;
    selector = null;
  } // If useCapture not set, remove
  // all event listeners


  if (useCapture === undefined) {
    this.off(eventType, selector, handler, true);
    this.off(eventType, selector, handler, false);
    return this;
  }

  listenerMap = this.listenerMap[useCapture ? 1 : 0];

  if (!eventType) {
    for (singleEventType in listenerMap) {
      if (listenerMap.hasOwnProperty(singleEventType)) {
        this.off(singleEventType, selector, handler);
      }
    }

    return this;
  }

  listenerList = listenerMap[eventType];

  if (!listenerList || !listenerList.length) {
    return this;
  } // Remove only parameter matches
  // if specified


  for (i = listenerList.length - 1; i >= 0; i--) {
    listener = listenerList[i];

    if ((!selector || selector === listener.selector) && (!handler || handler === listener.handler)) {
      this._removedListeners.push(listener);

      listenerList.splice(i, 1);
    }
  } // All listeners removed


  if (!listenerList.length) {
    delete listenerMap[eventType]; // Remove the main handler

    if (this.rootElement) {
      this.rootElement.removeEventListener(eventType, this.handle, useCapture);
    }
  }

  return this;
};
/**
 * Handle an arbitrary event.
 *
 * @param {Event} event
 */


Delegate.prototype.handle = function (event) {
  var i;
  var l;
  var type = event.type;
  var root;
  var phase;
  var listener;
  var returned;
  var listenerList = [];
  var target;
  var eventIgnore = 'ftLabsDelegateIgnore';

  if (event[eventIgnore] === true) {
    return;
  }

  target = event.target; // Hardcode value of Node.TEXT_NODE
  // as not defined in IE8

  if (target.nodeType === 3) {
    target = target.parentNode;
  } // Handle SVG <use> elements in IE


  if (target.correspondingUseElement) {
    target = target.correspondingUseElement;
  }

  root = this.rootElement;
  phase = event.eventPhase || (event.target !== event.currentTarget ? 3 : 2); // eslint-disable-next-line default-case

  switch (phase) {
    case 1:
      //Event.CAPTURING_PHASE:
      listenerList = this.listenerMap[1][type];
      break;

    case 2:
      //Event.AT_TARGET:
      if (this.listenerMap[0] && this.listenerMap[0][type]) {
        listenerList = listenerList.concat(this.listenerMap[0][type]);
      }

      if (this.listenerMap[1] && this.listenerMap[1][type]) {
        listenerList = listenerList.concat(this.listenerMap[1][type]);
      }

      break;

    case 3:
      //Event.BUBBLING_PHASE:
      listenerList = this.listenerMap[0][type];
      break;
  }

  var toFire = []; // Need to continuously check
  // that the specific list is
  // still populated in case one
  // of the callbacks actually
  // causes the list to be destroyed.

  l = listenerList.length;

  while (target && l) {
    for (i = 0; i < l; i++) {
      listener = listenerList[i]; // Bail from this loop if
      // the length changed and
      // no more listeners are
      // defined between i and l.

      if (!listener) {
        break;
      }

      if (target.tagName && ["button", "input", "select", "textarea"].indexOf(target.tagName.toLowerCase()) > -1 && target.hasAttribute("disabled")) {
        // Remove things that have previously fired
        toFire = [];
      } // Check for match and fire
      // the event if there's one
      //
      // TODO:MCG:20120117: Need a way
      // to check if event#stopImmediatePropagation
      // was called. If so, break both loops.
      else if (listener.matcher.call(target, listener.matcherParam, target)) {
          toFire.push([event, target, listener]);
        }
    } // TODO:MCG:20120117: Need a way to
    // check if event#stopPropagation
    // was called. If so, break looping
    // through the DOM. Stop if the
    // delegation root has been reached


    if (target === root) {
      break;
    }

    l = listenerList.length; // Fall back to parentNode since SVG children have no parentElement in IE

    target = target.parentElement || target.parentNode; // Do not traverse up to document root when using parentNode, though

    if (target instanceof HTMLDocument) {
      break;
    }
  }

  var ret;

  for (i = 0; i < toFire.length; i++) {
    // Has it been removed during while the event function was fired
    if (this._removedListeners.indexOf(toFire[i][2]) > -1) {
      continue;
    }

    returned = this.fire.apply(this, toFire[i]); // Stop propagation to subsequent
    // callbacks if the callback returned
    // false

    if (returned === false) {
      toFire[i][0][eventIgnore] = true;
      toFire[i][0].preventDefault();
      ret = false;
      break;
    }
  }

  return ret;
};
/**
 * Fire a listener on a target.
 *
 * @param {Event} event
 * @param {Node} target
 * @param {Object} listener
 * @returns {boolean}
 */


Delegate.prototype.fire = function (event, target, listener) {
  return listener.handler.call(target, event, target);
};
/**
 * Check whether an element
 * matches a tag selector.
 *
 * Tags are NOT case-sensitive,
 * except in XML (and XML-based
 * languages such as XHTML).
 *
 * @param {string} tagName The tag name to test against
 * @param {Element} element The element to test with
 * @returns boolean
 */


function matchesTag(tagName, element) {
  return tagName.toLowerCase() === element.tagName.toLowerCase();
}
/**
 * Check whether an element
 * matches the root.
 *
 * @param {?String} selector In this case this is always passed through as null and not used
 * @param {Element} element The element to test with
 * @returns boolean
 */


function matchesRoot(selector, element) {
  if (this.rootElement === window) {
    return (// Match the outer document (dispatched from document)
      element === document || // The <html> element (dispatched from document.body or document.documentElement)
      element === document.documentElement || // Or the window itself (dispatched from window)
      element === window
    );
  }

  return this.rootElement === element;
}
/**
 * Check whether the ID of
 * the element in 'this'
 * matches the given ID.
 *
 * IDs are case-sensitive.
 *
 * @param {string} id The ID to test against
 * @param {Element} element The element to test with
 * @returns boolean
 */


function matchesId(id, element) {
  return id === element.id;
}
/**
 * Short hand for off()
 * and root(), ie both
 * with no parameters
 *
 * @return void
 */


Delegate.prototype.destroy = function () {
  this.off();
  this.root();
};

var _default = Delegate;
exports.default = _default;
module.exports = exports.default;
}(browser, browser.exports));

var Delegate = /*@__PURE__*/getDefaultExportFromCjs(browser.exports);

var pageTransition = (function () {
  var pageTransitionOverlay = document.querySelector("#page-transition-overlay");
  var animationDuration = 200;

  if (pageTransitionOverlay) {
    pageTransitionOverlay.classList.remove("skip-transition");
    setTimeout(function () {
      pageTransitionOverlay.classList.remove("active");
    }, 0);
    setTimeout(function () {
      // Prevent the theme editor from seeing this
      pageTransitionOverlay.classList.remove("active");
    }, animationDuration);
    var delegate = new Delegate(document.body);
    delegate.on("click", 'a[href]:not([href^="#"]):not(.no-transition):not([href^="mailto:"]):not([href^="tel:"]):not([target="_blank"])', onClickedToLeave);

    window.onpageshow = function (e) {
      if (e.persisted) {
        pageTransitionOverlay.classList.remove("active");
      }
    };
  }

  function onClickedToLeave(event, target) {
    // avoid interupting open-in-new-tab click
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault(); // Hint to browser to prerender destination

    var linkHint = document.createElement("link");
    linkHint.setAttribute("rel", "prerender");
    linkHint.setAttribute("href", target.href);
    document.head.appendChild(linkHint);
    setTimeout(function () {
      window.location.href = target.href;
    }, animationDuration);
    pageTransitionOverlay.classList.add("active");
  }
});

/*!
* tabbable 5.2.1
* @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
*/
var candidateSelectors = ['input', 'select', 'textarea', 'a[href]', 'button', '[tabindex]', 'audio[controls]', 'video[controls]', '[contenteditable]:not([contenteditable="false"])', 'details>summary:first-of-type', 'details'];
var candidateSelector = /* #__PURE__ */candidateSelectors.join(',');
var matches = typeof Element === 'undefined' ? function () {} : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

var getCandidates = function getCandidates(el, includeContainer, filter) {
  var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));

  if (includeContainer && matches.call(el, candidateSelector)) {
    candidates.unshift(el);
  }

  candidates = candidates.filter(filter);
  return candidates;
};

var isContentEditable = function isContentEditable(node) {
  return node.contentEditable === 'true';
};

var getTabindex = function getTabindex(node) {
  var tabindexAttr = parseInt(node.getAttribute('tabindex'), 10);

  if (!isNaN(tabindexAttr)) {
    return tabindexAttr;
  } // Browsers do not return `tabIndex` correctly for contentEditable nodes;
  // so if they don't have a tabindex attribute specifically set, assume it's 0.


  if (isContentEditable(node)) {
    return 0;
  } // in Chrome, <details/>, <audio controls/> and <video controls/> elements get a default
  //  `tabIndex` of -1 when the 'tabindex' attribute isn't specified in the DOM,
  //  yet they are still part of the regular tab order; in FF, they get a default
  //  `tabIndex` of 0; since Chrome still puts those elements in the regular tab
  //  order, consider their tab index to be 0.


  if ((node.nodeName === 'AUDIO' || node.nodeName === 'VIDEO' || node.nodeName === 'DETAILS') && node.getAttribute('tabindex') === null) {
    return 0;
  }

  return node.tabIndex;
};

var sortOrderedTabbables = function sortOrderedTabbables(a, b) {
  return a.tabIndex === b.tabIndex ? a.documentOrder - b.documentOrder : a.tabIndex - b.tabIndex;
};

var isInput = function isInput(node) {
  return node.tagName === 'INPUT';
};

var isHiddenInput = function isHiddenInput(node) {
  return isInput(node) && node.type === 'hidden';
};

var isDetailsWithSummary = function isDetailsWithSummary(node) {
  var r = node.tagName === 'DETAILS' && Array.prototype.slice.apply(node.children).some(function (child) {
    return child.tagName === 'SUMMARY';
  });
  return r;
};

var getCheckedRadio = function getCheckedRadio(nodes, form) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].checked && nodes[i].form === form) {
      return nodes[i];
    }
  }
};

var isTabbableRadio = function isTabbableRadio(node) {
  if (!node.name) {
    return true;
  }

  var radioScope = node.form || node.ownerDocument;

  var queryRadios = function queryRadios(name) {
    return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
  };

  var radioSet;

  if (typeof window !== 'undefined' && typeof window.CSS !== 'undefined' && typeof window.CSS.escape === 'function') {
    radioSet = queryRadios(window.CSS.escape(node.name));
  } else {
    try {
      radioSet = queryRadios(node.name);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s', err.message);
      return false;
    }
  }

  var checked = getCheckedRadio(radioSet, node.form);
  return !checked || checked === node;
};

var isRadio = function isRadio(node) {
  return isInput(node) && node.type === 'radio';
};

var isNonTabbableRadio = function isNonTabbableRadio(node) {
  return isRadio(node) && !isTabbableRadio(node);
};

var isHidden = function isHidden(node, displayCheck) {
  if (getComputedStyle(node).visibility === 'hidden') {
    return true;
  }

  var isDirectSummary = matches.call(node, 'details>summary:first-of-type');
  var nodeUnderDetails = isDirectSummary ? node.parentElement : node;

  if (matches.call(nodeUnderDetails, 'details:not([open]) *')) {
    return true;
  }

  if (!displayCheck || displayCheck === 'full') {
    while (node) {
      if (getComputedStyle(node).display === 'none') {
        return true;
      }

      node = node.parentElement;
    }
  } else if (displayCheck === 'non-zero-area') {
    var _node$getBoundingClie = node.getBoundingClientRect(),
        width = _node$getBoundingClie.width,
        height = _node$getBoundingClie.height;

    return width === 0 && height === 0;
  }

  return false;
}; // form fields (nested) inside a disabled fieldset are not focusable/tabbable
//  unless they are in the _first_ <legend> element of the top-most disabled
//  fieldset


var isDisabledFromFieldset = function isDisabledFromFieldset(node) {
  if (isInput(node) || node.tagName === 'SELECT' || node.tagName === 'TEXTAREA' || node.tagName === 'BUTTON') {
    var parentNode = node.parentElement;

    while (parentNode) {
      if (parentNode.tagName === 'FIELDSET' && parentNode.disabled) {
        // look for the first <legend> as an immediate child of the disabled
        //  <fieldset>: if the node is in that legend, it'll be enabled even
        //  though the fieldset is disabled; otherwise, the node is in a
        //  secondary/subsequent legend, or somewhere else within the fieldset
        //  (however deep nested) and it'll be disabled
        for (var i = 0; i < parentNode.children.length; i++) {
          var child = parentNode.children.item(i);

          if (child.tagName === 'LEGEND') {
            if (child.contains(node)) {
              return false;
            } // the node isn't in the first legend (in doc order), so no matter
            //  where it is now, it'll be disabled


            return true;
          }
        } // the node isn't in a legend, so no matter where it is now, it'll be disabled


        return true;
      }

      parentNode = parentNode.parentElement;
    }
  } // else, node's tabbable/focusable state should not be affected by a fieldset's
  //  enabled/disabled state


  return false;
};

var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable(options, node) {
  if (node.disabled || isHiddenInput(node) || isHidden(node, options.displayCheck) || // For a details element with a summary, the summary element gets the focus
  isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
    return false;
  }

  return true;
};

var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable(options, node) {
  if (!isNodeMatchingSelectorFocusable(options, node) || isNonTabbableRadio(node) || getTabindex(node) < 0) {
    return false;
  }

  return true;
};

var tabbable = function tabbable(el, options) {
  options = options || {};
  var regularTabbables = [];
  var orderedTabbables = [];
  var candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
  candidates.forEach(function (candidate, i) {
    var candidateTabindex = getTabindex(candidate);

    if (candidateTabindex === 0) {
      regularTabbables.push(candidate);
    } else {
      orderedTabbables.push({
        documentOrder: i,
        tabIndex: candidateTabindex,
        node: candidate
      });
    }
  });
  var tabbableNodes = orderedTabbables.sort(sortOrderedTabbables).map(function (a) {
    return a.node;
  }).concat(regularTabbables);
  return tabbableNodes;
};

var focusableCandidateSelector = /* #__PURE__ */candidateSelectors.concat('iframe').join(',');

var isFocusable = function isFocusable(node, options) {
  options = options || {};

  if (!node) {
    throw new Error('No node provided');
  }

  if (matches.call(node, focusableCandidateSelector) === false) {
    return false;
  }

  return isNodeMatchingSelectorFocusable(options, node);
};

/*!
* focus-trap 6.7.1
* @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
*/

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);

    if (enumerableOnly) {
      symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
    }

    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var activeFocusTraps = function () {
  var trapQueue = [];
  return {
    activateTrap: function activateTrap(trap) {
      if (trapQueue.length > 0) {
        var activeTrap = trapQueue[trapQueue.length - 1];

        if (activeTrap !== trap) {
          activeTrap.pause();
        }
      }

      var trapIndex = trapQueue.indexOf(trap);

      if (trapIndex === -1) {
        trapQueue.push(trap);
      } else {
        // move this existing trap to the front of the queue
        trapQueue.splice(trapIndex, 1);
        trapQueue.push(trap);
      }
    },
    deactivateTrap: function deactivateTrap(trap) {
      var trapIndex = trapQueue.indexOf(trap);

      if (trapIndex !== -1) {
        trapQueue.splice(trapIndex, 1);
      }

      if (trapQueue.length > 0) {
        trapQueue[trapQueue.length - 1].unpause();
      }
    }
  };
}();

var isSelectableInput = function isSelectableInput(node) {
  return node.tagName && node.tagName.toLowerCase() === 'input' && typeof node.select === 'function';
};

var isEscapeEvent = function isEscapeEvent(e) {
  return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
};

var isTabEvent = function isTabEvent(e) {
  return e.key === 'Tab' || e.keyCode === 9;
};

var delay = function delay(fn) {
  return setTimeout(fn, 0);
}; // Array.find/findIndex() are not supported on IE; this replicates enough
//  of Array.findIndex() for our needs


var findIndex = function findIndex(arr, fn) {
  var idx = -1;
  arr.every(function (value, i) {
    if (fn(value)) {
      idx = i;
      return false; // break
    }

    return true; // next
  });
  return idx;
};
/**
 * Get an option's value when it could be a plain value, or a handler that provides
 *  the value.
 * @param {*} value Option's value to check.
 * @param {...*} [params] Any parameters to pass to the handler, if `value` is a function.
 * @returns {*} The `value`, or the handler's returned value.
 */


var valueOrHandler = function valueOrHandler(value) {
  for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    params[_key - 1] = arguments[_key];
  }

  return typeof value === 'function' ? value.apply(void 0, params) : value;
};

var getActualTarget = function getActualTarget(event) {
  // NOTE: If the trap is _inside_ a shadow DOM, event.target will always be the
  //  shadow host. However, event.target.composedPath() will be an array of
  //  nodes "clicked" from inner-most (the actual element inside the shadow) to
  //  outer-most (the host HTML document). If we have access to composedPath(),
  //  then use its first element; otherwise, fall back to event.target (and
  //  this only works for an _open_ shadow DOM; otherwise,
  //  composedPath()[0] === event.target always).
  return event.target.shadowRoot && typeof event.composedPath === 'function' ? event.composedPath()[0] : event.target;
};

var createFocusTrap = function createFocusTrap(elements, userOptions) {
  var doc = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.document) || document;

  var config = _objectSpread2({
    returnFocusOnDeactivate: true,
    escapeDeactivates: true,
    delayInitialFocus: true
  }, userOptions);

  var state = {
    // @type {Array<HTMLElement>}
    containers: [],
    // list of objects identifying the first and last tabbable nodes in all containers/groups in
    //  the trap
    // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
    //  is active, but the trap should never get to a state where there isn't at least one group
    //  with at least one tabbable node in it (that would lead to an error condition that would
    //  result in an error being thrown)
    // @type {Array<{ container: HTMLElement, firstTabbableNode: HTMLElement|null, lastTabbableNode: HTMLElement|null }>}
    tabbableGroups: [],
    nodeFocusedBeforeActivation: null,
    mostRecentlyFocusedNode: null,
    active: false,
    paused: false,
    // timer ID for when delayInitialFocus is true and initial focus in this trap
    //  has been delayed during activation
    delayInitialFocusTimer: undefined
  };
  var trap; // eslint-disable-line prefer-const -- some private functions reference it, and its methods reference private functions, so we must declare here and define later

  var getOption = function getOption(configOverrideOptions, optionName, configOptionName) {
    return configOverrideOptions && configOverrideOptions[optionName] !== undefined ? configOverrideOptions[optionName] : config[configOptionName || optionName];
  };

  var containersContain = function containersContain(element) {
    return !!(element && state.containers.some(function (container) {
      return container.contains(element);
    }));
  };
  /**
   * Gets the node for the given option, which is expected to be an option that
   *  can be either a DOM node, a string that is a selector to get a node, `false`
   *  (if a node is explicitly NOT given), or a function that returns any of these
   *  values.
   * @param {string} optionName
   * @returns {undefined | false | HTMLElement | SVGElement} Returns
   *  `undefined` if the option is not specified; `false` if the option
   *  resolved to `false` (node explicitly not given); otherwise, the resolved
   *  DOM node.
   * @throws {Error} If the option is set, not `false`, and is not, or does not
   *  resolve to a node.
   */


  var getNodeForOption = function getNodeForOption(optionName) {
    var optionValue = config[optionName];

    if (typeof optionValue === 'function') {
      for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        params[_key2 - 1] = arguments[_key2];
      }

      optionValue = optionValue.apply(void 0, params);
    }

    if (!optionValue) {
      if (optionValue === undefined || optionValue === false) {
        return optionValue;
      } // else, empty string (invalid), null (invalid), 0 (invalid)


      throw new Error("`".concat(optionName, "` was specified but was not a node, or did not return a node"));
    }

    var node = optionValue; // could be HTMLElement, SVGElement, or non-empty string at this point

    if (typeof optionValue === 'string') {
      node = doc.querySelector(optionValue); // resolve to node, or null if fails

      if (!node) {
        throw new Error("`".concat(optionName, "` as selector refers to no known node"));
      }
    }

    return node;
  };

  var getInitialFocusNode = function getInitialFocusNode() {
    var node = getNodeForOption('initialFocus'); // false explicitly indicates we want no initialFocus at all

    if (node === false) {
      return false;
    }

    if (node === undefined) {
      // option not specified: use fallback options
      if (containersContain(doc.activeElement)) {
        node = doc.activeElement;
      } else {
        var firstTabbableGroup = state.tabbableGroups[0];
        var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode; // NOTE: `fallbackFocus` option function cannot return `false` (not supported)

        node = firstTabbableNode || getNodeForOption('fallbackFocus');
      }
    }

    if (!node) {
      throw new Error('Your focus-trap needs to have at least one focusable element');
    }

    return node;
  };

  var updateTabbableNodes = function updateTabbableNodes() {
    state.tabbableGroups = state.containers.map(function (container) {
      var tabbableNodes = tabbable(container);

      if (tabbableNodes.length > 0) {
        return {
          container: container,
          firstTabbableNode: tabbableNodes[0],
          lastTabbableNode: tabbableNodes[tabbableNodes.length - 1]
        };
      }

      return undefined;
    }).filter(function (group) {
      return !!group;
    }); // remove groups with no tabbable nodes
    // throw if no groups have tabbable nodes and we don't have a fallback focus node either

    if (state.tabbableGroups.length <= 0 && !getNodeForOption('fallbackFocus') // returning false not supported for this option
    ) {
      throw new Error('Your focus-trap must have at least one container with at least one tabbable node in it at all times');
    }
  };

  var tryFocus = function tryFocus(node) {
    if (node === false) {
      return;
    }

    if (node === doc.activeElement) {
      return;
    }

    if (!node || !node.focus) {
      tryFocus(getInitialFocusNode());
      return;
    }

    node.focus({
      preventScroll: !!config.preventScroll
    });
    state.mostRecentlyFocusedNode = node;

    if (isSelectableInput(node)) {
      node.select();
    }
  };

  var getReturnFocusNode = function getReturnFocusNode(previousActiveElement) {
    var node = getNodeForOption('setReturnFocus', previousActiveElement);
    return node ? node : node === false ? false : previousActiveElement;
  }; // This needs to be done on mousedown and touchstart instead of click
  // so that it precedes the focus event.


  var checkPointerDown = function checkPointerDown(e) {
    var target = getActualTarget(e);

    if (containersContain(target)) {
      // allow the click since it ocurred inside the trap
      return;
    }

    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      // immediately deactivate the trap
      trap.deactivate({
        // if, on deactivation, we should return focus to the node originally-focused
        //  when the trap was activated (or the configured `setReturnFocus` node),
        //  then assume it's also OK to return focus to the outside node that was
        //  just clicked, causing deactivation, as long as that node is focusable;
        //  if it isn't focusable, then return focus to the original node focused
        //  on activation (or the configured `setReturnFocus` node)
        // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
        //  which will result in the outside click setting focus to the node
        //  that was clicked, whether it's focusable or not; by setting
        //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
        //  on activation (or the configured `setReturnFocus` node)
        returnFocus: config.returnFocusOnDeactivate && !isFocusable(target)
      });
      return;
    } // This is needed for mobile devices.
    // (If we'll only let `click` events through,
    // then on mobile they will be blocked anyways if `touchstart` is blocked.)


    if (valueOrHandler(config.allowOutsideClick, e)) {
      // allow the click outside the trap to take place
      return;
    } // otherwise, prevent the click


    e.preventDefault();
  }; // In case focus escapes the trap for some strange reason, pull it back in.


  var checkFocusIn = function checkFocusIn(e) {
    var target = getActualTarget(e);
    var targetContained = containersContain(target); // In Firefox when you Tab out of an iframe the Document is briefly focused.

    if (targetContained || target instanceof Document) {
      if (targetContained) {
        state.mostRecentlyFocusedNode = target;
      }
    } else {
      // escaped! pull it back in to where it just left
      e.stopImmediatePropagation();
      tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
    }
  }; // Hijack Tab events on the first and last focusable nodes of the trap,
  // in order to prevent focus from escaping. If it escapes for even a
  // moment it can end up scrolling the page and causing confusion so we
  // kind of need to capture the action at the keydown phase.


  var checkTab = function checkTab(e) {
    var target = getActualTarget(e);
    updateTabbableNodes();
    var destinationNode = null;

    if (state.tabbableGroups.length > 0) {
      // make sure the target is actually contained in a group
      // NOTE: the target may also be the container itself if it's tabbable
      //  with tabIndex='-1' and was given initial focus
      var containerIndex = findIndex(state.tabbableGroups, function (_ref) {
        var container = _ref.container;
        return container.contains(target);
      });

      if (containerIndex < 0) {
        // target not found in any group: quite possible focus has escaped the trap,
        //  so bring it back in to...
        if (e.shiftKey) {
          // ...the last node in the last group
          destinationNode = state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
        } else {
          // ...the first node in the first group
          destinationNode = state.tabbableGroups[0].firstTabbableNode;
        }
      } else if (e.shiftKey) {
        // REVERSE
        // is the target the first tabbable node in a group?
        var startOfGroupIndex = findIndex(state.tabbableGroups, function (_ref2) {
          var firstTabbableNode = _ref2.firstTabbableNode;
          return target === firstTabbableNode;
        });

        if (startOfGroupIndex < 0 && state.tabbableGroups[containerIndex].container === target) {
          // an exception case where the target is the container itself, in which
          //  case, we should handle shift+tab as if focus were on the container's
          //  first tabbable node, and go to the last tabbable node of the LAST group
          startOfGroupIndex = containerIndex;
        }

        if (startOfGroupIndex >= 0) {
          // YES: then shift+tab should go to the last tabbable node in the
          //  previous group (and wrap around to the last tabbable node of
          //  the LAST group if it's the first tabbable node of the FIRST group)
          var destinationGroupIndex = startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
          var destinationGroup = state.tabbableGroups[destinationGroupIndex];
          destinationNode = destinationGroup.lastTabbableNode;
        }
      } else {
        // FORWARD
        // is the target the last tabbable node in a group?
        var lastOfGroupIndex = findIndex(state.tabbableGroups, function (_ref3) {
          var lastTabbableNode = _ref3.lastTabbableNode;
          return target === lastTabbableNode;
        });

        if (lastOfGroupIndex < 0 && state.tabbableGroups[containerIndex].container === target) {
          // an exception case where the target is the container itself, in which
          //  case, we should handle tab as if focus were on the container's
          //  last tabbable node, and go to the first tabbable node of the FIRST group
          lastOfGroupIndex = containerIndex;
        }

        if (lastOfGroupIndex >= 0) {
          // YES: then tab should go to the first tabbable node in the next
          //  group (and wrap around to the first tabbable node of the FIRST
          //  group if it's the last tabbable node of the LAST group)
          var _destinationGroupIndex = lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;

          var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
          destinationNode = _destinationGroup.firstTabbableNode;
        }
      }
    } else {
      // NOTE: the fallbackFocus option does not support returning false to opt-out
      destinationNode = getNodeForOption('fallbackFocus');
    }

    if (destinationNode) {
      e.preventDefault();
      tryFocus(destinationNode);
    } // else, let the browser take care of [shift+]tab and move the focus

  };

  var checkKey = function checkKey(e) {
    if (isEscapeEvent(e) && valueOrHandler(config.escapeDeactivates, e) !== false) {
      e.preventDefault();
      trap.deactivate();
      return;
    }

    if (isTabEvent(e)) {
      checkTab(e);
      return;
    }
  };

  var checkClick = function checkClick(e) {
    if (valueOrHandler(config.clickOutsideDeactivates, e)) {
      return;
    }

    var target = getActualTarget(e);

    if (containersContain(target)) {
      return;
    }

    if (valueOrHandler(config.allowOutsideClick, e)) {
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();
  }; //
  // EVENT LISTENERS
  //


  var addListeners = function addListeners() {
    if (!state.active) {
      return;
    } // There can be only one listening focus trap at a time


    activeFocusTraps.activateTrap(trap); // Delay ensures that the focused element doesn't capture the event
    // that caused the focus trap activation.

    state.delayInitialFocusTimer = config.delayInitialFocus ? delay(function () {
      tryFocus(getInitialFocusNode());
    }) : tryFocus(getInitialFocusNode());
    doc.addEventListener('focusin', checkFocusIn, true);
    doc.addEventListener('mousedown', checkPointerDown, {
      capture: true,
      passive: false
    });
    doc.addEventListener('touchstart', checkPointerDown, {
      capture: true,
      passive: false
    });
    doc.addEventListener('click', checkClick, {
      capture: true,
      passive: false
    });
    doc.addEventListener('keydown', checkKey, {
      capture: true,
      passive: false
    });
    return trap;
  };

  var removeListeners = function removeListeners() {
    if (!state.active) {
      return;
    }

    doc.removeEventListener('focusin', checkFocusIn, true);
    doc.removeEventListener('mousedown', checkPointerDown, true);
    doc.removeEventListener('touchstart', checkPointerDown, true);
    doc.removeEventListener('click', checkClick, true);
    doc.removeEventListener('keydown', checkKey, true);
    return trap;
  }; //
  // TRAP DEFINITION
  //


  trap = {
    activate: function activate(activateOptions) {
      if (state.active) {
        return this;
      }

      var onActivate = getOption(activateOptions, 'onActivate');
      var onPostActivate = getOption(activateOptions, 'onPostActivate');
      var checkCanFocusTrap = getOption(activateOptions, 'checkCanFocusTrap');

      if (!checkCanFocusTrap) {
        updateTabbableNodes();
      }

      state.active = true;
      state.paused = false;
      state.nodeFocusedBeforeActivation = doc.activeElement;

      if (onActivate) {
        onActivate();
      }

      var finishActivation = function finishActivation() {
        if (checkCanFocusTrap) {
          updateTabbableNodes();
        }

        addListeners();

        if (onPostActivate) {
          onPostActivate();
        }
      };

      if (checkCanFocusTrap) {
        checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
        return this;
      }

      finishActivation();
      return this;
    },
    deactivate: function deactivate(deactivateOptions) {
      if (!state.active) {
        return this;
      }

      clearTimeout(state.delayInitialFocusTimer); // noop if undefined

      state.delayInitialFocusTimer = undefined;
      removeListeners();
      state.active = false;
      state.paused = false;
      activeFocusTraps.deactivateTrap(trap);
      var onDeactivate = getOption(deactivateOptions, 'onDeactivate');
      var onPostDeactivate = getOption(deactivateOptions, 'onPostDeactivate');
      var checkCanReturnFocus = getOption(deactivateOptions, 'checkCanReturnFocus');

      if (onDeactivate) {
        onDeactivate();
      }

      var returnFocus = getOption(deactivateOptions, 'returnFocus', 'returnFocusOnDeactivate');

      var finishDeactivation = function finishDeactivation() {
        delay(function () {
          if (returnFocus) {
            tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
          }

          if (onPostDeactivate) {
            onPostDeactivate();
          }
        });
      };

      if (returnFocus && checkCanReturnFocus) {
        checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(finishDeactivation, finishDeactivation);
        return this;
      }

      finishDeactivation();
      return this;
    },
    pause: function pause() {
      if (state.paused || !state.active) {
        return this;
      }

      state.paused = true;
      removeListeners();
      return this;
    },
    unpause: function unpause() {
      if (!state.paused || !state.active) {
        return this;
      }

      state.paused = false;
      updateTabbableNodes();
      addListeners();
      return this;
    },
    updateContainerElements: function updateContainerElements(containerElements) {
      var elementsAsArray = [].concat(containerElements).filter(Boolean);
      state.containers = elementsAsArray.map(function (element) {
        return typeof element === 'string' ? doc.querySelector(element) : element;
      });

      if (state.active) {
        updateTabbableNodes();
      }

      return this;
    }
  }; // initialize container elements

  trap.updateContainerElements(elements);
  return trap;
};

function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Older browsers don't support event options, feature detect it.

// Adopted and modified solution from Bohdan Didukh (2017)
// https://stackoverflow.com/questions/41594997/ios-10-safari-prevent-scrolling-behind-a-fixed-overlay-and-maintain-scroll-posi

var hasPassiveEvents = false;
if (typeof window !== 'undefined') {
  var passiveTestOptions = {
    get passive() {
      hasPassiveEvents = true;
      return undefined;
    }
  };
  window.addEventListener('testPassive', null, passiveTestOptions);
  window.removeEventListener('testPassive', null, passiveTestOptions);
}

var isIosDevice = typeof window !== 'undefined' && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);


var locks = [];
var documentListenerAdded = false;
var initialClientY = -1;
var previousBodyOverflowSetting = void 0;
var previousBodyPaddingRight = void 0;

// returns true if `el` should be allowed to receive touchmove events.
var allowTouchMove = function allowTouchMove(el) {
  return locks.some(function (lock) {
    if (lock.options.allowTouchMove && lock.options.allowTouchMove(el)) {
      return true;
    }

    return false;
  });
};

var preventDefault$1 = function preventDefault(rawEvent) {
  var e = rawEvent || window.event;

  // For the case whereby consumers adds a touchmove event listener to document.
  // Recall that we do document.addEventListener('touchmove', preventDefault, { passive: false })
  // in disableBodyScroll - so if we provide this opportunity to allowTouchMove, then
  // the touchmove event on document will break.
  if (allowTouchMove(e.target)) {
    return true;
  }

  // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom).
  if (e.touches.length > 1) return true;

  if (e.preventDefault) e.preventDefault();

  return false;
};

var setOverflowHidden = function setOverflowHidden(options) {
  // If previousBodyPaddingRight is already set, don't set it again.
  if (previousBodyPaddingRight === undefined) {
    var _reserveScrollBarGap = !!options && options.reserveScrollBarGap === true;
    var scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

    if (_reserveScrollBarGap && scrollBarGap > 0) {
      previousBodyPaddingRight = document.body.style.paddingRight;
      document.body.style.paddingRight = scrollBarGap + 'px';
    }
  }

  // If previousBodyOverflowSetting is already set, don't set it again.
  if (previousBodyOverflowSetting === undefined) {
    previousBodyOverflowSetting = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
};

var restoreOverflowSetting = function restoreOverflowSetting() {
  if (previousBodyPaddingRight !== undefined) {
    document.body.style.paddingRight = previousBodyPaddingRight;

    // Restore previousBodyPaddingRight to undefined so setOverflowHidden knows it
    // can be set again.
    previousBodyPaddingRight = undefined;
  }

  if (previousBodyOverflowSetting !== undefined) {
    document.body.style.overflow = previousBodyOverflowSetting;

    // Restore previousBodyOverflowSetting to undefined
    // so setOverflowHidden knows it can be set again.
    previousBodyOverflowSetting = undefined;
  }
};

// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
var isTargetElementTotallyScrolled = function isTargetElementTotallyScrolled(targetElement) {
  return targetElement ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight : false;
};

var handleScroll = function handleScroll(event, targetElement) {
  var clientY = event.targetTouches[0].clientY - initialClientY;

  if (allowTouchMove(event.target)) {
    return false;
  }

  if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
    // element is at the top of its scroll.
    return preventDefault$1(event);
  }

  if (isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
    // element is at the bottom of its scroll.
    return preventDefault$1(event);
  }

  event.stopPropagation();
  return true;
};

var disableBodyScroll = function disableBodyScroll(targetElement, options) {
  // targetElement must be provided
  if (!targetElement) {
    // eslint-disable-next-line no-console
    console.error('disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.');
    return;
  }

  // disableBodyScroll must not have been called on this targetElement before
  if (locks.some(function (lock) {
    return lock.targetElement === targetElement;
  })) {
    return;
  }

  var lock = {
    targetElement: targetElement,
    options: options || {}
  };

  locks = [].concat(_toConsumableArray$1(locks), [lock]);

  if (isIosDevice) {
    targetElement.ontouchstart = function (event) {
      if (event.targetTouches.length === 1) {
        // detect single touch.
        initialClientY = event.targetTouches[0].clientY;
      }
    };
    targetElement.ontouchmove = function (event) {
      if (event.targetTouches.length === 1) {
        // detect single touch.
        handleScroll(event, targetElement);
      }
    };

    if (!documentListenerAdded) {
      document.addEventListener('touchmove', preventDefault$1, hasPassiveEvents ? { passive: false } : undefined);
      documentListenerAdded = true;
    }
  } else {
    setOverflowHidden(options);
  }
};

var enableBodyScroll = function enableBodyScroll(targetElement) {
  if (!targetElement) {
    // eslint-disable-next-line no-console
    console.error('enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.');
    return;
  }

  locks = locks.filter(function (lock) {
    return lock.targetElement !== targetElement;
  });

  if (isIosDevice) {
    targetElement.ontouchstart = null;
    targetElement.ontouchmove = null;

    if (documentListenerAdded && locks.length === 0) {
      document.removeEventListener('touchmove', preventDefault$1, hasPassiveEvents ? { passive: false } : undefined);
      documentListenerAdded = false;
    }
  } else if (!locks.length) {
    restoreOverflowSetting();
  }
};

var n$1=function(n){if("object"!=typeof(t=n)||Array.isArray(t))throw "state should be an object";var t;},t$2=function(n,t,e,c){return (r=n,r.reduce(function(n,t,e){return n.indexOf(t)>-1?n:n.concat(t)},[])).reduce(function(n,e){return n.concat(t[e]||[])},[]).map(function(n){return n(e,c)});var r;},e$2=a(),c=e$2.on,r$2=e$2.emit,o$1=e$2.hydrate;function a(e){void 0===e&&(e={});var c={};return {getState:function(){return Object.assign({},e)},hydrate:function(r){return n$1(r),Object.assign(e,r),function(){var n=["*"].concat(Object.keys(r));t$2(n,c,e);}},on:function(n,t){return (n=[].concat(n)).map(function(n){return c[n]=(c[n]||[]).concat(t)}),function(){return n.map(function(n){return c[n].splice(c[n].indexOf(t),1)})}},emit:function(r,o,u){var a=("*"===r?[]:["*"]).concat(r);(o="function"==typeof o?o(e):o)&&(n$1(o),Object.assign(e,o),a=a.concat(Object.keys(o))),t$2(a,c,e,u);}}}

function wrapIframes () {
  var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  elements.forEach(function (el) {
    var wrapper = document.createElement("div");
    wrapper.classList.add("rte__iframe");
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    el.src = el.src;
  });
}

function wrapTables () {
  var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  elements.forEach(function (el) {
    var wrapper = document.createElement("div");
    wrapper.classList.add("rte__table-wrapper");
    wrapper.tabIndex = 0;
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  });
}

var classes$z = {
  visible: "is-visible",
  active: "active",
  fixed: "is-fixed"
};
var selectors$1n = {
  closeBtn: "[data-modal-close]",
  wash: ".modal__wash",
  modalContent: ".modal__content"
};

var modal = function modal(node) {
  var focusTrap = createFocusTrap(node, {
    allowOutsideClick: true
  });
  var modalContent = n$2(selectors$1n.modalContent, node);
  var delegate = new Delegate(document);
  delegate.on("click", selectors$1n.wash, function () {
    return _close();
  });
  var events = [e$3(n$2(selectors$1n.closeBtn, node), "click", function (e) {
    e.preventDefault();

    _close();
  }), e$3(node, "keydown", function (_ref) {
    var keyCode = _ref.keyCode;
    if (keyCode === 27) _close();
  }), c("modal:open", function (state, _ref2) {
    var modalContent = _ref2.modalContent,
        _ref2$narrow = _ref2.narrow,
        narrow = _ref2$narrow === void 0 ? false : _ref2$narrow;
    l(node, "modal--narrow", narrow);

    _renderModalContent(modalContent);

    _open();
  })];

  var _renderModalContent = function _renderModalContent(content) {
    var clonedContent = content.cloneNode(true);
    modalContent.innerHTML = "";
    modalContent.appendChild(clonedContent);
    wrapIframes(t$3("iframe", modalContent));
    wrapTables(t$3("table", modalContent));
  };

  var _open = function _open() {
    // Due to this component being shared between templates we have to
    // animate around it being fixed to the window
    u$1(node, classes$z.active);
    focusTrap.activate();
    disableBodyScroll(node, {
      allowTouchMove: function allowTouchMove(el) {
        while (el && el !== document.body) {
          if (el.getAttribute("data-scroll-lock-ignore") !== null) {
            return true;
          }

          el = el.parentNode;
        }
      },
      reserveScrollBarGap: true
    });
  };

  var _close = function _close() {
    focusTrap.deactivate();
    i$1(node, classes$z.active);
    enableBodyScroll(node);
    setTimeout(function () {
      modalContent.innerHTML = "";
    }, 300);
  };

  var unload = function unload() {
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  };

  return {
    unload: unload
  };
};

var AnimateProductItem = (function (items) {
  var events = [];
  items.forEach(function (item) {
    var imageOne = n$2(".product-item__image--one", item);
    var imageTwo = n$2(".product-item__image--two", item);
    t$3(".product-item-options__list", item);
    events.push(e$3(item, "mouseenter", function () {
      enterItemAnimation(imageOne, imageTwo);
    }));
    events.push(e$3(item, "mouseleave", function () {
      leaveItemAnimation(imageOne, imageTwo);
    }));
  });

  function enterItemAnimation(imageOne, imageTwo, optionsElements) {
    if (imageTwo) {
      u$1(imageTwo, "active");
    }
  }

  function leaveItemAnimation(imageOne, imageTwo, optionsElements) {
    if (imageTwo) {
      i$1(imageTwo, "active");
    }
  }

  return {
    destroy: function destroy() {
      events.forEach(function (unsubscribe) {
        return unsubscribe();
      });
    }
  };
});

function _typeof(obj) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function getMediaQuery(querySize) {
  var value = getComputedStyle(document.documentElement).getPropertyValue("--media-".concat(querySize));

  if (!value) {
    console.warn("Invalid querySize passed to getMediaQuery");
    return false;
  }

  return value;
}

var intersectionWatcher = (function (node) {
  var instant = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var margin = window.matchMedia(getMediaQuery("above-720")).matches ? 200 : 100;
  var threshold = 0;

  if (!instant) {
    threshold = Math.min(margin / node.offsetHeight, 0.5);
  }

  var observer = new IntersectionObserver(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 1),
        visible = _ref2[0].isIntersecting;

    if (visible) {
      u$1(node, "is-visible");
      observer.disconnect();
    }
  }, {
    threshold: threshold
  });
  observer.observe(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.disconnect();
    }
  };
});

/**
 * delayOffset takes an array of selectors and sets the `--delay-offset-multiplier` variable in the correct order
 * @param {node} element The section element
 * @param {items} array Array of animation items
 */

var delayOffset = (function (node, items) {
  var offsetStart = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var delayOffset = offsetStart;
  items.forEach(function (selector) {
    var items = t$3(selector, node);
    items.forEach(function (item) {
      item.style.setProperty("--delay-offset-multiplier", delayOffset);
      delayOffset++;
    });
  });
});

var shouldAnimate = (function (node) {
  return a$1(node, "animation") && !a$1(document.documentElement, "prefers-reduced-motion");
});

var selectors$1m = {
  sectionBlockItems: ".section-blocks > *",
  image: ".image-with-text__image .image__img",
  imageSmall: ".image-with-text__small-image .image__img",
  imageCaption: ".image-with-text__image-caption"
};
var animateImageWithText = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$1m.image, selectors$1m.imageSmall, selectors$1m.imageCaption]);
  delayOffset(node, [selectors$1m.sectionBlockItems], 6);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$1l = {
  sectionBlockItems: ".section-blocks > *",
  image: ".image-with-text-split__image .image__img"
};
var animateImageWithTextSplit = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$1l.image]);
  delayOffset(node, [selectors$1l.sectionBlockItems], 6);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$1k = {
  content: ".testimonials__item-content > *",
  image: ".testimonials__item-product-image",
  imageCaption: ".testimonials__item-product-title",
  item: ".animation--item"
};
var classes$y = {
  imageRight: "testimonials__item--image-placement-right"
};
var animateTestimonials = (function (node) {
  var delayItems = []; // Create an array of selectors for the animation elements
  // in the order they should animate in

  if (a$1(node, classes$y.imageRight)) {
    delayItems.push(selectors$1k.content);
    delayItems.push(selectors$1k.image);
    delayItems.push(selectors$1k.imageCaption);
  } else {
    delayItems.push(selectors$1k.image);
    delayItems.push(selectors$1k.imageCaption);
    delayItems.push(selectors$1k.content);
  } // Add the animation delay offset variables


  delayOffset(node, delayItems, 2);
  delayOffset(node, [selectors$1k.item]);
});

var selectors$1j = {
  content: ".quote__item-inner > *"
};
var animateQuotes = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$1j.content]);
});

var selectors$1i = {
  sectionBlockItems: ".animation--section-introduction > *",
  controls: ".animation--controls",
  items: ".animation--item"
};
var animateListSlider = (function (node) {
  var delayItems = [selectors$1i.sectionBlockItems, selectors$1i.controls, selectors$1i.items]; // Add the animation delay offset variables

  delayOffset(node, delayItems);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$1h = {
  introductionItems: ".section-introduction > *",
  image: ".complete-the-look__image-wrapper .image__img",
  product: ".complete-the-look__product",
  products: ".complete-the-look__products"
};
var classes$x = {
  imageLeft: "complete-the-look--image-left"
};
var animateCompleteTheLook = (function (node) {
  var delayItems = [];
  delayItems.push(selectors$1h.introductionItems); // Create an array of selectors for the animation elements
  // in the order they should animate in

  if (a$1(node, classes$x.imageLeft) || window.matchMedia(getMediaQuery("below-720")).matches) {
    delayItems.push(selectors$1h.image);
    delayItems.push(selectors$1h.products);
    delayItems.push(selectors$1h.product);
  } else {
    delayItems.push(selectors$1h.products);
    delayItems.push(selectors$1h.product);
    delayItems.push(selectors$1h.image);
  } // Add the animation delay offset variables


  delayOffset(node, delayItems);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer.destroy();
    }
  };
});

var selectors$1g = {
  introductionItems: ".section-introduction > *",
  image: ".shoppable-image__image-wrapper .image__img",
  hotspots: ".shoppable-item__hotspot-wrapper"
};
var animateShoppableImage = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$1g.introductionItems, selectors$1g.image, selectors$1g.hotspots]);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer.destroy();
    }
  };
});

var selectors$1f = {
  introductionItems: ".section-introduction > *",
  carousel: ".shoppable-feature__secondary-content .shoppable-feature__carousel-outer",
  hotspots: ".shoppable-item__hotspot-wrapper",
  mobileDrawerItems: ".animation--shoppable-feature-mobile-drawer  .shoppable-feature__carousel-outer > *:not(.swiper-pagination)"
};
var animateShoppableFeature = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$1f.introductionItems, selectors$1f.carousel], 1);
  delayOffset(node, [selectors$1f.hotspots], 1); // Add separate delay offsets for mobile drawer

  delayOffset(node, [selectors$1f.mobileDrawerItems], 1);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer.destroy();
    }
  };
});

var selectors$1e = {
  textContent: ".image-hero-split-item__text-container-inner > *"
};
var animateImageHeroSplit = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$1e.textContent], 1);
});

var selectors$1d = {
  textContent: ".image-hero__text-container-inner > *"
};
var animateImageHero = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$1d.textContent], 3);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$1c = {
  textContent: ".video-hero__text-container > *"
};
var animateVideoHero = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$1c.textContent], 3);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$1b = {
  articleHeading: "\n    .article__image-container,\n    .article__header-inner > *\n  ",
  articleContent: ".article__content"
};
var animateArticle = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$1b.articleHeading, selectors$1b.articleContent]);
  var articleHeading = t$3(selectors$1b.articleHeading, node);
  var articleContent = n$2(selectors$1b.articleContent, node);
  var observers = articleHeading.map(function (item) {
    return intersectionWatcher(item);
  });
  observers.push(intersectionWatcher(articleContent));
  return {
    destroy: function destroy() {
      observers.forEach(function (observer) {
        return observer.destroy();
      });
    }
  };
});

var selectors$1a = {
  image: ".collection-banner__image-container",
  content: ".collection-banner__text-container-inner > *"
};
var animateCollectionBanner = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$1a.image, selectors$1a.content]);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$19 = {
  partial: "[data-partial]",
  filterBar: "[data-filter-bar]",
  mobileFilterBar: "[data-mobile-filters]",
  productItems: ".animation--item:not(.animation--item-revealed)"
};
var classes$w = {
  hideProducts: "animation--collection-products-hide",
  itemRevealed: "animation--item-revealed"
};
var animateCollection = (function (node) {
  var partial = n$2(selectors$19.partial, node);
  var filterbarEl = n$2(selectors$19.filterBar, node);
  var mobileFilterBarEl = n$2(selectors$19.mobileFilterBar, node);
  var filterbarObserver = null;

  if (filterbarEl) {
    filterbarObserver = intersectionWatcher(filterbarEl, true);
  }

  var mobileFilterBarObserver = null;

  if (mobileFilterBarEl) {
    mobileFilterBarObserver = intersectionWatcher(mobileFilterBarEl, true);
  }

  setupProductItem();

  function setupProductItem() {
    var productItems = t$3(selectors$19.productItems, node);
    delayOffset(node, [selectors$19.productItems]);
    setTimeout(function () {
      u$1(productItems, classes$w.itemRevealed);
    }, 0);
  } // Scroll to top of collection grid after applying filters
  // to show the newly filtered list of products


  function _scrollIntoView() {
    var y = partial.getBoundingClientRect().top + window.pageYOffset - filterbarEl.getBoundingClientRect().height;
    window.scrollTo({
      top: y,
      behavior: "smooth"
    });
  }

  function updateContents() {
    setupProductItem(); // Remove the fade out class

    i$1(partial, classes$w.hideProducts);

    _scrollIntoView();
  }

  function infiniteScrollReveal() {
    setupProductItem();
  }

  return {
    updateContents: updateContents,
    infiniteScrollReveal: infiniteScrollReveal,
    destroy: function destroy() {
      var _filterbarObserver, _mobileFilterBarObser;

      (_filterbarObserver = filterbarObserver) === null || _filterbarObserver === void 0 ? void 0 : _filterbarObserver.destroy();
      (_mobileFilterBarObser = mobileFilterBarObserver) === null || _mobileFilterBarObser === void 0 ? void 0 : _mobileFilterBarObser.destroy();
    }
  };
});

var selectors$18 = {
  saleAmount: ".animation--sale-amount",
  sectionBlockItems: ".animation--section-blocks > *",
  saleItems: ".sale-promotion .sale-promotion__type,\n  .sale-promotion .sale-promotion__unit-currency,\n  .sale-promotion .sale-promotion__unit-percent,\n  .sale-promotion .sale-promotion__unit-off,\n  .sale-promotion .sale-promotion__amount,\n  .sale-promotion .sale-promotion__per-month,\n  .sale-promotion .sale-promotion__per-year,\n  .sale-promotion .sale-promotion__terms,\n  .sale-promotion .sales-banner__button"
};
var animateSalesBanner = (function (node) {
  var leftColumnDelayItems = [selectors$18.saleAmount, selectors$18.saleItems];
  var rightColumnDelayItems = [selectors$18.sectionBlockItems]; // Add the animation delay offset variables

  delayOffset(node, leftColumnDelayItems);
  delayOffset(node, rightColumnDelayItems, 1);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$17 = {
  sectionBlockItems: ".section-blocks > *"
};
var animateCountdownBanner = (function (node) {
  var observer = intersectionWatcher(node);
  delayOffset(node, [selectors$17.sectionBlockItems]);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$16 = {
  items: "\n  .sales-banner__bar-item--heading,\n  .sales-banner__bar-text,\n  .sales-banner__button,\n  .countdown-banner__bar-item--heading,\n  .countdown-banner__bar-item--timer,\n  .countdown-banner__bar-text,\n  .countdown-banner__button"
};
var animateCountdownBar = (function (node) {
  var observer = intersectionWatcher(node);
  delayOffset(node, [selectors$16.items]);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var animatePromotionBar = (function (node) {
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$15 = {
  headerItems: ".animation--blog-header > *",
  articleItem: ".article-item",
  pagination: ".blog__pagination"
};
var animateBlog = (function (node) {
  delayOffset(node, [selectors$15.headerItems, selectors$15.articleItem, selectors$15.pagination]);
  var observer = intersectionWatcher(node, true);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$14 = {
  flyouts: "[data-filter-modal]",
  animationFilterDrawerItem: ".animation--filter-drawer-item"
};
var classes$v = {
  animationRevealed: "animation--filter-bar-revealed",
  animationFilterDrawerItem: "animation--filter-drawer-item"
};
var animateFilterDrawer = (function (node) {
  var flyouts = t$3(selectors$14.flyouts, node);
  flyouts.forEach(_setupItemOffsets); // Set the position offset on each time to be animated

  function _setupItemOffsets(flyout) {
    delayOffset(flyout, [selectors$14.animationFilterDrawerItem]);
  } // Trigger the reveal animation when the drawer is opened


  function open(flyout) {
    u$1(flyout, classes$v.animationRevealed);
  } // Reset the reveal animation when the drawer is closed


  function close(flyouts) {
    i$1(flyouts, classes$v.animationRevealed);
  }

  return {
    open: open,
    close: close
  };
});

var selectors$13 = {
  animationItem: ".animation--drawer-menu-item"
};
var classes$u = {
  animationRevealed: "animation--drawer-menu-revealed"
};
var animateDrawerMenu = (function (node) {
  delayOffset(node, [selectors$13.animationItem]); // Trigger the reveal animation when the drawer is opened

  function open() {
    if (shouldAnimate(node)) {
      u$1(node, classes$u.animationRevealed);
    }
  } // Trigger the reveal animation when the drawer is opened


  function close() {
    if (shouldAnimate(node)) {
      i$1(node, classes$u.animationRevealed);
    }
  }

  return {
    open: open,
    close: close
  };
});

var selectors$12 = {
  animationItem: ".animation--quick-cart-items > *, .animation--quick-cart-footer"
};
var classes$t = {
  animationRevealed: "animation--quick-cart-revealed"
};
var animateQuickCart = (function (node) {
  setup(); // Trigger the reveal animation when the drawer is opened

  function open() {
    u$1(node, classes$t.animationRevealed);
  } // Reset the reveal animation when the drawer is closed


  function close() {
    i$1(node, classes$t.animationRevealed);
  } // Setup delay offsets


  function setup() {
    delayOffset(node, [selectors$12.animationItem]);
  }

  return {
    open: open,
    close: close,
    setup: setup
  };
});

var selectors$11 = {
  animationItems: ".animation--quick-view-items > *"
};
var classes$s = {
  animationRevealed: "animation--quick-view-revealed"
};
var animateQuickView = (function (node) {
  function animate() {
    // Add the animation delay offset variables
    delayOffset(node, [selectors$11.animationItems]); // Trigger the reveal animation when the quick view is opened.
    // We can't use the `.is-visible` class added in `quick-view-modal.js`
    // because it can be added before the content is fetched.

    setTimeout(function () {
      u$1(node, classes$s.animationRevealed);
    }, 0);
  }

  function reset() {
    i$1(node, classes$s.animationRevealed);
  }

  return {
    animate: animate,
    reset: reset
  };
});

var selectors$10 = {
  columns: ".meganav__list-parent > li",
  image: ".meganav__promo-image .image__img",
  overlay: ".meganav__secondary-promo-overlay",
  promoItems: ".meganav__secondary-promo-text > *",
  hasPromo: "meganav--has-promo",
  promoLeft: "meganav--promo-position-left"
};
var animateMeganav = (function (node) {
  var delayItems = [];
  var columnItems = t$3(selectors$10.columns, node);

  if (a$1(node, selectors$10.hasPromo)) {
    delayOffset(node, [selectors$10.image, selectors$10.overlay, selectors$10.promoItems]);

    if (a$1(node, selectors$10.promoLeft)) {
      // Set columnItem initial delay to i + 1 of previously delayed
      assignColumnDelays(columnItems, 4);
    } else {
      assignColumnDelays(columnItems);
    }
  } else {
    assignColumnDelays(columnItems);
  } // Add the animation delay offset variables


  delayOffset(node, delayItems);

  function assignColumnDelays(items) {
    var delayMultiplier = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var columnOffset;
    items.forEach(function (item, i) {
      var leftOffset = item.getBoundingClientRect ? item.getBoundingClientRect().left : item.offsetLeft;
      if (i === 0) columnOffset = leftOffset;

      if (columnOffset != leftOffset) {
        columnOffset = leftOffset;
        delayMultiplier++;
      }

      item.style.setProperty("--delay-offset-multiplier", delayMultiplier);
    });
  }
});

var selectors$$ = {
  heading: ".list-collections__heading",
  productItems: ".animation--item"
};
var animateListCollections = (function (node) {
  delayOffset(node, [selectors$$.heading, selectors$$.productItems]);
  var observer = intersectionWatcher(node, true);
  return {
    destroy: function destroy() {
      observer.destroy();
    }
  };
});

var selectors$_ = {
  gridItems: ".grid-item"
};
var animateGrid = (function (node) {
  delayOffset(node, [selectors$_.gridItems]);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer.destroy();
    }
  };
});

var selectors$Z = {
  animationItems: ".animation--purchase-confirmation-item",
  animationFooterItems: ".animation--purchase-confirmation-footer-item"
};
var classes$r = {
  animationRevealed: "animation--purchase-confirmation-revealed"
};
var animatePurchaseConfirmation = (function (node) {
  function animate() {
    // Add the animation delay offset variables
    delayOffset(node, [selectors$Z.animationItems]);
    delayOffset(node, [selectors$Z.animationFooterItems]); // Trigger the reveal animation when the quick view is opened.

    setTimeout(function () {
      u$1(node, classes$r.animationRevealed);
    }, 0);
  }

  function reset() {
    i$1(node, classes$r.animationRevealed);
  }

  return {
    animate: animate,
    reset: reset
  };
});

var selectors$Y = {
  pageItems: ".page-section__inner > *"
};
var animatePage = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$Y.pageItems]);
  var observer = intersectionWatcher(node, true);
  return {
    destroy: function destroy() {
      observer.forEach(function (observer) {
        return observer.destroy();
      });
    }
  };
});

var selectors$X = {
  items: ".collapsible-row-list__inner > *"
};
var animateCollapsibleRowList = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$X.items]);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$W = {
  items: ".animation--section-blocks > *"
};
var animateRichText = (function (node) {
  delayOffset(node, [selectors$W.items]);
  var observer = intersectionWatcher(node, true);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$V = {
  headerItems: ".animation--section-introduction > *",
  articleItem: ".article-item"
};
var animateBlogPosts = (function (node) {
  delayOffset(node, [selectors$V.headerItems, selectors$V.articleItem]);
  var observer = intersectionWatcher(node, true);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$U = {
  intro: ".animation--section-introduction > *",
  items: ".animation--item"
};
var animateFeaturedCollectionGrid = (function (node) {
  delayOffset(node, [selectors$U.intro, selectors$U.items]);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$T = {
  productItems: ".animation--item",
  introductionItems: ".animation--section-introduction > *"
};
var animateCollectionListGrid = (function (node) {
  delayOffset(node, [selectors$T.introductionItems, selectors$T.productItems]);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$S = {
  animationItems: ".animation--store-availability-drawer-items > *"
};
var classes$q = {
  animationRevealed: "animation--store-availability-drawer-revealed"
};
var animateStoreAvailabilityDrawer = (function (node) {
  function animate() {
    // Set the position offset on each time to be animated
    var items = t$3(selectors$S.animationItems, node);
    items.forEach(function (item, i) {
      item.style.setProperty("--position-offset-multiplier", i);
    }); // Trigger the reveal animation when the quick view is opened.
    // We can't use the `.is-visible` class added in `quick-view-modal.js`
    // because it can be added before the content is fetched.

    setTimeout(function () {
      u$1(node, classes$q.animationRevealed);
    }, 0);
  }

  function reset() {
    i$1(node, classes$q.animationRevealed);
  }

  return {
    animate: animate,
    reset: reset
  };
});

var selectors$R = {
  media: ".animation--product-media"
};
var animateProduct = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$R.media]);
  var observer = intersectionWatcher(node, true);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$Q = {
  headerItems: ".animation--section-introduction > *",
  animationItem: ".animation--item"
};
var animateContactForm = (function (node) {
  delayOffset(node, [selectors$Q.headerItems, selectors$Q.animationItem]);
  var observer = intersectionWatcher(node, true);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$P = {
  partial: "[data-partial]",
  filterBar: "[data-filter-bar]",
  mobileFilterBar: "[data-mobile-filters]",
  productItems: ".animation--item:not(.animation--item-revealed)"
};
var classes$p = {
  hideProducts: "animation--search-products-hide",
  itemRevealed: "animation--item-revealed"
};
var animateSearch = (function (node) {
  var partial = n$2(selectors$P.partial, node);
  var filterbarEl = n$2(selectors$P.filterBar, node);
  var mobileFilterBarEl = n$2(selectors$P.mobileFilterBar, node);
  var filterbarObserver = null;

  if (filterbarEl) {
    filterbarObserver = intersectionWatcher(filterbarEl, true);
  }

  var mobileFilterBarObserver = null;

  if (mobileFilterBarEl) {
    mobileFilterBarObserver = intersectionWatcher(mobileFilterBarEl, true);
  }

  _setupProductItem();

  function _setupProductItem() {
    var productItems = t$3(selectors$P.productItems, node);
    delayOffset(node, [selectors$P.productItems]);
    setTimeout(function () {
      u$1(productItems, classes$p.itemRevealed);
    }, 0);
  } // Scroll to top of search grid after applying filters
  // to show the newly filtered list of products


  function _scrollIntoView() {
    var y = partial.getBoundingClientRect().top + window.pageYOffset - filterbarEl.getBoundingClientRect().height;
    window.scrollTo({
      top: y,
      behavior: "smooth"
    });
  }

  function updateContents() {
    _setupProductItem(); // Remove the fade out class


    i$1(partial, classes$p.hideProducts);

    _scrollIntoView();
  }

  function infiniteScrollReveal() {
    _setupProductItem();
  }

  return {
    updateContents: updateContents,
    infiniteScrollReveal: infiniteScrollReveal,
    destroy: function destroy() {
      var _filterbarObserver, _mobileFilterBarObser;

      (_filterbarObserver = filterbarObserver) === null || _filterbarObserver === void 0 ? void 0 : _filterbarObserver.destroy();
      (_mobileFilterBarObser = mobileFilterBarObserver) === null || _mobileFilterBarObser === void 0 ? void 0 : _mobileFilterBarObser.destroy();
    }
  };
});

var selectors$O = {
  content: ".animation--section-blocks > *"
};
var animateSearchBanner = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$O.content]);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

var selectors$N = {
  headerItems: ".animation--section-introduction > *",
  columnItems: ".multi-column__grid-item"
};
var animateMultiColumn = (function (node) {
  delayOffset(node, [selectors$N.headerItems, selectors$N.columnItems]);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer.destroy();
    }
  };
});

var selectors$M = {
  textContent: ".password__text-container-inner > *"
};
var animatePassword = (function (node) {
  // Add the animation delay offset variables
  delayOffset(node, [selectors$M.textContent], 3);
  var observer = intersectionWatcher(node);
  return {
    destroy: function destroy() {
      observer === null || observer === void 0 ? void 0 : observer.destroy();
    }
  };
});

function makeRequest(method, url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject(new Error(this.status));
      }
    };

    xhr.onerror = function () {
      reject(new Error(this.status));
    };

    xhr.send();
  });
}

var classes$o = {
  active: "active"
};
var selectors$L = {
  drawerTrigger: "[data-store-availability-drawer-trigger]",
  closeBtn: "[data-store-availability-close]",
  productTitle: "[data-store-availability-product-title]",
  variantTitle: "[data-store-availability-variant-title]",
  storeListContainer: "[data-store-list-container]",
  storeListContent: "[data-store-availability-list-content]",
  wash: "[data-store-availability-drawer-wash]",
  parentWrapper: "[data-store-availability-container]"
};

var storeAvailabilityDrawer = function storeAvailabilityDrawer(node) {
  var focusTrap = createFocusTrap(node, {
    allowOutsideClick: true
  });
  var wash = n$2(selectors$L.wash, node.parentNode);
  var productTitleContainer = n$2(selectors$L.productTitle);
  var variantTitleContainer = n$2(selectors$L.variantTitle);
  var storeListContainer = n$2(selectors$L.storeListContainer, node);
  var storeAvailabilityDrawerAnimate = null;

  if (shouldAnimate(node)) {
    storeAvailabilityDrawerAnimate = animateStoreAvailabilityDrawer(node);
  }

  var events = [e$3([n$2(selectors$L.closeBtn, node), wash], "click", function (e) {
    e.preventDefault();

    _close();
  }), e$3(node, "keydown", function (_ref) {
    var keyCode = _ref.keyCode;
    if (keyCode === 27) _close();
  })];

  var _handleClick = function _handleClick(target) {
    var parentContainer = target.closest(selectors$L.parentWrapper);
    var _parentContainer$data = parentContainer.dataset,
        baseUrl = _parentContainer$data.baseUrl,
        variantId = _parentContainer$data.variantId,
        productTitle = _parentContainer$data.productTitle,
        variantTitle = _parentContainer$data.variantTitle;
    var variantSectionUrl = "".concat(baseUrl, "/variants/").concat(variantId, "/?section_id=store-availability");
    makeRequest("GET", variantSectionUrl).then(function (storeAvailabilityHTML) {
      var container = document.createElement("div");
      container.innerHTML = storeAvailabilityHTML;
      productTitleContainer.innerText = productTitle; // Shopify returns string null on variant titles for products without varians

      variantTitleContainer.innerText = variantTitle === "null" ? "" : variantTitle;
      var storeList = n$2(selectors$L.storeListContent, container);
      storeListContainer.innerHTML = "";
      storeListContainer.appendChild(storeList);
    }).then(_open);
  };

  var _open = function _open() {
    u$1(node, classes$o.active);

    if (shouldAnimate(node)) {
      storeAvailabilityDrawerAnimate.animate();
    }

    node.setAttribute("aria-hidden", "false");
    focusTrap.activate();
    disableBodyScroll(node, {
      allowTouchMove: function allowTouchMove(el) {
        while (el && el !== document.body) {
          if (el.getAttribute("data-scroll-lock-ignore") !== null) {
            return true;
          }

          el = el.parentNode;
        }
      },
      reserveScrollBarGap: true
    });
  };

  var _close = function _close() {
    focusTrap.deactivate();
    i$1(node, classes$o.active);
    node.setAttribute("aria-hidden", "true");
    setTimeout(function () {
      if (shouldAnimate(node)) {
        storeAvailabilityDrawerAnimate.reset();
      }

      enableBodyScroll(node);
    }, 500);
  };

  var delegate = new Delegate(document.body);
  delegate.on("click", selectors$L.drawerTrigger, function (_, target) {
    return _handleClick(target);
  });

  var unload = function unload() {
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  };

  return {
    unload: unload
  };
};

var strings$4 = window.theme.strings.accessibility;

var handleTab = function handleTab() {
  var tabHandler = null;
  var formElments = ["INPUT", "TEXTAREA", "SELECT"]; // Determine if the user is a mouse or keyboard user

  function handleFirstTab(e) {
    if (e.keyCode === 9 && !formElments.includes(document.activeElement.tagName)) {
      document.body.classList.add("user-is-tabbing");
      tabHandler();
      tabHandler = e$3(window, "mousedown", handleMouseDownOnce);
    }
  }

  function handleMouseDownOnce() {
    document.body.classList.remove("user-is-tabbing");
    tabHandler();
    tabHandler = e$3(window, "keydown", handleFirstTab);
  }

  tabHandler = e$3(window, "keydown", handleFirstTab);
};

var focusFormStatus = function focusFormStatus(node) {
  var formStatus = n$2(".form-status", node);
  if (!formStatus) return;
  var focusElement = n$2("[data-form-status]", formStatus);
  if (!focusElement) return;
  focusElement.focus();
};

var prefersReducedMotion = function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

function backgroundVideoHandler(container) {
  var pause = n$2(".video-pause", container);
  var video = container.getElementsByTagName("VIDEO")[0];
  if (!pause || !video) return;

  var pauseVideo = function pauseVideo() {
    video.pause();
    pause.innerText = strings$4.play_video;
  };

  var playVideo = function playVideo() {
    video.play();
    pause.innerText = strings$4.pause_video;
  };

  if (prefersReducedMotion()) {
    pauseVideo();
  }

  var pauseListener = e$3(pause, "click", function (e) {
    e.preventDefault();

    if (video.paused) {
      playVideo();
    } else {
      pauseVideo();
    }
  });
  return function () {
    return pauseListener();
  };
}

var classes$n = {
  hidden: "hidden"
};
var sectionClasses = (function () {
  function adjustClasses() {
    var sections = t$3(".main .shopify-section");
    sections.forEach(function (section) {
      var child = section.firstElementChild; // Specific to recommended hidden products

      if (child && child.classList.contains(classes$n.hidden)) {
        u$1(section, classes$n.hidden);
      }
    });
  }

  adjustClasses();
  e$3(document, "shopify:section:load", adjustClasses);
});

/**
 * Returns a product JSON object when passed a product URL
 * @param {*} url
 */

/**
 * Find a match in the project JSON (using a ID number) and return the variant (as an Object)
 * @param {Object} product Product JSON object
 * @param {Number} value Accepts Number (e.g. 6908023078973)
 * @returns {Object} The variant object once a match has been successful. Otherwise null will be return
 */
function getVariantFromId(product, value) {
  _validateProductStructure(product);

  if (typeof value !== 'number') {
    throw new TypeError(value + ' is not a Number.');
  }

  var result = product.variants.filter(function(variant) {
    return variant.id === value;
  });

  return result[0] || null;
}

/**
 * Convert the Object (with 'name' and 'value' keys) into an Array of values, then find a match & return the variant (as an Object)
 * @param {Object} product Product JSON object
 * @param {Object} collection Object with 'name' and 'value' keys (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
 * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
 */
function getVariantFromSerializedArray(product, collection) {
  _validateProductStructure(product);

  // If value is an array of options
  var optionArray = _createOptionArrayFromOptionCollection(product, collection);
  return getVariantFromOptionArray(product, optionArray);
}

/**
 * Find a match in the project JSON (using Array with option values) and return the variant (as an Object)
 * @param {Object} product Product JSON object
 * @param {Array} options List of submitted values (e.g. ['36', 'Black'])
 * @returns {Object || null} The variant object once a match has been successful. Otherwise null will be returned
 */
function getVariantFromOptionArray(product, options) {
  _validateProductStructure(product);
  _validateOptionsArray(options);

  var result = product.variants.filter(function(variant) {
    return options.every(function(option, index) {
      return variant.options[index] === option;
    });
  });

  return result[0] || null;
}

/**
 * Creates an array of selected options from the object
 * Loops through the project.options and check if the "option name" exist (product.options.name) and matches the target
 * @param {Object} product Product JSON object
 * @param {Array} collection Array of object (e.g. [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }])
 * @returns {Array} The result of the matched values. (e.g. ['36', 'Black'])
 */
function _createOptionArrayFromOptionCollection(product, collection) {
  _validateProductStructure(product);
  _validateSerializedArray(collection);

  var optionArray = [];

  collection.forEach(function(option) {
    for (var i = 0; i < product.options.length; i++) {
      if (product.options[i].name.toLowerCase() === option.name.toLowerCase()) {
        optionArray[i] = option.value;
        break;
      }
    }
  });

  return optionArray;
}

/**
 * Check if the product data is a valid JS object
 * Error will be thrown if type is invalid
 * @param {object} product Product JSON object
 */
function _validateProductStructure(product) {
  if (typeof product !== 'object') {
    throw new TypeError(product + ' is not an object.');
  }

  if (Object.keys(product).length === 0 && product.constructor === Object) {
    throw new Error(product + ' is empty.');
  }
}

/**
 * Validate the structure of the array
 * It must be formatted like jQuery's serializeArray()
 * @param {Array} collection Array of object [{ name: "Size", value: "36" }, { name: "Color", value: "Black" }]
 */
function _validateSerializedArray(collection) {
  if (!Array.isArray(collection)) {
    throw new TypeError(collection + ' is not an array.');
  }

  if (collection.length === 0) {
    return [];
  }

  if (collection[0].hasOwnProperty('name')) {
    if (typeof collection[0].name !== 'string') {
      throw new TypeError(
        'Invalid value type passed for name of option ' +
          collection[0].name +
          '. Value should be string.'
      );
    }
  } else {
    throw new Error(collection[0] + 'does not contain name key.');
  }
}

/**
 * Validate the structure of the array
 * It must be formatted as list of values
 * @param {Array} collection Array of object (e.g. ['36', 'Black'])
 */
function _validateOptionsArray(options) {
  if (Array.isArray(options) && typeof options[0] === 'object') {
    throw new Error(options + 'is not a valid array of options.');
  }
}

// Public Methods
// -----------------------------------------------------------------------------

/**
 * Returns a URL with a variant ID query parameter. Useful for updating window.history
 * with a new URL based on the currently select product variant.
 * @param {string} url - The URL you wish to append the variant ID to
 * @param {number} id  - The variant ID you wish to append to the URL
 * @returns {string} - The new url which includes the variant ID query parameter
 */

function getUrlWithVariant(url, id) {
  if (/variant=/.test(url)) {
    return url.replace(/(variant=)[^&]+/, '$1' + id);
  } else if (/\?/.test(url)) {
    return url.concat('&variant=').concat(id);
  }

  return url.concat('?variant=').concat(id);
}

var selectors$K = {
  sentinal: ".scroll-sentinal",
  scrollButtons: ".scroll-button",
  scrollViewport: "[data-scroll-container-viewport]"
};

var scrollContainer = function scrollContainer(node) {
  var sentinals = t$3(selectors$K.sentinal, node);
  var buttons = t$3(selectors$K.scrollButtons, node);
  var _node$dataset = node.dataset,
      axis = _node$dataset.axis,
      startAtEnd = _node$dataset.startAtEnd;
  var scrollerViewport = n$2(selectors$K.scrollViewport, node);
  window.addEventListener("load", function () {
    u$1(node, "scroll-container-initialized");

    if (startAtEnd === "true") {
      _startAtEnd();
    }
  }, {
    once: true
  });
  var events = [e$3(buttons, "click", function (e) {
    var button = e.currentTarget;
    var scrollAttribute = axis == "vertical" ? "scrollTop" : "scrollLeft";
    var scrollOffset = 100;

    if (button.dataset.position === "start") {
      if (scrollerViewport[scrollAttribute] < scrollOffset * 1.5) {
        scrollerViewport[scrollAttribute] = 0;
      } else {
        scrollerViewport[scrollAttribute] -= scrollOffset;
      }
    } else {
      scrollerViewport[scrollAttribute] += scrollOffset;
    }
  })];
  var ioOptions = {
    root: scrollerViewport
  };
  var intersectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var position = entry.target.dataset.position;
      var visible = entry.isIntersecting;
      node.setAttribute("data-at-".concat(position), visible ? "true" : "false");
    });
  }, ioOptions);
  sentinals.forEach(function (sentinal) {
    intersectionObserver.observe(sentinal);
  });

  var unload = function unload() {
    sentinals.forEach(function (sentinal) {
      intersectionObserver.unobserve(sentinal);
    });
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  };

  function _startAtEnd() {
    var scrollAttribute = axis == "vertical" ? "scrollTop" : "scrollLeft";
    var scrollDirection = axis == "vertical" ? "scrollHeight" : "scrollWidth";
    scrollerViewport[scrollAttribute] = scrollerViewport[scrollDirection] * 2;
    node.dataset.startAtEnd = false;
  }

  return {
    unload: unload
  };
};

var n,e$1,i,o,t$1,r$1,f,d,p,u=[];function w(n,a){return e$1=window.pageXOffset,o=window.pageYOffset,r$1=window.innerHeight,d=window.innerWidth,void 0===i&&(i=e$1),void 0===t$1&&(t$1=o),void 0===p&&(p=d),void 0===f&&(f=r$1),(a||o!==t$1||e$1!==i||r$1!==f||d!==p)&&(!function(n){for(var w=0;w<u.length;w++)u[w]({x:e$1,y:o,px:i,py:t$1,vh:r$1,pvh:f,vw:d,pvw:p},n);}(n),i=e$1,t$1=o,f=r$1,p=d),requestAnimationFrame(w)}function srraf(e){return u.indexOf(e)<0&&u.push(e),n=n||w(performance.now()),{update:function(){return w(performance.now(),!0),this},destroy:function(){u.splice(u.indexOf(e),1);}}}

var atBreakpointChange = function atBreakpointChange(breakpointToWatch, callback) {
  var _screenUnderBP = function _screenUnderBP() {
    var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    return viewportWidth <= breakpointToWatch;
  };

  var screenUnderBP = _screenUnderBP();

  var widthWatcher = srraf(function (_ref) {
    var vw = _ref.vw;
    var currentScreenWidthUnderBP = vw <= breakpointToWatch;

    if (currentScreenWidthUnderBP !== screenUnderBP) {
      screenUnderBP = currentScreenWidthUnderBP;
      return callback();
    }
  });

  var unload = function unload() {
    widthWatcher.destroy();
  };

  return {
    unload: unload
  };
};

var sel$3 = {
  container: ".social-share",
  button: ".social-share__button",
  popup: ".social-sharing__popup",
  copyURLButton: ".social-share__copy-url",
  successMessage: ".social-share__success-message"
};
var classes$m = {
  hidden: "hidden",
  linkCopied: "social-sharing__popup--success"
};
var SocialShare = (function (node) {
  if (!node) return Function();
  var button = n$2(sel$3.button, node);
  var popup = n$2(sel$3.popup, node);
  var copyURLButton = n$2(sel$3.copyURLButton, node);
  var successMessage = n$2(sel$3.successMessage, node);
  var clickListener = e$3(window, "click", handleClick); // Hide copy button on old browsers

  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    u$1(copyURLButton, classes$m.hidden);
  }

  function handleClick(evt) {
    var buttonClicked = evt.target.closest(sel$3.button) === button;
    var popupClicked = evt.target.closest(sel$3.popup) === popup;
    var copyURLClicked = evt.target.closest(sel$3.copyURLButton) === copyURLButton;
    var isActive = false;

    if (buttonClicked) {
      isActive = button.getAttribute("aria-expanded") === "true";
    } // click happend outside of this popup


    if (!popupClicked) {
      close();
    } // click happend in this social button and the button is not active


    if (buttonClicked && !isActive) {
      open();
    }

    if (copyURLClicked) {
      var url = copyURLButton.dataset.url;
      writeToClipboard(url).then(showSuccessMessage, showErrorMessage);
    }
  }

  function close() {
    button.setAttribute("aria-expanded", false);
    popup.setAttribute("aria-hidden", true);
  }

  function open() {
    button.setAttribute("aria-expanded", true);
    popup.setAttribute("aria-hidden", false);
  }

  function writeToClipboard(str) {
    return navigator.clipboard.writeText(str);
  }

  function showMessage(message) {
    successMessage.innerHTML = message;
    i$1(successMessage, classes$m.hidden);
    u$1(popup, classes$m.linkCopied);
    setTimeout(function () {
      u$1(successMessage, classes$m.hidden);
      i$1(popup, classes$m.linkCopied);
    }, 2000);
  }

  function showSuccessMessage() {
    var successMessage = copyURLButton.dataset.successMessage;
    showMessage(successMessage);
  }

  function showErrorMessage() {
    var errorMessage = copyURLButton.dataset.errorMessage;
    showMessage(errorMessage || "Error copying link.");
  }

  function destroy() {
    close();
    clickListener();
  }

  return destroy;
});

function t(){try{return localStorage.setItem("test","test"),localStorage.removeItem("test"),!0}catch(t){return !1}}function e(e){if(t())return JSON.parse(localStorage.getItem("neon_"+e))}function r(e,r){if(t())return localStorage.setItem("neon_"+e,r)}

var dispatchCustomEvent = function dispatchCustomEvent(eventName) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var detail = {
    detail: data
  };
  var event = new CustomEvent(eventName, data ? detail : null);
  document.dispatchEvent(event);
};

var routes = window.theme.routes.cart || {};
var paths = {
  base: "".concat(routes.base || "/cart", ".js"),
  add: "".concat(routes.add || "/cart/add", ".js"),
  change: "".concat(routes.change || "/cart/change", ".js"),
  clear: "".concat(routes.clear || "/cart/clear", ".js")
}; // Add a `sorted` key that orders line items
// in the order the customer added them if possible

function sortCart(cart) {
  var order = e("cart_order") || [];

  if (order.length) {
    cart.sorted = _toConsumableArray(cart.items).sort(function (a, b) {
      return order.indexOf(a.variant_id) - order.indexOf(b.variant_id);
    });
    return cart;
  }

  cart.sorted = cart.items;
  return cart;
}

function addVariant(variant, quantity) {
  var numAvailable = variant.inventory_policy === "deny" && variant.inventory_management === "shopify" ? variant.inventory_quantity : null; // null means they can add as many as they want

  return get().then(function (_ref) {
    var items = _ref.items;
    var existing = items.filter(function (item) {
      return item.id === variant.id;
    })[0] || {};
    var numRequested = (existing.quantity || 0) + quantity;

    if (numAvailable !== null && numRequested > numAvailable) {
      var err = "There are only ".concat(numAvailable, " of that product available, requested ").concat(numRequested, ".");
      throw new Error(err);
    } else {
      return addItemById(variant.id, quantity);
    }
  });
}

function updateItem(id, quantity) {
  return get().then(function (_ref2) {
    var items = _ref2.items;

    for (var i = 0; i < items.length; i++) {
      if (items[i].variant_id === parseInt(id)) {
        return changeItem(i + 1, quantity); // shopify cart is a 1-based index
      }
    }
  });
}

function changeItem(line, quantity) {
  return fetch(paths.change, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      line: line,
      quantity: quantity
    })
  }).then(function (res) {
    return res.json();
  }).then(function (cart) {
    r$2("cart:updated", {
      cart: cart
    });
    r$2("quick-cart:updated");
    return sortCart(cart);
  });
}

function addItemById(id, quantity) {
  r$2("cart:updating");
  var data = {
    items: [{
      id: id,
      quantity: quantity
    }]
  };
  return fetch(paths.add, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }).then(function (r) {
    return r.json();
  }).then(function (res) {
    if (res.status == "422") {
      var errorMessage = {
        code: 422,
        message: res.description
      };
      dispatchCustomEvent("cart:error", {
        errorMessage: res.description
      });
      r$2("quick-cart:error", null, {
        id: id
      });
      r$2("cart:error", null, {
        id: id
      });
      throw errorMessage;
    }

    return get().then(function (cart) {
      r$2("quick-cart:updated");
      r$2("cart:updated", {
        cart: cart
      });
      return {
        res: res,
        cart: cart
      };
    });
  });
}

function get() {
  return fetch(paths.base, {
    method: "GET",
    credentials: "include"
  }).then(function (res) {
    return res.json();
  }).then(function (data) {
    var sortedData = sortCart(data);
    return sortedData;
  });
}

function addItem(form) {
  r$2("cart:updating");
  return fetch(paths.add, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: serialize(form)
  }).then(function (r) {
    return r.json();
  }).then(function (res) {
    if (res.status == "422") {
      var errorMessage = {
        code: 422,
        message: res.description
      };
      dispatchCustomEvent("cart:error", {
        errorMessage: res.description
      });
      throw errorMessage;
    }

    return get().then(function (cart) {
      var order = e("cart_order") || [];
      var newOrder = [res.variant_id].concat(_toConsumableArray(order.filter(function (i) {
        return i !== res.variant_id;
      })));
      r("cart_order", JSON.stringify(newOrder));
      r$2("cart:updated", {
        cart: sortCart(cart)
      });
      r$2("quick-cart:updated");
      r$2("quick-view:close");
      dispatchCustomEvent("cart:updated", {
        cart: sortCart(cart)
      });
      return {
        item: res,
        cart: sortCart(cart)
      };
    });
  });
} // !
//  Serialize all form data into a SearchParams string
//  (c) 2020 Chris Ferdinandi, MIT License, https://gomakethings.com
//  @param  {Node}   form The form to serialize
//  @return {String}      The serialized form data
//


function serialize(form) {
  var arr = [];
  Array.prototype.slice.call(form.elements).forEach(function (field) {
    if (!field.name || field.disabled || ["file", "reset", "submit", "button"].indexOf(field.type) > -1) {
      return;
    }

    if (field.type === "select-multiple") {
      Array.prototype.slice.call(field.options).forEach(function (option) {
        if (!option.selected) return;
        arr.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(option.value));
      });
      return;
    }

    if (["checkbox", "radio"].indexOf(field.type) > -1 && !field.checked) {
      return;
    }

    arr.push(encodeURIComponent(field.name) + "=" + encodeURIComponent(field.value));
  });
  return arr.join("&");
}

var cart = {
  addItem: addItem,
  addItemById: addItemById,
  addVariant: addVariant,
  get: get,
  updateItem: updateItem
};

/**
 * Currency Helpers
 * -----------------------------------------------------------------------------
 * A collection of useful functions that help with currency formatting
 *
 * Current contents
 * - formatMoney - Takes an amount in cents and returns it as a formatted dollar value.
 *
 */

const moneyFormat = '${{amount}}';

/**
 * Format money values based on your shop currency settings
 * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
 * or 3.00 dollars
 * @param  {String} format - shop money_format setting
 * @return {String} value - formatted value
 */
function formatMoney$1(cents, format) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  let value = '';
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  const formatString = format || moneyFormat;

  function formatWithDelimiters(
    number,
    precision = 2,
    thousands = ',',
    decimal = '.'
  ) {
    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    const parts = number.split('.');
    const dollarsAmount = parts[0].replace(
      /(\d)(?=(\d\d\d)+(?!\d))/g,
      `$1${thousands}`
    );
    const centsAmount = parts[1] ? decimal + parts[1] : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

var formatMoney = (function (val) {
  return formatMoney$1(val, window.theme.moneyFormat || "${{amount}}");
});

// Fetch the product data from the .js endpoint because it includes
// more data than the .json endpoint.
var getProduct = (function (handle) {
  return function (cb) {
    return fetch("".concat(window.theme.routes.products, "/").concat(handle, ".js")).then(function (res) {
      return res.json();
    }).then(function (data) {
      return cb(data);
    }).catch(function (err) {
      return console.log(err.message);
    });
  };
});

/*!
 * slide-anim
 * https://github.com/yomotsu/slide-anim
 * (c) 2017 @yomotsu
 * Released under the MIT License.
 */
var global$2 = window;
var isPromiseSuppoted = typeof global$2.Promise === 'function';
var PromiseLike = isPromiseSuppoted ? global$2.Promise : (function () {
    function PromiseLike(executor) {
        var callback = function () { };
        var resolve = function () {
            callback();
        };
        executor(resolve);
        return {
            then: function (_callback) {
                callback = _callback;
            }
        };
    }
    return PromiseLike;
}());

var pool = [];
var inAnimItems = {
    add: function (el, defaultStyle, timeoutId, onCancelled) {
        var inAnimItem = { el: el, defaultStyle: defaultStyle, timeoutId: timeoutId, onCancelled: onCancelled };
        this.remove(el);
        pool.push(inAnimItem);
    },
    remove: function (el) {
        var index = inAnimItems.findIndex(el);
        if (index === -1)
            return;
        var inAnimItem = pool[index];
        clearTimeout(inAnimItem.timeoutId);
        inAnimItem.onCancelled();
        pool.splice(index, 1);
    },
    find: function (el) {
        return pool[inAnimItems.findIndex(el)];
    },
    findIndex: function (el) {
        var index = -1;
        pool.some(function (item, i) {
            if (item.el === el) {
                index = i;
                return true;
            }
            return false;
        });
        return index;
    }
};

var CSS_EASEOUT_EXPO = 'cubic-bezier( 0.19, 1, 0.22, 1 )';
function slideDown(el, options) {
    if (options === void 0) { options = {}; }
    return new PromiseLike(function (resolve) {
        if (inAnimItems.findIndex(el) !== -1)
            return;
        var _isVisible = isVisible(el);
        var hasEndHeight = typeof options.endHeight === 'number';
        var display = options.display || 'block';
        var duration = options.duration || 400;
        var onCancelled = options.onCancelled || function () { };
        var defaultStyle = el.getAttribute('style') || '';
        var style = window.getComputedStyle(el);
        var defaultStyles = getDefaultStyles(el, display);
        var isBorderBox = /border-box/.test(style.getPropertyValue('box-sizing'));
        var contentHeight = defaultStyles.height;
        var minHeight = defaultStyles.minHeight;
        var paddingTop = defaultStyles.paddingTop;
        var paddingBottom = defaultStyles.paddingBottom;
        var borderTop = defaultStyles.borderTop;
        var borderBottom = defaultStyles.borderBottom;
        var cssDuration = duration + "ms";
        var cssEasing = CSS_EASEOUT_EXPO;
        var cssTransition = [
            "height " + cssDuration + " " + cssEasing,
            "min-height " + cssDuration + " " + cssEasing,
            "padding " + cssDuration + " " + cssEasing,
            "border-width " + cssDuration + " " + cssEasing
        ].join();
        var startHeight = _isVisible ? style.height : '0px';
        var startMinHeight = _isVisible ? style.minHeight : '0px';
        var startPaddingTop = _isVisible ? style.paddingTop : '0px';
        var startPaddingBottom = _isVisible ? style.paddingBottom : '0px';
        var startBorderTopWidth = _isVisible ? style.borderTopWidth : '0px';
        var startBorderBottomWidth = _isVisible ? style.borderBottomWidth : '0px';
        var endHeight = (function () {
            if (hasEndHeight)
                return options.endHeight + "px";
            return !isBorderBox ?
                contentHeight - paddingTop - paddingBottom + "px" :
                contentHeight + borderTop + borderBottom + "px";
        })();
        var endMinHeight = minHeight + "px";
        var endPaddingTop = paddingTop + "px";
        var endPaddingBottom = paddingBottom + "px";
        var endBorderTopWidth = borderTop + "px";
        var endBorderBottomWidth = borderBottom + "px";
        if (startHeight === endHeight &&
            startPaddingTop === endPaddingTop &&
            startPaddingBottom === endPaddingBottom &&
            startBorderTopWidth === endBorderTopWidth &&
            startBorderBottomWidth === endBorderBottomWidth) {
            resolve();
            return;
        }
        requestAnimationFrame(function () {
            el.style.height = startHeight;
            el.style.minHeight = startMinHeight;
            el.style.paddingTop = startPaddingTop;
            el.style.paddingBottom = startPaddingBottom;
            el.style.borderTopWidth = startBorderTopWidth;
            el.style.borderBottomWidth = startBorderBottomWidth;
            el.style.display = display;
            el.style.overflow = 'hidden';
            el.style.visibility = 'visible';
            el.style.transition = cssTransition;
            el.style.webkitTransition = cssTransition;
            requestAnimationFrame(function () {
                el.style.height = endHeight;
                el.style.minHeight = endMinHeight;
                el.style.paddingTop = endPaddingTop;
                el.style.paddingBottom = endPaddingBottom;
                el.style.borderTopWidth = endBorderTopWidth;
                el.style.borderBottomWidth = endBorderBottomWidth;
            });
        });
        var timeoutId = setTimeout(function () {
            resetStyle(el);
            el.style.display = display;
            if (hasEndHeight) {
                el.style.height = options.endHeight + "px";
                el.style.overflow = "hidden";
            }
            inAnimItems.remove(el);
            resolve();
        }, duration);
        inAnimItems.add(el, defaultStyle, timeoutId, onCancelled);
    });
}
function slideUp(el, options) {
    if (options === void 0) { options = {}; }
    return new PromiseLike(function (resolve) {
        if (inAnimItems.findIndex(el) !== -1)
            return;
        var _isVisible = isVisible(el);
        var display = options.display || 'block';
        var duration = options.duration || 400;
        var onCancelled = options.onCancelled || function () { };
        if (!_isVisible) {
            resolve();
            return;
        }
        var defaultStyle = el.getAttribute('style') || '';
        var style = window.getComputedStyle(el);
        var isBorderBox = /border-box/.test(style.getPropertyValue('box-sizing'));
        var minHeight = pxToNumber(style.getPropertyValue('min-height'));
        var paddingTop = pxToNumber(style.getPropertyValue('padding-top'));
        var paddingBottom = pxToNumber(style.getPropertyValue('padding-bottom'));
        var borderTop = pxToNumber(style.getPropertyValue('border-top-width'));
        var borderBottom = pxToNumber(style.getPropertyValue('border-bottom-width'));
        var contentHeight = el.scrollHeight;
        var cssDuration = duration + 'ms';
        var cssEasing = CSS_EASEOUT_EXPO;
        var cssTransition = [
            "height " + cssDuration + " " + cssEasing,
            "padding " + cssDuration + " " + cssEasing,
            "border-width " + cssDuration + " " + cssEasing
        ].join();
        var startHeight = !isBorderBox ?
            contentHeight - paddingTop - paddingBottom + "px" :
            contentHeight + borderTop + borderBottom + "px";
        var startMinHeight = minHeight + "px";
        var startPaddingTop = paddingTop + "px";
        var startPaddingBottom = paddingBottom + "px";
        var startBorderTopWidth = borderTop + "px";
        var startBorderBottomWidth = borderBottom + "px";
        requestAnimationFrame(function () {
            el.style.height = startHeight;
            el.style.minHeight = startMinHeight;
            el.style.paddingTop = startPaddingTop;
            el.style.paddingBottom = startPaddingBottom;
            el.style.borderTopWidth = startBorderTopWidth;
            el.style.borderBottomWidth = startBorderBottomWidth;
            el.style.display = display;
            el.style.overflow = 'hidden';
            el.style.transition = cssTransition;
            el.style.webkitTransition = cssTransition;
            requestAnimationFrame(function () {
                el.style.height = '0';
                el.style.minHeight = '0';
                el.style.paddingTop = '0';
                el.style.paddingBottom = '0';
                el.style.borderTopWidth = '0';
                el.style.borderBottomWidth = '0';
            });
        });
        var timeoutId = setTimeout(function () {
            resetStyle(el);
            el.style.display = 'none';
            inAnimItems.remove(el);
            resolve();
        }, duration);
        inAnimItems.add(el, defaultStyle, timeoutId, onCancelled);
    });
}
function slideStop(el) {
    var elementObject = inAnimItems.find(el);
    if (!elementObject)
        return;
    var style = window.getComputedStyle(el);
    var height = style.height;
    var paddingTop = style.paddingTop;
    var paddingBottom = style.paddingBottom;
    var borderTopWidth = style.borderTopWidth;
    var borderBottomWidth = style.borderBottomWidth;
    resetStyle(el);
    el.style.height = height;
    el.style.paddingTop = paddingTop;
    el.style.paddingBottom = paddingBottom;
    el.style.borderTopWidth = borderTopWidth;
    el.style.borderBottomWidth = borderBottomWidth;
    el.style.overflow = 'hidden';
    inAnimItems.remove(el);
}
function isVisible(el) {
    return el.offsetHeight !== 0;
}
function resetStyle(el) {
    el.style.visibility = '';
    el.style.height = '';
    el.style.minHeight = '';
    el.style.paddingTop = '';
    el.style.paddingBottom = '';
    el.style.borderTopWidth = '';
    el.style.borderBottomWidth = '';
    el.style.overflow = '';
    el.style.transition = '';
    el.style.webkitTransition = '';
}
function getDefaultStyles(el, defaultDisplay) {
    if (defaultDisplay === void 0) { defaultDisplay = 'block'; }
    var defaultStyle = el.getAttribute('style') || '';
    var style = window.getComputedStyle(el);
    el.style.visibility = 'hidden';
    el.style.display = defaultDisplay;
    var width = pxToNumber(style.getPropertyValue('width'));
    el.style.position = 'absolute';
    el.style.width = width + "px";
    el.style.height = '';
    el.style.minHeight = '';
    el.style.paddingTop = '';
    el.style.paddingBottom = '';
    el.style.borderTopWidth = '';
    el.style.borderBottomWidth = '';
    var minHeight = pxToNumber(style.getPropertyValue('min-height'));
    var paddingTop = pxToNumber(style.getPropertyValue('padding-top'));
    var paddingBottom = pxToNumber(style.getPropertyValue('padding-bottom'));
    var borderTop = pxToNumber(style.getPropertyValue('border-top-width'));
    var borderBottom = pxToNumber(style.getPropertyValue('border-bottom-width'));
    var height = el.scrollHeight;
    el.setAttribute('style', defaultStyle);
    return {
        height: height,
        minHeight: minHeight,
        paddingTop: paddingTop,
        paddingBottom: paddingBottom,
        borderTop: borderTop,
        borderBottom: borderBottom
    };
}
function pxToNumber(px) {
    return +px.replace(/px/, '');
}

function accordion(node, options) {
  var labels = t$3(".accordion__label", node);
  var content = t$3(".accordion__content", node); // Make it accessible by keyboard

  labels.forEach(function (label) {
    label.href = "#";
  });
  content.forEach(function (t) {
    return u$1(t, "measure");
  });
  var labelClick = e$3(labels, "click", function (e) {
    e.preventDefault();
    var label = e.currentTarget;
    var group = label.parentNode,
        content = label.nextElementSibling;
    slideStop(content);

    if (isVisible(content)) {
      _close(label, group, content);
    } else {
      _open(label, group, content);
    }
  });

  function _open(label, group, content) {
    slideDown(content);
    group.setAttribute("data-open", true);
    label.setAttribute("aria-expanded", true);
    content.setAttribute("aria-hidden", false);
  }

  function _close(label, group, content) {
    slideUp(content);
    group.setAttribute("data-open", false);
    label.setAttribute("aria-expanded", false);
    content.setAttribute("aria-hidden", true);
  }

  if (options.firstOpen) {
    // Open first accordion label
    var _labels$ = labels[0],
        group = _labels$.parentNode,
        _content = _labels$.nextElementSibling;

    _open(labels[0], group, _content);
  }

  function destroy() {
    return function () {
      return labelClick();
    };
  }

  return {
    destroy: destroy
  };
}

function Accordions(elements) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (Array.isArray(elements) && !elements.length) return;
  var defaultOptions = {
    firstOpen: true
  };
  var opts = Object.assign(defaultOptions, options);
  var accordions = [];

  if (elements.length) {
    accordions = elements.map(function (node) {
      return accordion(node, opts);
    });
  } else {
    accordions.push(accordion(elements, opts));
  }

  function unload() {
    accordions.forEach(function (accordion) {
      return accordion.destroy();
    });
  }

  return {
    unload: unload
  };
}

function Media(node) {
  if (!node) return;
  var _window = window,
      Shopify = _window.Shopify,
      YT = _window.YT;
  var elements = t$3("[data-interactive]", node);
  if (!elements.length) return;
  var acceptedTypes = ["video", "model", "external_video"];
  var activeMedia = null;
  var featuresLoaded = false;
  var instances = {};

  if (featuresLoaded) {
    elements.forEach(initElement);
  }

  window.Shopify.loadFeatures([{
    name: "model-viewer-ui",
    version: "1.0"
  }, {
    name: "shopify-xr",
    version: "1.0"
  }, {
    name: "video-ui",
    version: "1.0"
  }], function () {
    featuresLoaded = true;

    if ("YT" in window && Boolean(YT.loaded)) {
      elements.forEach(initElement);
    } else {
      window.onYouTubeIframeAPIReady = function () {
        elements.forEach(initElement);
      };
    }
  });

  function initElement(el) {
    var _el$dataset = el.dataset,
        mediaId = _el$dataset.mediaId,
        mediaType = _el$dataset.mediaType;
    if (!mediaType || !acceptedTypes.includes(mediaType)) return;
    if (Object.keys(instances).includes(mediaId)) return;
    var instance = {
      id: mediaId,
      type: mediaType,
      container: el,
      media: el.children[0]
    };

    switch (instance.type) {
      case "video":
        instance.player = new Shopify.Plyr(instance.media, {
          loop: {
            active: el.dataset.loop == "true"
          }
        });
        break;

      case "external_video":
        {
          instance.player = new YT.Player(instance.media); // This overlay makes it possible to swipe video embeds in carousels

          var overlay = n$2(".external-video-overlay", el);

          if (overlay) {
            e$3(overlay, "click", function (e) {
              var _instance$player;

              e.preventDefault(); // in some situations the iframe-js-api can't communicate and this is undef,
              // in this case lets faily quietly and remove the overlay (it won't come back)

              if ((_instance$player = instance.player) !== null && _instance$player !== void 0 && _instance$player.playVideo) {
                instance.player.playVideo();
              }

              u$1(overlay, "hidden");
            });
            instance.player.addEventListener("onStateChange", function (event) {
              if (event.data === 2) {
                i$1(overlay, "hidden");
              }
            });
          }

          break;
        }

      case "model":
        instance.viewer = new Shopify.ModelViewerUI(n$2("model-viewer", el));
        e$3(n$2(".model-poster", el), "click", function (e) {
          e.preventDefault();
          playModel(instance);
        });
        break;
    }

    instances[mediaId] = instance;

    if (instance.player) {
      if (instance.type === "video") {
        instance.player.on("playing", function () {
          pauseActiveMedia(instance);
          activeMedia = instance;
        });
      } else if (instance.type === "external_video") {
        instance.player.addEventListener("onStateChange", function (event) {
          if (event.data === 1) {
            pauseActiveMedia(instance);
            activeMedia = instance;
          }
        });
      }
    }
  }

  function playModel(instance) {
    pauseActiveMedia(instance);
    instance.viewer.play();
    u$1(instance.container, "model-active");
    activeMedia = instance;
    setTimeout(function () {
      n$2("model-viewer", instance.container).focus();
    }, 300);
  }

  function pauseActiveMedia(instance) {
    if (!activeMedia || instance == activeMedia) return;

    if (activeMedia.player) {
      if (activeMedia.type === "video") {
        activeMedia.player.pause();
      } else if (activeMedia.type === "external_video") {
        activeMedia.player.pauseVideo();
      }

      activeMedia = null;
      return;
    }

    if (activeMedia.viewer) {
      i$1(activeMedia.container, "model-active");
      activeMedia.viewer.pause();
      activeMedia = null;
    }
  }

  return {
    pauseActiveMedia: pauseActiveMedia
  };
}

var selectors$J = {
  idInput: '[name="id"]',
  optionInput: '[name^="options"]',
  quantityInput: "[data-quantity-input]",
  formQuantity: '[name="quantity"]',
  propertyInput: '[name^="properties"]'
};
function ProductForm(container, form, prod) {
  var config = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var product = validateProductObject(prod);
  var listeners = [];

  var getOptions = function getOptions() {
    return _serializeOptionValues(optionInputs, function (item) {
      var regex = /(?:^(options\[))(.*?)(?:\])/;
      item.name = regex.exec(item.name)[2]; // Use just the value between 'options[' and ']'

      return item;
    });
  };

  var getVariant = function getVariant() {
    return getVariantFromSerializedArray(product, getOptions());
  };

  var getProperties = function getProperties() {
    var properties = _serializePropertyValues(propertyInputs, function (propertyName) {
      var regex = /(?:^(properties\[))(.*?)(?:\])/;
      var name = regex.exec(propertyName)[2]; // Use just the value between 'properties[' and ']'

      return name;
    });

    return Object.entries(properties).length === 0 ? null : properties;
  };

  var getQuantity = function getQuantity() {
    return formQuantityInput[0] ? Number.parseInt(formQuantityInput[0].value, 10) : 1;
  };

  var getProductFormEventData = function getProductFormEventData() {
    return {
      options: getOptions(),
      variant: getVariant(),
      properties: getProperties(),
      quantity: getQuantity()
    };
  };

  var onFormEvent = function onFormEvent(cb) {
    if (typeof cb === "undefined") return;
    return function (event) {
      event.dataset = getProductFormEventData();
      cb(event);
    };
  };

  var setIdInputValue = function setIdInputValue(value) {
    var idInputElement = form.querySelector(selectors$J.idInput);

    if (!idInputElement) {
      idInputElement = document.createElement("input");
      idInputElement.type = "hidden";
      idInputElement.name = "id";
      form.appendChild(idInputElement);
    }

    idInputElement.value = value.toString();
  };

  var onSubmit = function onSubmit(event) {
    event.dataset = getProductFormEventData();
    setIdInputValue(event.dataset.variant.id);

    if (config.onFormSubmit) {
      config.onFormSubmit(event);
    }
  };

  var initInputs = function initInputs(selector, cb) {
    var elements = _toConsumableArray(container.querySelectorAll(selector));

    return elements.map(function (element) {
      listeners.push(e$3(element, "change", onFormEvent(cb)));
      return element;
    });
  };

  listeners.push(e$3(form, "submit", onSubmit));
  var optionInputs = initInputs(selectors$J.optionInput, config.onOptionChange);
  var formQuantityInput = initInputs(selectors$J.quantityInput, config.onQuantityChange);
  var propertyInputs = initInputs(selectors$J.propertyInput, config.onPropertyChange);

  var destroy = function destroy() {
    listeners.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  };

  return {
    getVariant: getVariant,
    destroy: destroy
  };
}

function validateProductObject(product) {
  if (_typeof(product) !== "object") {
    throw new TypeError(product + " is not an object.");
  }

  if (typeof product.variants[0].options === "undefined") {
    throw new TypeError("Product object is invalid. Make sure you use the product object that is output from {{ product | json }} or from the http://[your-product-url].js route");
  }

  return product;
}

function _serializeOptionValues(inputs, transform) {
  return inputs.reduce(function (options, input) {
    if (input.checked || // If input is a checked (means type radio or checkbox)
    input.type !== "radio" && input.type !== "checkbox" // Or if its any other type of input
    ) {
      options.push(transform({
        name: input.name,
        value: input.value
      }));
    }

    return options;
  }, []);
}

function _serializePropertyValues(inputs, transform) {
  return inputs.reduce(function (properties, input) {
    if (input.checked || // If input is a checked (means type radio or checkbox)
    input.type !== "radio" && input.type !== "checkbox" // Or if its any other type of input
    ) {
      properties[transform(input.name)] = input.value;
    }

    return properties;
  }, {});
}

var preventDefault = (function (fn) {
  return function (e) {
    e.preventDefault();
    fn();
  };
});

var selectors$I = {
  imageById: function imageById(id) {
    return "[data-media-item-id='".concat(id, "']");
  },
  imageWrapper: "[data-product-media-wrapper]",
  inYourSpace: "[data-in-your-space]"
};
var classes$l = {
  hidden: "hidden"
};
function switchImage (container, imageId, inYourSpaceButton) {
  var newImage = n$2(selectors$I.imageWrapper + selectors$I.imageById(imageId), container);
  var otherImages = t$3("".concat(selectors$I.imageWrapper, ":not(").concat(selectors$I.imageById(imageId), ")"), container);
  i$1(newImage, classes$l.hidden); // Update view in space button

  if (inYourSpaceButton) {
    if (newImage.dataset.mediaType === "model") {
      inYourSpaceButton.setAttribute("data-shopify-model3d-id", newImage.dataset.mediaItemId);
    }
  }

  otherImages.forEach(function (image) {
    return u$1(image, classes$l.hidden);
  });
}

function quantityInput (container) {
  var quantityWrapper = n$2(".quantity-input", container);
  if (!quantityWrapper) return;
  var quantityInput = n$2("[data-quantity-input]", quantityWrapper);
  var addQuantity = n$2("[data-add-quantity]", quantityWrapper);
  var subtractQuantity = n$2("[data-subtract-quantity]", quantityWrapper);

  var handleAddQuantity = function handleAddQuantity() {
    var currentValue = parseInt(quantityInput.value);
    var newValue = currentValue + 1;
    quantityInput.value = newValue;
    quantityInput.dispatchEvent(new Event("change"));
  };

  var handleSubtractQuantity = function handleSubtractQuantity() {
    var currentValue = parseInt(quantityInput.value);
    if (currentValue === 1) return;
    var newValue = currentValue - 1;
    quantityInput.value = newValue;
    quantityInput.dispatchEvent(new Event("change"));
  };

  var events = [e$3(addQuantity, "click", handleAddQuantity), e$3(subtractQuantity, "click", handleSubtractQuantity)];

  var unload = function unload() {
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  };

  return {
    unload: unload
  };
}

var selectors$H = {
  popupTrigger: "[data-popup-trigger]"
};

var informationPopup = function informationPopup(node) {
  var events = [];
  var popupTriggers = t$3(selectors$H.popupTrigger, node);

  if (!popupTriggers.length) {
    return;
  }

  var listener = e$3(popupTriggers, "click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var modalContentId = e.target.dataset.modalContentId;
    var content = n$2("#".concat(modalContentId), node);
    r$2("modal:open", null, {
      modalContent: content
    });
  });
  events.push(listener);

  function unload() {
    events.forEach(function (evt) {
      return evt();
    });
  }

  return {
    unload: unload
  };
};

var selectors$G = {
  moreButton: "[data-more-media]",
  moreBar: "[data-more-media-bar]",
  productMedia: "[data-product-media]"
};
var states = {
  closed: "closed",
  beforeOpen: "beforeOpen",
  opening: "opening",
  open: "open"
};

var moreMedia = function moreMedia(node) {
  var moreButton = n$2(selectors$G.moreButton, node);

  if (!moreButton) {
    return;
  }

  var moreBar = n$2(selectors$G.moreBar, node);
  var productMedia = n$2(selectors$G.productMedia, node);
  var initialAR = parseFloat(window.getComputedStyle(productMedia).aspectRatio);
  var isOpen = false;

  var updateText = function updateText(open) {
    moreButton.innerHTML = moreButton.dataset[open ? "langLessMedia" : "langMoreMedia"];
  };

  var close = function close() {
    if (!isOpen) return;

    if (!isFinite(initialAR)) {
      // If AR is NaN it's either 'auto' or unsupported by the browser,
      // in which case we can't transition it. Instead, jump directly to
      // the final state.
      productMedia.dataset.productMedia = states.closed;
      isOpen = false;
      updateText(false);
      return;
    }

    productMedia.dataset.productMedia = states.opening;
    window.requestAnimationFrame(function () {
      var transitionEnd = e$3(productMedia, "transitionend", function () {
        transitionEnd();
        productMedia.dataset.productMedia = states.closed;
        isOpen = false;
      });
      productMedia.dataset.productMedia = states.beforeOpen;
      updateText(false);
    });
  };

  var open = function open() {
    if (isOpen) return;

    if (!isFinite(initialAR)) {
      // If AR is NaN it's either 'auto' or unsupported by the browser,
      // in which case we can't transition it. Instead, jump directly to
      // the final state.
      productMedia.dataset.productMedia = states.open;
      isOpen = true;
      updateText(true);
      return;
    }

    productMedia.dataset.productMedia = states.beforeOpen;
    window.requestAnimationFrame(function () {
      var _productMedia$getBoun = productMedia.getBoundingClientRect(),
          width = _productMedia$getBoun.width;

      var scrollHeight = productMedia.scrollHeight;
      var gridGap = parseInt(window.getComputedStyle(productMedia).rowGap, 10);
      var barBottom = parseInt(window.getComputedStyle(moreBar).bottom, 10);
      var openAspectRatio = width / (scrollHeight - gridGap - barBottom);
      productMedia.style.setProperty("--overflow-gallery-aspect-ratio-open", openAspectRatio);
      var transitionEnd = e$3(productMedia, "transitionend", function (e) {
        if (e.target !== productMedia) {
          // Ignore any bubbled up event from image load transitions, etc.
          return;
        }

        transitionEnd();
        productMedia.dataset.productMedia = states.open;
        isOpen = true;
      });
      productMedia.dataset.productMedia = states.opening;
      updateText(true);
    });
  };

  var clickListener = e$3(moreButton, "click", function () {
    isOpen ? close() : open();
  });
  var resizeListener = e$3(window, "resize", function () {
    return close();
  });
  var events = [clickListener, resizeListener];

  var unload = function unload() {
    events.forEach(function (evt) {
      return evt();
    });
  };

  return {
    unload: unload
  };
};

var strings$3 = window.theme.strings.products;
var selectors$F = {
  price: "[data-price]",
  comparePrice: "[data-compare-price]"
};
function updatePrices (container, variant) {
  var price = t$3(selectors$F.price, container);
  var comparePrice = t$3(selectors$F.comparePrice, container);
  var unavailableString = strings$3.product.unavailable;

  if (!variant) {
    price.forEach(function (el) {
      return el.innerHTML = unavailableString;
    });
    comparePrice.forEach(function (el) {
      return el.innerHTML = "";
    });
    return;
  }

  price.forEach(function (el) {
    return el.innerHTML = formatMoney(variant.price);
  });
  comparePrice.forEach(function (el) {
    return el.innerHTML = variant.compare_at_price > variant.price ? formatMoney(variant.compare_at_price) : "";
  });
}

var selectors$E = {
  productSku: "[data-product-sku]",
  productSkuContainer: ".product__vendor_and_sku"
};
var strings$2 = window.theme.strings.products;
function updateSku (container, variant) {
  var skuElement = n$2(selectors$E.productSku, container);
  var skuContainer = n$2(selectors$E.productSkuContainer, container);
  if (!skuElement) return;
  var sku = strings$2.product.sku;

  var skuString = function skuString(value) {
    return "".concat(sku, ": ").concat(value);
  };

  if (!variant || !variant.sku) {
    skuElement.innerText = "";
    skuContainer.setAttribute("data-showing-sku", false);
    return;
  }

  skuElement.innerText = skuString(variant.sku);
  skuContainer.setAttribute("data-showing-sku", true);
}

function updateBuyButton (btn, variant) {
  var text = n$2("[data-add-to-cart-text]", btn);
  var _btn$dataset = btn.dataset,
      langAvailable = _btn$dataset.langAvailable,
      langUnavailable = _btn$dataset.langUnavailable,
      langSoldOut = _btn$dataset.langSoldOut;

  if (!variant) {
    btn.setAttribute("disabled", "disabled");
    text.textContent = langUnavailable;
  } else if (variant.available) {
    btn.removeAttribute("disabled");
    text.textContent = langAvailable;
  } else {
    btn.setAttribute("disabled", "disabled");
    text.textContent = langSoldOut;
  }
}

var selectors$D = {
  accordionShell: ".accordion.product-reviews",
  accordionContent: ".accordion__content"
};
var classes$k = {
  hidden: "hidden",
  accordion: "accordion"
};
function reviewsHandler (node, container) {
  if (!node) return;
  var parentAppBlockContainer = node.parentNode;
  var accordion = n$2(selectors$D.accordionShell, container);
  var accordionContent = n$2(selectors$D.accordionContent, accordion); // Move the contents of the reviews app into the accordion shell
  // Then move the contents with the accrdion back into the original
  // location.

  accordionContent.appendChild(node);
  parentAppBlockContainer.appendChild(accordion);
  u$1(parentAppBlockContainer, classes$k.accordion);
  i$1(accordion, classes$k.hidden);
}

function OptionButtons(els) {
  var groups = els.map(createOptionGroup);

  function destroy() {
    groups && groups.forEach(function (group) {
      return group();
    });
  }

  return {
    groups: groups,
    destroy: destroy
  };
}

function createOptionGroup(el) {
  var select = n$2("select", el);
  var buttons = t$3("[data-button]", el);
  var buttonClick = e$3(buttons, "click", function (e) {
    e.preventDefault();
    var buttonEl = e.currentTarget;
    var optionHandle = buttonEl.dataset.optionHandle;
    buttons.forEach(function (btn) {
      l(btn, "selected", btn.dataset.optionHandle === optionHandle);
    });
    var opt = n$2("[data-value-handle=\"".concat(optionHandle, "\"]"), select);
    opt.selected = true;
    select.dispatchEvent(new Event("change"));
  });
  return function () {
    return buttonClick();
  };
}

var selectors$C = {
  counterContainer: "[data-inventory-counter]",
  inventoryMessage: ".inventory-counter__message",
  countdownBar: ".inventory-counter__bar",
  progressBar: ".inventory-counter__bar-progress"
};
var classes$j = {
  active: "active",
  inventoryLow: "inventory--low",
  inventoryEmpty: "inventry--empty"
};

var inventoryCounter = function inventoryCounter(container, config) {
  var variantsInventories = config.variantsInventories;
  var counterContainer = n$2(selectors$C.counterContainer, container);
  var inventoryMessageElement = n$2(selectors$C.inventoryMessage, container);
  var progressBar = n$2(selectors$C.progressBar, container);
  var _counterContainer$dat = counterContainer.dataset,
      lowInventoryThreshold = _counterContainer$dat.lowInventoryThreshold,
      stockCountdownMax = _counterContainer$dat.stockCountdownMax; // If the threshold or countdownmax contains anything but numbers abort

  if (!lowInventoryThreshold.match(/^[0-9]+$/) || !stockCountdownMax.match(/^[0-9]+$/)) {
    return;
  }

  var threshold = parseInt(lowInventoryThreshold, 10);
  var countDownMax = parseInt(stockCountdownMax, 10);
  l(counterContainer, classes$j.active, productIventoryValid(variantsInventories[config.id]));
  checkThreshold(variantsInventories[config.id]);
  setProgressBar(variantsInventories[config.id].inventory_quantity);
  setInventoryMessage(variantsInventories[config.id].inventory_message);

  function checkThreshold(_ref) {
    var inventory_policy = _ref.inventory_policy,
        inventory_quantity = _ref.inventory_quantity,
        inventory_management = _ref.inventory_management;
    i$1(counterContainer, classes$j.inventoryLow);

    if (inventory_management !== null && inventory_policy === "deny") {
      if (inventory_quantity <= 0) {
        u$1(counterContainer, classes$j.inventoryEmpty);
        counterContainer.setAttribute("data-stock-category", "empty");
      } else if (inventory_quantity <= threshold) {
        counterContainer.setAttribute("data-stock-category", "low");
      } else {
        counterContainer.setAttribute("data-stock-category", "sufficient");
      }
    }
  }

  function setProgressBar(inventoryQuantity) {
    if (inventoryQuantity <= 0) {
      progressBar.style.width = "".concat(0, "%");
      return;
    }

    var progressValue = inventoryQuantity < countDownMax ? inventoryQuantity / countDownMax * 100 : 100;
    progressBar.style.width = "".concat(progressValue, "%");
  }

  function setInventoryMessage(message) {
    inventoryMessageElement.innerText = message;
  }

  function productIventoryValid(product) {
    return product.inventory_message && product.inventory_policy === "deny";
  }

  var update = function update(variant) {
    l(counterContainer, classes$j.active, variant && productIventoryValid(variantsInventories[variant.id]));
    if (!variant) return;
    checkThreshold(variantsInventories[variant.id]);
    setProgressBar(variantsInventories[variant.id].inventory_quantity);
    setInventoryMessage(variantsInventories[variant.id].inventory_message);
  };

  return {
    update: update
  };
};

// LERP returns a number between start and end based on the amt
// Often used to smooth animations
// Eg. Given: start = 0, end = 100
// - if amt = 0.1 then lerp will return 10
// - if amt = 0.5 then lerp will return 50
// - if amt = 0.9 then lerp will return 90
var lerp = function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
};

var selectors$B = {
  productMeta: ".product__meta"
};
var classes$i = {
  hasSticky: "product--has-sticky-scroll"
};
function stickyScroll (node) {
  var productMeta = n$2(selectors$B.productMeta, node);
  node.style.setProperty("--product-meta-top", 0); // Init position vars
  // The previous scroll position of the page

  var previousScrollY = window.scrollY; // To keep track of the amount scrolled per event

  var currentScrollAmount = 0; // Height of the header bar, used for calculating position
  // Set in `_observeHeight()` when the --header-desktop-sticky-height var is set

  var headerHeight = 0; // The value to set the product meta `top` value to

  var metaTop = headerHeight;
  var metaTopPrevious = metaTop; // The height of the product meta container
  // Gets updated by a resize observer on the window and the meta container

  var metaHeight = productMeta.offsetHeight; // The height of the product meta container plus the height of the header

  var metaHeightWithHeader = metaHeight + headerHeight; // The max amount to set the meta `top` value
  // This is equal to the number of pixels
  // that the meta container is hidden by the viewport.
  // Gets updated by a resize observer on the window and the meta container

  var metaMaxTop = metaHeightWithHeader - window.innerHeight; // Whatch scroll updates

  var scroller = srraf(function (_ref) {
    var y = _ref.y;

    _scrollHandler(y);
  }); // Resize observer on the window and the product meta
  // Things like accordions can change the height of the meta container

  var resizeObserver = new ResizeObserver(_observeHeight);
  resizeObserver.observe(productMeta);
  resizeObserver.observe(document.documentElement); // Start the animation loop

  requestAnimationFrame(function () {
    return _updateMetaTopLoop();
  });

  function _observeHeight() {
    metaHeight = productMeta.offsetHeight;
    headerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-desktop-sticky-height").replace(/px/gi, ""));
    metaHeightWithHeader = metaHeight + headerHeight;
    metaMaxTop = metaHeightWithHeader - window.innerHeight; // Check if the product meta container is taller than the viewport
    // and section container has room for the meta to scroll.
    // The product meta could be taller than the images
    // so it won't have room to scroll.

    if (metaHeightWithHeader > window.innerHeight && node.offsetHeight > metaHeightWithHeader) {
      u$1(node, classes$i.hasSticky);

      _scrollHandler(window.scrollY);
    } else {
      i$1(node, classes$i.hasSticky);
    }
  }

  function _scrollHandler(y) {
    currentScrollAmount = previousScrollY - y; // The offset based on how far the page has been scrolled from last event

    var currentScrollOffset = metaTop + currentScrollAmount; // The max top value while scrolling up

    var topMax = headerHeight; // The max top value while scrolling down

    var bottomMax = -metaMaxTop + headerHeight - 40; // Calculate the current top value based on the currentScrollOffset value
    // in the range of topMax and bottomMax.

    metaTop = Math.max(bottomMax, Math.min(currentScrollOffset, topMax)); // Update the previous scroll position for next time.

    previousScrollY = y;
  } // This is an endless RAF loop used to update the top position CSS var.
  // We're using this with a LERP function to smooth out the position updating
  // instead of having large jumps while scrolling fast.


  function _updateMetaTopLoop() {
    // We want to continue to update the top var until fully into the stopped position
    if (metaTop !== metaTopPrevious) {
      metaTopPrevious = lerp(metaTopPrevious, metaTop, 0.5);
      node.style.setProperty("--product-meta-top", "".concat(metaTopPrevious, "px"));
    }

    requestAnimationFrame(function () {
      return _updateMetaTopLoop();
    });
  }

  function destroy() {
    scroller === null || scroller === void 0 ? void 0 : scroller.scroller.destroy();
    resizeObserver === null || resizeObserver === void 0 ? void 0 : resizeObserver.disconnect();
  }

  return {
    destroy: destroy
  };
}

window.theme.strings.products;
var selectors$A = {
  unitPriceContainer: "[data-unit-price-container]",
  unitPrice: "[data-unit-price]",
  unitPriceBase: "[data-unit-base]"
};
var classes$h = {
  available: "unit-price--available"
};

var updateUnitPrices = function updateUnitPrices(container, variant) {
  var unitPriceContainers = t$3(selectors$A.unitPriceContainer, container);
  var unitPrices = t$3(selectors$A.unitPrice, container);
  var unitPriceBases = t$3(selectors$A.unitPriceBase, container);
  var showUnitPricing = !variant || !variant.unit_price;
  l(unitPriceContainers, classes$h.available, !showUnitPricing);
  if (!variant || !variant.unit_price) return;

  _replaceText(unitPrices, formatMoney(variant.unit_price));

  _replaceText(unitPriceBases, _getBaseUnit(variant.unit_price_measurement));
};

var _getBaseUnit = function _getBaseUnit(unitPriceMeasurement) {
  return unitPriceMeasurement.reference_value === 1 ? unitPriceMeasurement.reference_unit : unitPriceMeasurement.reference_value + unitPriceMeasurement.reference_unit;
};

var _replaceText = function _replaceText(nodeList, replacementText) {
  nodeList.forEach(function (node) {
    return node.innerText = replacementText;
  });
};

var storeAvailability = function storeAvailability(container, product, variant) {
  var update = function update(variant) {
    container.innerHTML = "";
    if (!variant) return;
    var variantSectionUrl = "".concat(container.dataset.baseUrl, "/variants/").concat(variant.id, "/?section_id=store-availability");
    makeRequest("GET", variantSectionUrl).then(function (storeAvailabilityHTML) {
      if (storeAvailabilityHTML.trim() === "") return; // Remove section wrapper that throws nested sections error

      container.innerHTML = storeAvailabilityHTML.trim();
      container.innerHTML = container.firstElementChild.innerHTML;
      container.setAttribute("data-variant-id", variant.id);
      container.setAttribute("data-product-title", product.title);
      container.setAttribute("data-variant-title", variant.public_title);
    });
  }; // Intialize


  update(variant);

  var unload = function unload() {
    container.innerHTML = "";
  };

  return {
    unload: unload,
    update: update
  };
};

var selectors$z = {
  form: "[data-product-form]",
  addToCart: "[data-add-to-cart]",
  variantSelect: "[data-variant-select]",
  optionById: function optionById(id) {
    return "[value='".concat(id, "']");
  },
  thumbs: "[data-product-thumbnails]",
  thumb: "[data-product-thumbnail]",
  storeAvailability: "[data-store-availability-container]",
  quantityError: "[data-quantity-error]",
  productOption: ".product__option",
  optionLabelValue: "[data-selected-value-for-option]",
  displayedDiscount: "[data-discount-display]",
  displayedDiscountByVariantId: function displayedDiscountByVariantId(id) {
    return "[variant-discount-display][variant-id=\"".concat(id, "\"]");
  },
  nonSprRatingCountLink: ".product__rating-count-potential-link",
  photosMobile: ".product__media-container.below-mobile",
  photosDesktop: ".product__media-container.above-mobile",
  priceWrapper: ".product__price",
  quickCart: ".quick-cart",
  purchaseConfirmation: ".purchase-confirmation-popup",
  productReviews: "#shopify-product-reviews"
};

var Product = /*#__PURE__*/function () {
  function Product(node) {
    var _this = this;

    _classCallCheck(this, Product);

    this.container = node;
    this.accordions = [];
    var _this$container$datas = this.container.dataset,
        isQuickView = _this$container$datas.isQuickView,
        isFullProduct = _this$container$datas.isFullProduct,
        isFeaturedProduct = _this$container$datas.isFeaturedProduct,
        enableStickyProductDetails = _this$container$datas.enableStickyProductDetails;
    this.isQuickView = isQuickView;
    this.isFullProduct = isFullProduct;
    this.isFeaturedProduct = isFeaturedProduct;
    this.formElement = n$2(selectors$z.form, this.container);
    this.quantityError = n$2(selectors$z.quantityError, this.container);
    this.displayedDiscount = n$2(selectors$z.displayedDiscount, this.container);
    this.viewInYourSpace = n$2("[data-in-your-space]", this.container);
    this.viewInYourSpace && l(this.viewInYourSpace, "visible", isMobile$1());
    this.photosDesktop = n$2(selectors$z.photosDesktop, this.container);
    this.breakPointHandler = atBreakpointChange(960, function () {
      if (window.matchMedia(getMediaQuery("below-960")).matches) {
        _this._initPhotoCarousel();
      } else {
        var _this$mobileSwiper;

        (_this$mobileSwiper = _this.mobileSwiper) === null || _this$mobileSwiper === void 0 ? void 0 : _this$mobileSwiper.destroy();
      }
    });

    if (window.matchMedia(getMediaQuery("below-960")).matches) {
      this._initPhotoCarousel();
    }

    this.productThumbnails = n$2(selectors$z.thumbs, this.container);
    this.productThumbnailItems = t$3(selectors$z.thumb, this.container);

    if (this.productThumbnails) {
      this.productThumbnailsScroller = scrollContainer(this.productThumbnails);
    }

    this.moreMedia = moreMedia(this.container); // Handle Surface pickup

    this.storeAvailabilityContainer = n$2(selectors$z.storeAvailability, this.container);
    this.availability = null; // Handle Shopify Product Reviews if they exist as a product block

    this.reviewsHandler = reviewsHandler(n$2(selectors$z.productReviews, this.container), this.container); // // non-SPR rating display

    var nonSprRatingCount = n$2(selectors$z.nonSprRatingCountLink, this.container);

    if (nonSprRatingCount && !n$2(selectors$z.productReviews, document)) {
      // The rating count links to "#shopify-product-reviews" but
      // if that block doesn't exist we should remove the link
      nonSprRatingCount.removeAttribute("href");
    }

    if (this.formElement) {
      var _this$formElement$dat = this.formElement.dataset,
          productHandle = _this$formElement$dat.productHandle,
          currentProductId = _this$formElement$dat.currentProductId;
      var product = getProduct(productHandle);
      product(function (data) {
        var variant = getVariantFromId(data, parseInt(currentProductId));

        if (_this.storeAvailabilityContainer && variant) {
          _this.availability = storeAvailability(_this.storeAvailabilityContainer, data, variant);
        }

        _this.productForm = ProductForm(_this.container, _this.formElement, data, {
          onOptionChange: function onOptionChange(e) {
            return _this.onOptionChange(e);
          },
          onFormSubmit: function onFormSubmit(e) {
            return _this.onFormSubmit(e);
          },
          onQuantityChange: function onQuantityChange(e) {
            return _this.onQuantityChange(e);
          }
        });
        var productInventoryJson = n$2("[data-product-inventory-json]", _this.container);

        if (productInventoryJson) {
          var jsonData = JSON.parse(productInventoryJson.innerHTML);
          var variantsInventories = jsonData.inventory;

          if (variantsInventories) {
            var config = {
              id: variant.id,
              variantsInventories: variantsInventories
            };
            _this.inventoryCounter = inventoryCounter(_this.container, config);
          }
        }
      });
    }

    this.quantityInput = quantityInput(this.container);
    this.socialButtons = t$3("[data-social-share]", this.container);

    if (enableStickyProductDetails === "true" && !isMobile$1()) {
      this.stickyScroll = stickyScroll(this.container);
    }

    var accordionElements = t$3(".accordion", this.container);
    accordionElements.forEach(function (accordion) {
      var accordionOpen = accordion.classList.contains("accordion--open");

      _this.accordions.push(Accordions(accordion, {
        firstOpen: accordionOpen
      }));

      var accordionParent = accordion.parentElement;

      if (accordionParent.classList.contains("rte--product") && !accordionParent.classList.contains("accordion accordion--product")) {
        accordion.classList.add("rte--product", "accordion--product");
      }
    });
    this.mediaContainers = Media(n$2(".product__media-container.above-mobile", this.container));
    this.mediaContainersMobile = Media(n$2(".product__media-container.below-mobile", this.container));
    this.optionButtons = OptionButtons(t$3("[data-option-buttons]", this.container));
    this.informationPopup = informationPopup(this.container);
    var productDescriptionWrapper = n$2(".product__description", this.container);

    if (productDescriptionWrapper) {
      wrapIframes(t$3("iframe", productDescriptionWrapper));
      wrapTables(t$3("table", productDescriptionWrapper));
    }

    var socialShareContainer = n$2(".social-share", this.container);

    if (socialShareContainer) {
      this.socialShare = SocialShare(socialShareContainer);
    }

    this._initEvents();
  }

  _createClass(Product, [{
    key: "_initEvents",
    value: function _initEvents() {
      var _this2 = this;

      this.events = [e$3(this.productThumbnailItems, "click", function (e) {
        e.preventDefault();
        var dataset = e.currentTarget.dataset;

        _this2.productThumbnailItems.forEach(function (thumb) {
          return i$1(thumb, "active");
        });

        u$1(e.currentTarget, "active");
        switchImage(_this2.photosDesktop, dataset.thumbnailId, _this2.viewInYourSpace);
      })];
    }
  }, {
    key: "_initPhotoCarousel",
    value: function _initPhotoCarousel() {
      var _this3 = this;

      var swiperWrapper = n$2(selectors$z.photosMobile, this.container);
      import(flu.chunks.swiper).then(function (_ref) {
        var Swiper = _ref.Swiper,
            Pagination = _ref.Pagination;
        _this3.mobileSwiper = new Swiper(swiperWrapper, {
          modules: [Pagination],
          slidesPerView: 1,
          spaceBetween: 4,
          grabCursor: true,
          pagination: {
            el: ".swiper-pagination",
            type: "bullets",
            clickable: true
          },
          watchSlidesProgress: true
        });

        _this3.mobileSwiper.on("slideChange", function (evt) {
          if (_this3.viewInYourSpace) {
            var activeSlide = evt.slides[evt.activeIndex];

            if (activeSlide.dataset.mediaType === "model") {
              _this3.viewInYourSpace.setAttribute("data-shopify-model3d-id", activeSlide.dataset.mediaItemId);
            }
          }

          _this3.mediaContainersMobile && _this3.mediaContainersMobile.pauseActiveMedia();
        });
      });
    } // When the user changes a product option

  }, {
    key: "onOptionChange",
    value: function onOptionChange(_ref2) {
      var variant = _ref2.dataset.variant,
          srcElement = _ref2.srcElement;
      // Update option label
      var optionParentWrapper = srcElement.closest(selectors$z.productOption);
      var optionLabel = n$2(selectors$z.optionLabelValue, optionParentWrapper);

      if (optionLabel) {
        optionLabel.textContent = srcElement.value;
      }

      var buyButton = n$2(selectors$z.addToCart, this.container);
      var priceWrapper = n$2(selectors$z.priceWrapper, this.container);
      l(priceWrapper, "hide", !variant); // Update prices to reflect selected variant

      updatePrices(this.container, variant); // Update buy button

      updateBuyButton(buyButton, variant); // Update unit pricing

      updateUnitPrices(this.container, variant); // Update sku

      updateSku(this.container, variant); // Update product availability content

      this.availability && this.availability.update(variant); // Update displayed discount

      if (this.displayedDiscount) {
        var newDiscountEl = variant && n$2(selectors$z.displayedDiscountByVariantId(variant.id), this.container);

        if (variant && newDiscountEl) {
          this.displayedDiscount.textContent = newDiscountEl.textContent;
        } else {
          this.displayedDiscount.textContent = "";
        }
      }

      this.inventoryCounter && this.inventoryCounter.update(variant);
      dispatchCustomEvent("product:variant-change", {
        variant: variant
      });

      if (!variant) {
        updateBuyButton(n$2("[data-add-to-cart]", this.container), false);
        this.availability && this.availability.unload();
        return;
      } // Update URL with selected variant


      var url = getUrlWithVariant(window.location.href, variant.id);
      window.history.replaceState({
        path: url
      }, "", url); // We need to set the id input manually so the Dynamic Checkout Button works

      var selectedVariantOpt = n$2("".concat(selectors$z.variantSelect, " ").concat(selectors$z.optionById(variant.id)), this.container);
      selectedVariantOpt.selected = true; // We need to dispatch an event so Shopify pay knows the form has changed

      this.formElement.dispatchEvent(new Event("change")); // Update selected variant image and thumb

      if (variant.featured_media) {
        if (this.isFullProduct) {
          if (this.mobileSwiper) {
            var slidesWrap = this.mobileSwiper.el;
            var targetSlide = n$2("[data-media-item-id=\"".concat(variant.featured_media.id, "\"]"), slidesWrap);

            if (targetSlide) {
              var targetSlideIndex = _toConsumableArray(targetSlide.parentElement.children).indexOf(targetSlide);

              this.mobileSwiper.slideTo(targetSlideIndex);
            }
          } else {
            var imagesWrap = n$2(".product__media-container.above-mobile");

            if (imagesWrap.dataset.galleryStyle === "thumbnails") {
              switchImage(this.photosDesktop, variant.featured_media.id, this.viewInYourSpace);
              var thumb = n$2("[data-thumbnail-id=\"".concat(variant.featured_media.id, "\"]"), this.photosDesktop);
              this.productThumbnailItems.forEach(function (thumb) {
                return i$1(thumb, "active");
              });
              u$1(thumb, "active");
            } else {
              var targetImage = n$2(".product__media-container.above-mobile [data-media-id=\"".concat(variant.featured_media.id, "\"]"));

              if (this.isFeaturedProduct) {
                this.switchCurrentImage(variant.featured_media.id);
              } else {
                targetImage.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "nearest"
                });
              }
            }
          }
        } else {
          this.switchCurrentImage(variant.featured_media.id);
        }
      }
    }
  }, {
    key: "switchCurrentImage",
    value: function switchCurrentImage(id) {
      var imagesWraps = t$3(".product__media", this.container);
      imagesWraps.forEach(function (imagesWrap) {
        return switchImage(imagesWrap, id);
      });
    } // When user updates quantity

  }, {
    key: "onQuantityChange",
    value: function onQuantityChange(_ref3) {
      var _ref3$dataset = _ref3.dataset,
          variant = _ref3$dataset.variant,
          quantity = _ref3$dataset.quantity;

      // Adjust the hidden quantity input within the form
      var quantityInputs = _toConsumableArray(t$3('[name="quantity"]', this.formElement));

      quantityInputs.forEach(function (quantityInput) {
        quantityInput.value = quantity;
      });
      dispatchCustomEvent("product:quantity-update", {
        quantity: quantity,
        variant: variant
      });
    } // When user submits the product form

  }, {
    key: "onFormSubmit",
    value: function onFormSubmit(e) {
      var _this4 = this;

      var purchaseConfirmation = n$2(selectors$z.purchaseConfirmation, document);
      var quickCart = n$2(selectors$z.quickCart, document);
      var isQuickViewForm = Boolean(e.target.closest(".quick-product")); // if quick cart and confirmation popup are enable submit form

      if (!purchaseConfirmation && !quickCart && !isQuickViewForm) return;
      e.preventDefault();
      u$1(this.quantityError, "hidden");
      var button = n$2(selectors$z.addToCart, this.container);
      u$1(button, "loading");
      cart.addItem(this.formElement).then(function (_ref4) {
        var item = _ref4.item;
        i$1(button, "loading");

        if (purchaseConfirmation && !isMobile$1()) {
          r$2("confirmation-popup:open", null, {
            product: item
          });
        } else {
          r$2("quick-cart:open");
        }

        dispatchCustomEvent("cart:item-added", {
          product: item
        });
      }).catch(function (error) {
        cart.get(); // update local cart data

        if (error && error.message) {
          _this4.quantityError.innerText = error.message;
        } else {
          _this4.quantityError.innerText = _this4.quantityErorr.getAttribute("data-fallback-error-message");
        }

        i$1(_this4.quantityError, "hidden");
        var button = n$2(selectors$z.addToCart, _this4.container);
        i$1(button, "loading");
      });
    }
  }, {
    key: "unload",
    value: function unload() {
      var _this$quantityInput, _this$mobileSwiper2, _this$stickyScroll, _this$moreMedia;

      this.productForm.destroy();
      this.accordions.forEach(function (accordion) {
        return accordion.unload();
      });
      this.optionButtons.destroy();
      (_this$quantityInput = this.quantityInput) === null || _this$quantityInput === void 0 ? void 0 : _this$quantityInput.unload();
      this.events.forEach(function (unsubscribe) {
        return unsubscribe();
      });
      (_this$mobileSwiper2 = this.mobileSwiper) === null || _this$mobileSwiper2 === void 0 ? void 0 : _this$mobileSwiper2.destroy();
      (_this$stickyScroll = this.stickyScroll) === null || _this$stickyScroll === void 0 ? void 0 : _this$stickyScroll.destroy();
      (_this$moreMedia = this.moreMedia) === null || _this$moreMedia === void 0 ? void 0 : _this$moreMedia.unload();
    }
  }]);

  return Product;
}();

var classes$g = {
  visible: "is-visible",
  active: "active",
  fixed: "is-fixed"
};
var selectors$y = {
  closeBtn: "[data-modal-close]",
  wash: ".modal__wash",
  modalContent: ".quick-view-modal__content",
  loadingMessage: ".quick-view-modal-loading-indicator"
};

var quickViewModal = function quickViewModal(node) {
  var focusTrap = createFocusTrap(node, {
    allowOutsideClick: true
  });
  var wash = n$2(selectors$y.wash, node);
  var closeButton = n$2(selectors$y.closeBtn, node);
  var modalContent = n$2(selectors$y.modalContent, node);
  var loadingMessage = n$2(selectors$y.loadingMessage, node);
  var quickViewAnimation = null;

  if (shouldAnimate(node)) {
    quickViewAnimation = animateQuickView(node);
  }

  var product;
  var events = [e$3([wash, closeButton], "click", function (e) {
    e.preventDefault();

    _close();
  }), e$3(node, "keydown", function (_ref) {
    var keyCode = _ref.keyCode;
    if (keyCode === 27) _close();
  }), c("quick-view:open", function (state, _ref2) {
    var productUrl = _ref2.productUrl;

    _renderProductContent(productUrl);

    _open();
  }), c("quick-view:close", function () {
    _close();
  })];

  var _renderProductContent = function _renderProductContent(productUrl) {
    var xhrUrl = "".concat(productUrl).concat(productUrl.includes("?") ? "&" : "?", "view=quick-view");
    makeRequest("GET", xhrUrl).then(function (response) {
      var container = document.createElement("div");
      container.innerHTML = response;
      var productElement = n$2("[data-is-quick-view]", container);
      i$1(modalContent, "empty");
      modalContent.innerHTML = "";
      modalContent.appendChild(productElement);
      var renderedProductElement = n$2("[data-is-quick-view]", modalContent);

      if (shouldAnimate(node)) {
        quickViewAnimation.animate();
      }

      product = new Product(renderedProductElement);
      focusTrap.activate();
    });
  };

  var _open = function _open() {
    u$1(node, classes$g.fixed);
    setTimeout(function () {
      u$1(node, classes$g.active);
      setTimeout(function () {
        u$1(node, classes$g.visible);
      }, 50);
    }, 50);
    disableBodyScroll(node, {
      allowTouchMove: function allowTouchMove(el) {
        while (el && el !== document.body) {
          if (el.getAttribute("data-scroll-lock-ignore") !== null) {
            return true;
          }

          el = el.parentNode;
        }
      },
      reserveScrollBarGap: true
    });
  };

  var _close = function _close() {
    focusTrap.deactivate();
    i$1(node, classes$g.visible);
    i$1(node, classes$g.active);
    enableBodyScroll(node);
    setTimeout(function () {
      i$1(node, classes$g.fixed);

      if (shouldAnimate(node)) {
        quickViewAnimation.reset();
      }

      modalContent.innerHTML = "";
      modalContent.appendChild(loadingMessage);
      u$1(modalContent, "empty");
      product.unload();
    }, 500);
  };

  var unload = function unload() {
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  };

  return {
    unload: unload
  };
};

var icons$1 = window.theme.icons;
function productLightbox() {
  var lightboxImages = t$3(".lightbox-image", document);
  if (!lightboxImages.length) return;
  var productLightbox;
  import(flu.chunks.photoswipe).then(function (_ref) {
    var PhotoSwipeLightbox = _ref.PhotoSwipeLightbox,
        PhotoSwipe = _ref.PhotoSwipe;
    productLightbox = new PhotoSwipeLightbox({
      gallery: ".lightbox-media-container",
      children: ".lightbox-image",
      pswpModule: PhotoSwipe,
      mainClass: "pswp--product-lightbox",
      bgOpacity: 1,
      arrowPrevSVG: icons$1.chevron,
      arrowNextSVG: icons$1.chevron,
      closeSVG: icons$1.close,
      zoomSVG: icons$1.zoom
    });
    productLightbox.init(); // Hide nav ui elements if single image

    productLightbox.on("firstUpdate", function () {
      var _productLightbox = productLightbox,
          pswp = _productLightbox.pswp,
          options = _productLightbox.options;
      var productImageCount = options.dataSource.items.length;

      if (productImageCount === 1) {
        u$1(pswp.element, "pswp--is-single-image");
      }
    });
  });
}

var classes$f = {
  visible: "is-visible"
};

var flashAlertModal = function flashAlertModal(node) {
  // Setup all preassigned liquid flash alerts
  if (window.Shopify.designMode) {
    var delegate = new Delegate(document.body);
    delegate.on("click", "[data-flash-trigger]", function (_, target) {
      var flashMessage = target.dataset.flashMessage;

      _open(flashMessage);
    });
  }

  c("flart-alert", function (_ref) {
    var alert = _ref.alert;

    _open(alert);
  });

  var _open = function _open(alertMessage) {
    if (!alertMessage) return;
    var messageContainer = n$2(".flash-alert__container", node);
    messageContainer.innerText = alertMessage;
    u$1(node, classes$f.visible);
    messageContainer.addEventListener("animationend", function () {
      i$1(node, classes$f.visible);
    }, {
      once: true
    });
  };
};

var selectors$x = {
  innerOverlay: ".header-overlay__inner"
};
var classes$e = {
  isVisible: "is-visible",
  isActive: "is-active"
};
var events = {
  show: "headerOverlay:show",
  hide: "headerOverlay:hide",
  hiding: "headerOverlay:hiding"
};

var headerOverlay = function headerOverlay(node) {
  if (!node) return;
  var overlay = node;
  var overlayInner = node.querySelector(selectors$x.innerOverlay);
  var overlayShowListener = c(events.show, function () {
    return _showOverlay();
  });
  var overlayHideListener = c(events.hide, function () {
    return _hideOverlay();
  });

  var _showOverlay = function _showOverlay() {
    o$1({
      headerOverlayOpen: true
    });
    overlay.classList.add(classes$e.isActive);
    setTimeout(function () {
      overlayInner.classList.add(classes$e.isVisible);
    }, 0);
  };

  var _hideOverlay = function _hideOverlay() {
    o$1({
      headerOverlayOpen: false
    });
    r$2(events.hiding);
    overlayInner.classList.remove(classes$e.isVisible);
    setTimeout(function () {
      overlay.classList.remove(classes$e.isActive);
    }, 0);
  };

  var unload = function unload() {
    overlayShowListener();
    overlayHideListener();
  };

  return {
    unload: unload
  };
};

/**
 * A collection of shims that provide minimal functionality of the ES6 collections.
 *
 * These implementations are not meant to be used outside of the ResizeObserver
 * modules as they cover only a limited range of use cases.
 */
/* eslint-disable require-jsdoc, valid-jsdoc */
var MapShim = (function () {
    if (typeof Map !== 'undefined') {
        return Map;
    }
    /**
     * Returns index in provided array that matches the specified key.
     *
     * @param {Array<Array>} arr
     * @param {*} key
     * @returns {number}
     */
    function getIndex(arr, key) {
        var result = -1;
        arr.some(function (entry, index) {
            if (entry[0] === key) {
                result = index;
                return true;
            }
            return false;
        });
        return result;
    }
    return /** @class */ (function () {
        function class_1() {
            this.__entries__ = [];
        }
        Object.defineProperty(class_1.prototype, "size", {
            /**
             * @returns {boolean}
             */
            get: function () {
                return this.__entries__.length;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * @param {*} key
         * @returns {*}
         */
        class_1.prototype.get = function (key) {
            var index = getIndex(this.__entries__, key);
            var entry = this.__entries__[index];
            return entry && entry[1];
        };
        /**
         * @param {*} key
         * @param {*} value
         * @returns {void}
         */
        class_1.prototype.set = function (key, value) {
            var index = getIndex(this.__entries__, key);
            if (~index) {
                this.__entries__[index][1] = value;
            }
            else {
                this.__entries__.push([key, value]);
            }
        };
        /**
         * @param {*} key
         * @returns {void}
         */
        class_1.prototype.delete = function (key) {
            var entries = this.__entries__;
            var index = getIndex(entries, key);
            if (~index) {
                entries.splice(index, 1);
            }
        };
        /**
         * @param {*} key
         * @returns {void}
         */
        class_1.prototype.has = function (key) {
            return !!~getIndex(this.__entries__, key);
        };
        /**
         * @returns {void}
         */
        class_1.prototype.clear = function () {
            this.__entries__.splice(0);
        };
        /**
         * @param {Function} callback
         * @param {*} [ctx=null]
         * @returns {void}
         */
        class_1.prototype.forEach = function (callback, ctx) {
            if (ctx === void 0) { ctx = null; }
            for (var _i = 0, _a = this.__entries__; _i < _a.length; _i++) {
                var entry = _a[_i];
                callback.call(ctx, entry[1], entry[0]);
            }
        };
        return class_1;
    }());
})();

/**
 * Detects whether window and document objects are available in current environment.
 */
var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && window.document === document;

// Returns global object of a current environment.
var global$1 = (function () {
    if (typeof global !== 'undefined' && global.Math === Math) {
        return global;
    }
    if (typeof self !== 'undefined' && self.Math === Math) {
        return self;
    }
    if (typeof window !== 'undefined' && window.Math === Math) {
        return window;
    }
    // eslint-disable-next-line no-new-func
    return Function('return this')();
})();

/**
 * A shim for the requestAnimationFrame which falls back to the setTimeout if
 * first one is not supported.
 *
 * @returns {number} Requests' identifier.
 */
var requestAnimationFrame$1 = (function () {
    if (typeof requestAnimationFrame === 'function') {
        // It's required to use a bounded function because IE sometimes throws
        // an "Invalid calling object" error if rAF is invoked without the global
        // object on the left hand side.
        return requestAnimationFrame.bind(global$1);
    }
    return function (callback) { return setTimeout(function () { return callback(Date.now()); }, 1000 / 60); };
})();

// Defines minimum timeout before adding a trailing call.
var trailingTimeout = 2;
/**
 * Creates a wrapper function which ensures that provided callback will be
 * invoked only once during the specified delay period.
 *
 * @param {Function} callback - Function to be invoked after the delay period.
 * @param {number} delay - Delay after which to invoke callback.
 * @returns {Function}
 */
function throttle (callback, delay) {
    var leadingCall = false, trailingCall = false, lastCallTime = 0;
    /**
     * Invokes the original callback function and schedules new invocation if
     * the "proxy" was called during current request.
     *
     * @returns {void}
     */
    function resolvePending() {
        if (leadingCall) {
            leadingCall = false;
            callback();
        }
        if (trailingCall) {
            proxy();
        }
    }
    /**
     * Callback invoked after the specified delay. It will further postpone
     * invocation of the original function delegating it to the
     * requestAnimationFrame.
     *
     * @returns {void}
     */
    function timeoutCallback() {
        requestAnimationFrame$1(resolvePending);
    }
    /**
     * Schedules invocation of the original function.
     *
     * @returns {void}
     */
    function proxy() {
        var timeStamp = Date.now();
        if (leadingCall) {
            // Reject immediately following calls.
            if (timeStamp - lastCallTime < trailingTimeout) {
                return;
            }
            // Schedule new call to be in invoked when the pending one is resolved.
            // This is important for "transitions" which never actually start
            // immediately so there is a chance that we might miss one if change
            // happens amids the pending invocation.
            trailingCall = true;
        }
        else {
            leadingCall = true;
            trailingCall = false;
            setTimeout(timeoutCallback, delay);
        }
        lastCallTime = timeStamp;
    }
    return proxy;
}

// Minimum delay before invoking the update of observers.
var REFRESH_DELAY = 20;
// A list of substrings of CSS properties used to find transition events that
// might affect dimensions of observed elements.
var transitionKeys = ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'];
// Check if MutationObserver is available.
var mutationObserverSupported = typeof MutationObserver !== 'undefined';
/**
 * Singleton controller class which handles updates of ResizeObserver instances.
 */
var ResizeObserverController = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserverController.
     *
     * @private
     */
    function ResizeObserverController() {
        /**
         * Indicates whether DOM listeners have been added.
         *
         * @private {boolean}
         */
        this.connected_ = false;
        /**
         * Tells that controller has subscribed for Mutation Events.
         *
         * @private {boolean}
         */
        this.mutationEventsAdded_ = false;
        /**
         * Keeps reference to the instance of MutationObserver.
         *
         * @private {MutationObserver}
         */
        this.mutationsObserver_ = null;
        /**
         * A list of connected observers.
         *
         * @private {Array<ResizeObserverSPI>}
         */
        this.observers_ = [];
        this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
        this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
    }
    /**
     * Adds observer to observers list.
     *
     * @param {ResizeObserverSPI} observer - Observer to be added.
     * @returns {void}
     */
    ResizeObserverController.prototype.addObserver = function (observer) {
        if (!~this.observers_.indexOf(observer)) {
            this.observers_.push(observer);
        }
        // Add listeners if they haven't been added yet.
        if (!this.connected_) {
            this.connect_();
        }
    };
    /**
     * Removes observer from observers list.
     *
     * @param {ResizeObserverSPI} observer - Observer to be removed.
     * @returns {void}
     */
    ResizeObserverController.prototype.removeObserver = function (observer) {
        var observers = this.observers_;
        var index = observers.indexOf(observer);
        // Remove observer if it's present in registry.
        if (~index) {
            observers.splice(index, 1);
        }
        // Remove listeners if controller has no connected observers.
        if (!observers.length && this.connected_) {
            this.disconnect_();
        }
    };
    /**
     * Invokes the update of observers. It will continue running updates insofar
     * it detects changes.
     *
     * @returns {void}
     */
    ResizeObserverController.prototype.refresh = function () {
        var changesDetected = this.updateObservers_();
        // Continue running updates if changes have been detected as there might
        // be future ones caused by CSS transitions.
        if (changesDetected) {
            this.refresh();
        }
    };
    /**
     * Updates every observer from observers list and notifies them of queued
     * entries.
     *
     * @private
     * @returns {boolean} Returns "true" if any observer has detected changes in
     *      dimensions of it's elements.
     */
    ResizeObserverController.prototype.updateObservers_ = function () {
        // Collect observers that have active observations.
        var activeObservers = this.observers_.filter(function (observer) {
            return observer.gatherActive(), observer.hasActive();
        });
        // Deliver notifications in a separate cycle in order to avoid any
        // collisions between observers, e.g. when multiple instances of
        // ResizeObserver are tracking the same element and the callback of one
        // of them changes content dimensions of the observed target. Sometimes
        // this may result in notifications being blocked for the rest of observers.
        activeObservers.forEach(function (observer) { return observer.broadcastActive(); });
        return activeObservers.length > 0;
    };
    /**
     * Initializes DOM listeners.
     *
     * @private
     * @returns {void}
     */
    ResizeObserverController.prototype.connect_ = function () {
        // Do nothing if running in a non-browser environment or if listeners
        // have been already added.
        if (!isBrowser || this.connected_) {
            return;
        }
        // Subscription to the "Transitionend" event is used as a workaround for
        // delayed transitions. This way it's possible to capture at least the
        // final state of an element.
        document.addEventListener('transitionend', this.onTransitionEnd_);
        window.addEventListener('resize', this.refresh);
        if (mutationObserverSupported) {
            this.mutationsObserver_ = new MutationObserver(this.refresh);
            this.mutationsObserver_.observe(document, {
                attributes: true,
                childList: true,
                characterData: true,
                subtree: true
            });
        }
        else {
            document.addEventListener('DOMSubtreeModified', this.refresh);
            this.mutationEventsAdded_ = true;
        }
        this.connected_ = true;
    };
    /**
     * Removes DOM listeners.
     *
     * @private
     * @returns {void}
     */
    ResizeObserverController.prototype.disconnect_ = function () {
        // Do nothing if running in a non-browser environment or if listeners
        // have been already removed.
        if (!isBrowser || !this.connected_) {
            return;
        }
        document.removeEventListener('transitionend', this.onTransitionEnd_);
        window.removeEventListener('resize', this.refresh);
        if (this.mutationsObserver_) {
            this.mutationsObserver_.disconnect();
        }
        if (this.mutationEventsAdded_) {
            document.removeEventListener('DOMSubtreeModified', this.refresh);
        }
        this.mutationsObserver_ = null;
        this.mutationEventsAdded_ = false;
        this.connected_ = false;
    };
    /**
     * "Transitionend" event handler.
     *
     * @private
     * @param {TransitionEvent} event
     * @returns {void}
     */
    ResizeObserverController.prototype.onTransitionEnd_ = function (_a) {
        var _b = _a.propertyName, propertyName = _b === void 0 ? '' : _b;
        // Detect whether transition may affect dimensions of an element.
        var isReflowProperty = transitionKeys.some(function (key) {
            return !!~propertyName.indexOf(key);
        });
        if (isReflowProperty) {
            this.refresh();
        }
    };
    /**
     * Returns instance of the ResizeObserverController.
     *
     * @returns {ResizeObserverController}
     */
    ResizeObserverController.getInstance = function () {
        if (!this.instance_) {
            this.instance_ = new ResizeObserverController();
        }
        return this.instance_;
    };
    /**
     * Holds reference to the controller's instance.
     *
     * @private {ResizeObserverController}
     */
    ResizeObserverController.instance_ = null;
    return ResizeObserverController;
}());

/**
 * Defines non-writable/enumerable properties of the provided target object.
 *
 * @param {Object} target - Object for which to define properties.
 * @param {Object} props - Properties to be defined.
 * @returns {Object} Target object.
 */
var defineConfigurable = (function (target, props) {
    for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
        var key = _a[_i];
        Object.defineProperty(target, key, {
            value: props[key],
            enumerable: false,
            writable: false,
            configurable: true
        });
    }
    return target;
});

/**
 * Returns the global object associated with provided element.
 *
 * @param {Object} target
 * @returns {Object}
 */
var getWindowOf = (function (target) {
    // Assume that the element is an instance of Node, which means that it
    // has the "ownerDocument" property from which we can retrieve a
    // corresponding global object.
    var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
    // Return the local global object if it's not possible extract one from
    // provided element.
    return ownerGlobal || global$1;
});

// Placeholder of an empty content rectangle.
var emptyRect = createRectInit(0, 0, 0, 0);
/**
 * Converts provided string to a number.
 *
 * @param {number|string} value
 * @returns {number}
 */
function toFloat(value) {
    return parseFloat(value) || 0;
}
/**
 * Extracts borders size from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @param {...string} positions - Borders positions (top, right, ...)
 * @returns {number}
 */
function getBordersSize(styles) {
    var positions = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        positions[_i - 1] = arguments[_i];
    }
    return positions.reduce(function (size, position) {
        var value = styles['border-' + position + '-width'];
        return size + toFloat(value);
    }, 0);
}
/**
 * Extracts paddings sizes from provided styles.
 *
 * @param {CSSStyleDeclaration} styles
 * @returns {Object} Paddings box.
 */
function getPaddings(styles) {
    var positions = ['top', 'right', 'bottom', 'left'];
    var paddings = {};
    for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
        var position = positions_1[_i];
        var value = styles['padding-' + position];
        paddings[position] = toFloat(value);
    }
    return paddings;
}
/**
 * Calculates content rectangle of provided SVG element.
 *
 * @param {SVGGraphicsElement} target - Element content rectangle of which needs
 *      to be calculated.
 * @returns {DOMRectInit}
 */
function getSVGContentRect(target) {
    var bbox = target.getBBox();
    return createRectInit(0, 0, bbox.width, bbox.height);
}
/**
 * Calculates content rectangle of provided HTMLElement.
 *
 * @param {HTMLElement} target - Element for which to calculate the content rectangle.
 * @returns {DOMRectInit}
 */
function getHTMLElementContentRect(target) {
    // Client width & height properties can't be
    // used exclusively as they provide rounded values.
    var clientWidth = target.clientWidth, clientHeight = target.clientHeight;
    // By this condition we can catch all non-replaced inline, hidden and
    // detached elements. Though elements with width & height properties less
    // than 0.5 will be discarded as well.
    //
    // Without it we would need to implement separate methods for each of
    // those cases and it's not possible to perform a precise and performance
    // effective test for hidden elements. E.g. even jQuery's ':visible' filter
    // gives wrong results for elements with width & height less than 0.5.
    if (!clientWidth && !clientHeight) {
        return emptyRect;
    }
    var styles = getWindowOf(target).getComputedStyle(target);
    var paddings = getPaddings(styles);
    var horizPad = paddings.left + paddings.right;
    var vertPad = paddings.top + paddings.bottom;
    // Computed styles of width & height are being used because they are the
    // only dimensions available to JS that contain non-rounded values. It could
    // be possible to utilize the getBoundingClientRect if only it's data wasn't
    // affected by CSS transformations let alone paddings, borders and scroll bars.
    var width = toFloat(styles.width), height = toFloat(styles.height);
    // Width & height include paddings and borders when the 'border-box' box
    // model is applied (except for IE).
    if (styles.boxSizing === 'border-box') {
        // Following conditions are required to handle Internet Explorer which
        // doesn't include paddings and borders to computed CSS dimensions.
        //
        // We can say that if CSS dimensions + paddings are equal to the "client"
        // properties then it's either IE, and thus we don't need to subtract
        // anything, or an element merely doesn't have paddings/borders styles.
        if (Math.round(width + horizPad) !== clientWidth) {
            width -= getBordersSize(styles, 'left', 'right') + horizPad;
        }
        if (Math.round(height + vertPad) !== clientHeight) {
            height -= getBordersSize(styles, 'top', 'bottom') + vertPad;
        }
    }
    // Following steps can't be applied to the document's root element as its
    // client[Width/Height] properties represent viewport area of the window.
    // Besides, it's as well not necessary as the <html> itself neither has
    // rendered scroll bars nor it can be clipped.
    if (!isDocumentElement(target)) {
        // In some browsers (only in Firefox, actually) CSS width & height
        // include scroll bars size which can be removed at this step as scroll
        // bars are the only difference between rounded dimensions + paddings
        // and "client" properties, though that is not always true in Chrome.
        var vertScrollbar = Math.round(width + horizPad) - clientWidth;
        var horizScrollbar = Math.round(height + vertPad) - clientHeight;
        // Chrome has a rather weird rounding of "client" properties.
        // E.g. for an element with content width of 314.2px it sometimes gives
        // the client width of 315px and for the width of 314.7px it may give
        // 314px. And it doesn't happen all the time. So just ignore this delta
        // as a non-relevant.
        if (Math.abs(vertScrollbar) !== 1) {
            width -= vertScrollbar;
        }
        if (Math.abs(horizScrollbar) !== 1) {
            height -= horizScrollbar;
        }
    }
    return createRectInit(paddings.left, paddings.top, width, height);
}
/**
 * Checks whether provided element is an instance of the SVGGraphicsElement.
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
var isSVGGraphicsElement = (function () {
    // Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
    // interface.
    if (typeof SVGGraphicsElement !== 'undefined') {
        return function (target) { return target instanceof getWindowOf(target).SVGGraphicsElement; };
    }
    // If it's so, then check that element is at least an instance of the
    // SVGElement and that it has the "getBBox" method.
    // eslint-disable-next-line no-extra-parens
    return function (target) { return (target instanceof getWindowOf(target).SVGElement &&
        typeof target.getBBox === 'function'); };
})();
/**
 * Checks whether provided element is a document element (<html>).
 *
 * @param {Element} target - Element to be checked.
 * @returns {boolean}
 */
function isDocumentElement(target) {
    return target === getWindowOf(target).document.documentElement;
}
/**
 * Calculates an appropriate content rectangle for provided html or svg element.
 *
 * @param {Element} target - Element content rectangle of which needs to be calculated.
 * @returns {DOMRectInit}
 */
function getContentRect(target) {
    if (!isBrowser) {
        return emptyRect;
    }
    if (isSVGGraphicsElement(target)) {
        return getSVGContentRect(target);
    }
    return getHTMLElementContentRect(target);
}
/**
 * Creates rectangle with an interface of the DOMRectReadOnly.
 * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
 *
 * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and dimensions.
 * @returns {DOMRectReadOnly}
 */
function createReadOnlyRect(_a) {
    var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
    // If DOMRectReadOnly is available use it as a prototype for the rectangle.
    var Constr = typeof DOMRectReadOnly !== 'undefined' ? DOMRectReadOnly : Object;
    var rect = Object.create(Constr.prototype);
    // Rectangle's properties are not writable and non-enumerable.
    defineConfigurable(rect, {
        x: x, y: y, width: width, height: height,
        top: y,
        right: x + width,
        bottom: height + y,
        left: x
    });
    return rect;
}
/**
 * Creates DOMRectInit object based on the provided dimensions and the x/y coordinates.
 * Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
 *
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 * @param {number} width - Rectangle's width.
 * @param {number} height - Rectangle's height.
 * @returns {DOMRectInit}
 */
function createRectInit(x, y, width, height) {
    return { x: x, y: y, width: width, height: height };
}

/**
 * Class that is responsible for computations of the content rectangle of
 * provided DOM element and for keeping track of it's changes.
 */
var ResizeObservation = /** @class */ (function () {
    /**
     * Creates an instance of ResizeObservation.
     *
     * @param {Element} target - Element to be observed.
     */
    function ResizeObservation(target) {
        /**
         * Broadcasted width of content rectangle.
         *
         * @type {number}
         */
        this.broadcastWidth = 0;
        /**
         * Broadcasted height of content rectangle.
         *
         * @type {number}
         */
        this.broadcastHeight = 0;
        /**
         * Reference to the last observed content rectangle.
         *
         * @private {DOMRectInit}
         */
        this.contentRect_ = createRectInit(0, 0, 0, 0);
        this.target = target;
    }
    /**
     * Updates content rectangle and tells whether it's width or height properties
     * have changed since the last broadcast.
     *
     * @returns {boolean}
     */
    ResizeObservation.prototype.isActive = function () {
        var rect = getContentRect(this.target);
        this.contentRect_ = rect;
        return (rect.width !== this.broadcastWidth ||
            rect.height !== this.broadcastHeight);
    };
    /**
     * Updates 'broadcastWidth' and 'broadcastHeight' properties with a data
     * from the corresponding properties of the last observed content rectangle.
     *
     * @returns {DOMRectInit} Last observed content rectangle.
     */
    ResizeObservation.prototype.broadcastRect = function () {
        var rect = this.contentRect_;
        this.broadcastWidth = rect.width;
        this.broadcastHeight = rect.height;
        return rect;
    };
    return ResizeObservation;
}());

var ResizeObserverEntry = /** @class */ (function () {
    /**
     * Creates an instance of ResizeObserverEntry.
     *
     * @param {Element} target - Element that is being observed.
     * @param {DOMRectInit} rectInit - Data of the element's content rectangle.
     */
    function ResizeObserverEntry(target, rectInit) {
        var contentRect = createReadOnlyRect(rectInit);
        // According to the specification following properties are not writable
        // and are also not enumerable in the native implementation.
        //
        // Property accessors are not being used as they'd require to define a
        // private WeakMap storage which may cause memory leaks in browsers that
        // don't support this type of collections.
        defineConfigurable(this, { target: target, contentRect: contentRect });
    }
    return ResizeObserverEntry;
}());

var ResizeObserverSPI = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserver.
     *
     * @param {ResizeObserverCallback} callback - Callback function that is invoked
     *      when one of the observed elements changes it's content dimensions.
     * @param {ResizeObserverController} controller - Controller instance which
     *      is responsible for the updates of observer.
     * @param {ResizeObserver} callbackCtx - Reference to the public
     *      ResizeObserver instance which will be passed to callback function.
     */
    function ResizeObserverSPI(callback, controller, callbackCtx) {
        /**
         * Collection of resize observations that have detected changes in dimensions
         * of elements.
         *
         * @private {Array<ResizeObservation>}
         */
        this.activeObservations_ = [];
        /**
         * Registry of the ResizeObservation instances.
         *
         * @private {Map<Element, ResizeObservation>}
         */
        this.observations_ = new MapShim();
        if (typeof callback !== 'function') {
            throw new TypeError('The callback provided as parameter 1 is not a function.');
        }
        this.callback_ = callback;
        this.controller_ = controller;
        this.callbackCtx_ = callbackCtx;
    }
    /**
     * Starts observing provided element.
     *
     * @param {Element} target - Element to be observed.
     * @returns {void}
     */
    ResizeObserverSPI.prototype.observe = function (target) {
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        // Do nothing if current environment doesn't have the Element interface.
        if (typeof Element === 'undefined' || !(Element instanceof Object)) {
            return;
        }
        if (!(target instanceof getWindowOf(target).Element)) {
            throw new TypeError('parameter 1 is not of type "Element".');
        }
        var observations = this.observations_;
        // Do nothing if element is already being observed.
        if (observations.has(target)) {
            return;
        }
        observations.set(target, new ResizeObservation(target));
        this.controller_.addObserver(this);
        // Force the update of observations.
        this.controller_.refresh();
    };
    /**
     * Stops observing provided element.
     *
     * @param {Element} target - Element to stop observing.
     * @returns {void}
     */
    ResizeObserverSPI.prototype.unobserve = function (target) {
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        // Do nothing if current environment doesn't have the Element interface.
        if (typeof Element === 'undefined' || !(Element instanceof Object)) {
            return;
        }
        if (!(target instanceof getWindowOf(target).Element)) {
            throw new TypeError('parameter 1 is not of type "Element".');
        }
        var observations = this.observations_;
        // Do nothing if element is not being observed.
        if (!observations.has(target)) {
            return;
        }
        observations.delete(target);
        if (!observations.size) {
            this.controller_.removeObserver(this);
        }
    };
    /**
     * Stops observing all elements.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.disconnect = function () {
        this.clearActive();
        this.observations_.clear();
        this.controller_.removeObserver(this);
    };
    /**
     * Collects observation instances the associated element of which has changed
     * it's content rectangle.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.gatherActive = function () {
        var _this = this;
        this.clearActive();
        this.observations_.forEach(function (observation) {
            if (observation.isActive()) {
                _this.activeObservations_.push(observation);
            }
        });
    };
    /**
     * Invokes initial callback function with a list of ResizeObserverEntry
     * instances collected from active resize observations.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.broadcastActive = function () {
        // Do nothing if observer doesn't have active observations.
        if (!this.hasActive()) {
            return;
        }
        var ctx = this.callbackCtx_;
        // Create ResizeObserverEntry instance for every active observation.
        var entries = this.activeObservations_.map(function (observation) {
            return new ResizeObserverEntry(observation.target, observation.broadcastRect());
        });
        this.callback_.call(ctx, entries, ctx);
        this.clearActive();
    };
    /**
     * Clears the collection of active observations.
     *
     * @returns {void}
     */
    ResizeObserverSPI.prototype.clearActive = function () {
        this.activeObservations_.splice(0);
    };
    /**
     * Tells whether observer has active observations.
     *
     * @returns {boolean}
     */
    ResizeObserverSPI.prototype.hasActive = function () {
        return this.activeObservations_.length > 0;
    };
    return ResizeObserverSPI;
}());

// Registry of internal observers. If WeakMap is not available use current shim
// for the Map collection as it has all required methods and because WeakMap
// can't be fully polyfilled anyway.
var observers = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();
/**
 * ResizeObserver API. Encapsulates the ResizeObserver SPI implementation
 * exposing only those methods and properties that are defined in the spec.
 */
var ResizeObserver$1 = /** @class */ (function () {
    /**
     * Creates a new instance of ResizeObserver.
     *
     * @param {ResizeObserverCallback} callback - Callback that is invoked when
     *      dimensions of the observed elements change.
     */
    function ResizeObserver(callback) {
        if (!(this instanceof ResizeObserver)) {
            throw new TypeError('Cannot call a class as a function.');
        }
        if (!arguments.length) {
            throw new TypeError('1 argument required, but only 0 present.');
        }
        var controller = ResizeObserverController.getInstance();
        var observer = new ResizeObserverSPI(callback, controller, this);
        observers.set(this, observer);
    }
    return ResizeObserver;
}());
// Expose public methods of ResizeObserver.
[
    'observe',
    'unobserve',
    'disconnect'
].forEach(function (method) {
    ResizeObserver$1.prototype[method] = function () {
        var _a;
        return (_a = observers.get(this))[method].apply(_a, arguments);
    };
});

var index = (function () {
    // Export existing implementation if available.
    if (typeof global$1.ResizeObserver !== 'undefined') {
        return global$1.ResizeObserver;
    }
    return ResizeObserver$1;
})();

function PredictiveSearch(resultsContainer) {
  var settings = n$2("[data-search-settings]", document);

  var _JSON$parse = JSON.parse(settings.innerHTML),
      limit = _JSON$parse.limit,
      show_articles = _JSON$parse.show_articles,
      show_collections = _JSON$parse.show_collections,
      show_pages = _JSON$parse.show_pages;

  var cachedResults = {}; // Build out type query string

  var types = ["product"];

  if (show_articles) {
    types.push("article");
  }

  if (show_collections) {
    types.push("collection");
  }

  if (show_pages) {
    types.push("page");
  }

  function renderSearchResults(resultsMarkup) {
    resultsContainer.innerHTML = resultsMarkup;
  }

  function getSearchResults(searchTerm) {
    var queryKey = searchTerm.replace(" ", "-").toLowerCase(); // Render result if it appears within the cache

    if (cachedResults["".concat(queryKey)]) {
      renderSearchResults(cachedResults["".concat(queryKey)]);
      return;
    }

    fetch("".concat(window.theme.routes.predictive_search_url, "?q=").concat(encodeURIComponent(searchTerm), "&").concat(encodeURIComponent("resources[type]"), "=").concat(types.join(","), "&").concat(encodeURIComponent("resources[limit]"), "=").concat(limit, "&section_id=predictive-search")).then(function (response) {
      if (!response.ok) {
        var error = new Error(response.status);
        throw error;
      }

      return response.text();
    }).then(function (text) {
      var resultsMarkup = new DOMParser().parseFromString(text, "text/html").querySelector("#shopify-section-predictive-search").innerHTML; // Cache results

      cachedResults[queryKey] = resultsMarkup;
      renderSearchResults(resultsMarkup);
    }).catch(function (error) {
      throw error;
    });
  }

  return {
    getSearchResults: getSearchResults
  };
}

var classes$d = {
  active: "active",
  visible: "quick-search--visible"
};
function QuickSearch (node, header) {
  var overlay = n$2("[data-overlay]", node);
  var form = n$2("[data-quick-search-form]", node);
  var input = n$2("[data-input]", node);
  var clear = n$2("[data-clear]", node);
  var resultsContainer = n$2("[data-results]", node);
  var predictiveSearch = PredictiveSearch(resultsContainer);
  var closeButton = n$2("[data-close-icon]", node);
  var searchToggles = t$3("[data-search]", header);
  var events = [e$3([overlay, closeButton], "click", close), e$3(clear, "click", reset), e$3(input, "input", handleInput), e$3(node, "keydown", function (_ref) {
    var keyCode = _ref.keyCode;
    if (keyCode === 27) close();
  }), c("drawer-menu:open", function () {
    if (a$1(node, classes$d.active)) close();
  })];
  var trap = createFocusTrap(node, {
    allowOutsideClick: true
  });

  function handleInput(e) {
    if (e.target.value === "") reset();
    l(clear, classes$d.visible, e.target.value !== "");
    l(input.parentNode, classes$d.active, e.target.value !== "");
    l(form, classes$d.active, e.target.value !== "");
    predictiveSearch.getSearchResults(e.target.value);
  } // Clear contents of the search input and hide results container


  function reset(e) {
    e && e.preventDefault();
    input.value = "";
    i$1(clear, classes$d.visible);
    i$1(input.parentNode, classes$d.active);
    i$1(form, classes$d.active);
    resultsContainer.innerHTML = "";
    input.focus();
  }

  function toggleSearch() {
    node.style.setProperty("--scroll-y", Math.ceil(window.scrollY) + "px");
    var searchIsOpen = node.getAttribute("aria-hidden") === "false";

    if (searchIsOpen) {
      close();
    } else {
      open();
    }
  }

  function open() {
    r$2("search:open");
    searchToggles.forEach(function (searchToggle) {
      searchToggle.setAttribute("aria-expanded", true);
    });
    u$1(node, classes$d.active);
    node.setAttribute("aria-hidden", false);
    document.body.setAttribute("quick-search-open", "true");
    trap.activate();
    setTimeout(function () {
      input.focus();
      disableBodyScroll(node, {
        allowTouchMove: function allowTouchMove(el) {
          while (el && el !== document.body) {
            if (el.getAttribute("data-scroll-lock-ignore") !== null) {
              return true;
            }

            el = el.parentNode;
          }
        },
        reserveScrollBarGap: true
      });
      u$1(node, classes$d.visible);
    }, 50);
  }

  function close() {
    searchToggles.forEach(function (searchToggle) {
      searchToggle.setAttribute("aria-expanded", false);
    });
    i$1(node, classes$d.visible);
    document.body.setAttribute("quick-search-open", "false");
    trap.deactivate();
    setTimeout(function () {
      i$1(node, classes$d.active);
      node.setAttribute("aria-hidden", true);
      enableBodyScroll(node);
    }, 500);
  }

  function destroy() {
    close();
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  }

  return {
    toggleSearch: toggleSearch,
    destroy: destroy
  };
}

function Navigation(node, headerSection) {
  if (!node) return;
  var dropdownTriggers = t$3("[data-dropdown-trigger]", node);
  var meganavTriggers = t$3("[data-meganav-trigger]", node);
  var meganavs = t$3(".meganav, node");
  var nonTriggers = t$3(".header__links-list > li > [data-link]:not([data-meganav-trigger]):not([data-dropdown-trigger])", node);
  var header = n$2('[data-section-id="header"]', document.body);
  var primaryRow = n$2(".header__links-primary", header);
  var submenuItem = n$2(".navigation__submenu .navigation__submenu-item", node);
  if (!dropdownTriggers) return; // Set submenu item height for submenu depth 2 offset

  if (submenuItem) {
    node.style.setProperty("--submenu-item-height", "".concat(submenuItem.clientHeight, "px"));
  }

  var delegate = new Delegate(document.body);
  delegate.on("click", null, function (e) {
    return handleClick(e);
  });
  delegate.on("mouseover", ".header-overlay__inner", function (e) {
    if (Shopify.designMode && headerSection.meganavOpenedFromDesignMode) {
      // Closing on shade overlay is too finicky when opened via block
      return;
    }

    closeAll(node);
  });
  meganavs.forEach(function (nav) {
    if (shouldAnimate(nav)) {
      animateMeganav(nav);
    }
  });
  var events = [e$3(dropdownTriggers, "focus", function (e) {
    e.preventDefault();
    toggleMenu(e.currentTarget.parentNode);
  }), e$3(dropdownTriggers, "mouseover", function (e) {
    e.preventDefault();
    toggleMenu(e.currentTarget.parentNode, true);
  }), e$3(meganavTriggers, "focus", function (e) {
    e.preventDefault();
    showMeganav(e.target, e.target.dataset.meganavHandle);
  }), e$3(meganavTriggers, "mouseover", function (e) {
    e.preventDefault();
    showMeganav(e.target, e.target.dataset.meganavHandle);
  }), e$3(nonTriggers, "mouseover", function () {
    closeAll();
  }), e$3(primaryRow, "mouseout", function (e) {
    var _e$relatedTarget;

    var isMousingOutOfPrimaryRow = ((_e$relatedTarget = e.relatedTarget) === null || _e$relatedTarget === void 0 ? void 0 : _e$relatedTarget.closest(".header__links-primary")) != primaryRow;

    if (isMousingOutOfPrimaryRow) {
      closeAll();
    }
  }), e$3(headerSection.container, "mouseleave", function () {
    i$1(header, "animation--dropdowns-have-animated-once");
    i$1(header, "animation--dropdowns-have-animated-more-than-once");
  }), e$3(node, "keydown", function (_ref) {
    var keyCode = _ref.keyCode;
    if (keyCode === 27) closeAll();
  }), e$3(t$3(".header__links-list > li > a", node), "focus", function () {
    if (!userIsUsingKeyboard()) return;
    closeAll();
  }), e$3(t$3("[data-link]", node), "focus", function (e) {
    e.preventDefault();
    if (!userIsUsingKeyboard()) return;
    var link = e.currentTarget;

    if (link.hasAttribute("data-dropdown-trigger")) {
      toggleMenu(link.parentNode);
    }

    var siblings = t$3("[data-link]", link.parentNode.parentNode);
    siblings.forEach(function (el) {
      return l(t$3("[data-submenu]", el.parentNode), "active", el === link);
    });
  }), // Close everything when focus leaves the main menu and NOT into a meganav
  e$3(t$3("[data-link]", node), "focusout", function (e) {
    if (!userIsUsingKeyboard()) return;

    if (e.relatedTarget && !(e.relatedTarget.hasAttribute("data-link") || e.relatedTarget.closest(".meganav"))) {
      closeAll();
    }
  }), // Listen to horizontal scroll to offset inner menus
  e$3(node, "scroll", function () {
    document.documentElement.style.setProperty("--navigation-menu-offet", "".concat(node.scrollLeft, "px"));
  })];

  function userIsUsingKeyboard() {
    return a$1(document.body, "user-is-tabbing");
  }

  function showMeganav(menuTrigger, handle) {
    closeAll(undefined, {
      avoidShadeHide: true
    });
    var menu = n$2(".meganav[data-menu-handle=\"".concat(handle, "\"]"), header);
    animationHandler();

    if (!menu) {
      return;
    }

    if (menu.dataset.alignToTrigger) {
      alignMeganavToTrigger(menu, menuTrigger);
    }

    menu.setAttribute("aria-hidden", false);
    u$1(header, "dropdown-active");
    u$1(menu, "active");
    r$2("headerOverlay:show");
  }

  function alignMeganavToTrigger(menu, menuTrigger) {
    var headerInner = n$2(".header__inner", headerSection.container);
    menuTrigger.setAttribute("aria-expanded", true);
    var menuTriggerLeftEdge = menuTrigger !== null && menuTrigger !== void 0 && menuTrigger.getBoundingClientRect ? menuTrigger.getBoundingClientRect().left : menuTrigger.offsetLeft;
    var menuWidth = menu.getBoundingClientRect ? menu.getBoundingClientRect().width : menu.offsetWidth;
    var headerWidth = headerInner.getBoundingClientRect ? headerInner.getBoundingClientRect().width : headerInner.offsetWidth;
    var viewportWidth = window.innerWidth;
    var menuLeftAlignment = menuTriggerLeftEdge - 24;
    var outterMargins = viewportWidth - headerWidth;
    var menuLeftOffset = menuWidth === viewportWidth ? 0 : outterMargins / 2; // menu width exceeds available width from trigger point

    if (menuLeftAlignment - menuLeftOffset + menuWidth > headerWidth) {
      var offset = viewportWidth - menuWidth;

      if (offset < outterMargins) {
        // center menu if width exceeds but would push passed the left edge.
        var menuCenterOffset = offset / 2;
        menuLeftAlignment = offset - menuCenterOffset;
      } else {
        // menu will align offset left without pushing to the right edge
        menuLeftAlignment = offset - menuLeftOffset;
      }
    }

    menu.style.left = "".concat(menuLeftAlignment, "px");
    u$1(menu, "customAlignment");
  }

  function toggleMenu(el, force) {
    var menu = n$2("[data-submenu]", el);
    var menuTrigger = n$2("[data-link]", el);
    var parentSubmenu = el.closest("[data-submenu]");
    animationHandler();
    var action;

    if (force) {
      action = "open";
    } else if (force !== undefined) {
      action = "close";
    }

    if (!action) {
      action = a$1(menu, "active") ? "close" : "open";
    }

    if (action === "open") {
      // Make sure all lvl 2 submenus are closed before opening another
      if ((parentSubmenu === null || parentSubmenu === void 0 ? void 0 : parentSubmenu.dataset.depth) === "1") {
        closeAll(parentSubmenu, {
          avoidShadeHide: true
        });
      } else {
        closeAll(undefined, {
          avoidShadeHide: true
        });
      }

      showMenu(el, menuTrigger, menu);
    }

    if (action == "close") {
      hideMenu(el, menuTrigger, menu);
    }
  }

  function showMenu(el, menuTrigger, menu) {
    menuTrigger.setAttribute("aria-expanded", true);
    menu.setAttribute("aria-hidden", false);
    var depth = parseInt(menu.dataset.depth, 10);

    if (depth === 1) {
      // Need to account for trigger being in scrollable container
      var rect = menuTrigger.getBoundingClientRect();

      if (rect) {
        menu.style.left = "".concat(rect.x, "px");
      }
    }

    u$1(menu, "active");
    u$1(header, "dropdown-active");
    r$2("headerOverlay:show");
  }

  function hideMenu(el, menuTrigger, menu) {
    // If the toggle is closing the element from the parent close all internal
    if (a$1(el.parentNode, "header__links-list")) {
      closeAll();
      return;
    }

    menuTrigger.setAttribute("aria-expanded", false);
    menu.setAttribute("aria-hidden", true);
    i$1(menu, "active");
  } // We want to close the menu when anything is clicked that isn't a submenu


  function handleClick(e) {
    if (!e.target.closest("[data-submenu-parent]") && !e.target.closest(".meganav") && !e.target.closest("[data-search]") && !e.target.closest("[data-quick-search]")) {
      closeAll();
    }
  }

  function closeAll() {
    var target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : node;
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var subMenus = t$3("[data-submenu]", target);
    var parentTriggers = t$3("[data-parent], [data-link]", target);
    i$1(subMenus, "active");
    subMenus.forEach(function (sub) {
      return sub.setAttribute("aria-hidden", true);
    });
    parentTriggers.forEach(function (trig) {
      return trig.setAttribute("aria-expanded", false);
    });
    i$1(header, "dropdown-active");

    if (!options.avoidShadeHide) {
      r$2("headerOverlay:hide");
    }
  }

  function animationHandler() {
    // The header dropdown animations should only run on the first
    // menu that is opened, then not on subsequent menus.
    // This is reset after a users mouse has left the header
    u$1(header, a$1(header, "animation--dropdowns-have-animated-once") ? "animation--dropdowns-have-animated-more-than-once" : "animation--dropdowns-have-animated-once");
  }

  function destroy() {
    delegate.off();
    events.forEach(function (evt) {
      return evt();
    });
  }

  return {
    destroy: destroy
  };
}

var sel$2 = {
  menuButton: ".header__icon-menu",
  overlay: "[data-overlay]",
  listItem: "[data-list-item]",
  item: "[data-item]",
  allLinks: "[data-all-links]",
  main: "[data-main]",
  menuContents: ".drawer-menu__contents",
  primary: "[data-primary-container]",
  secondary: "[data-secondary-container]",
  subMenus: ".drawer-menu__list--sub",
  footer: "[data-footer]",
  close: "[data-close-drawer]",
  logo: ".drawer-menu__logo",
  // Cross border
  form: ".drawer-menu__form",
  localeInput: "[data-locale-input]",
  currencyInput: "[data-currency-input]"
};
var classes$c = {
  active: "active",
  visible: "visible",
  countrySelector: "drawer-menu__list--country-selector"
}; // Extra space we add to the height of the inner container

var formatHeight = function formatHeight(h) {
  return h + 8 + "px";
};

var menu = function menu(node) {
  var drawerMenuAnimation = animateDrawerMenu(node); // Entire links container

  var primaryDepth = 0; // The individual link list the merchant selected

  var linksDepth = 0;
  var scrollPosition = 0;
  var focusTrap = createFocusTrap(node, {
    allowOutsideClick: true
  });
  var overlay = node.querySelector(sel$2.overlay);
  overlay.addEventListener("click", close);
  var menuContents = node.querySelector(sel$2.menuContents);
  var menuButton = document.querySelector(sel$2.menuButton); // Element that holds all links, primary and secondary

  var everything = node.querySelector(sel$2.allLinks); // This is the element that holds the one we move left and right (primary)
  // We also need to assign its height initially so we get smooth transitions

  var main = node.querySelector(sel$2.main); // Element that holds all the primary links and moves left and right

  var primary = node.querySelector(sel$2.primary);
  var secondary = node.querySelector(sel$2.secondary); // Cross border

  var form = node.querySelector(sel$2.form);
  var localeInput = node.querySelector(sel$2.localeInput);
  var currencyInput = node.querySelector(sel$2.currencyInput); // quick-search listener

  var quickSearchListener = c("search:open", function () {
    if (a$1(node, classes$c.active)) close();
  }); // Every individual menu item

  var items = node.querySelectorAll(sel$2.item);
  items.forEach(function (item) {
    return item.addEventListener("click", handleItem);
  });

  function handleItem(e) {
    e.preventDefault();
    var item = e.currentTarget.dataset.item;

    switch (item) {
      // Standard link that goes to a different url
      case "link":
        close();
        window.location = e.currentTarget.href;
        break;
      // Element that will navigate to child navigation list

      case "parent":
        clickParent(e);
        break;
      // Element that will navigate back up the tree

      case "back":
        clickBack(e);
        break;
      // Account, currency, and language link at the bottom

      case "viewCurrency":
      case "viewLanguage":
        handleLocalizationClick(e);
        break;
      // Back link within 'Currency' or 'Language'

      case "secondaryHeading":
        handleSecondaryHeading(e);
        break;
      // Individual language

      case "locale":
        handleLanguageChoice(e);
        break;
      // Individual currency

      case "currency":
        handleCurrencyChoice(e);
        break;
    }
  }

  function getMainHeight() {
    var mainHeight = primary.offsetHeight;

    if (secondary) {
      mainHeight += secondary.offsetHeight;
    }

    return mainHeight;
  }

  function open() {
    r$2("drawer-menu:open");
    node.classList.add(classes$c.active);
    document.body.setAttribute("mobile-menu-open", "true");
    menuButton.setAttribute("aria-expanded", true);
    menuButton.setAttribute("aria-label", menuButton.getAttribute("data-aria-label-opened"));
    setTimeout(function () {
      focusTrap.activate();
      node.classList.add(classes$c.visible);
      disableBodyScroll(node, {
        hideBodyOverflow: true,
        allowTouchMove: function allowTouchMove(el) {
          while (el && el !== document.body && el.id !== "main-content") {
            if (el.getAttribute("data-scroll-lock-ignore") !== null) {
              return true;
            }

            el = el.parentNode;
          }
        }
      });
      scrollPosition = window.pageYOffset;
      document.body.style.top = "-".concat(scrollPosition, "px");
      document.body.classList.add("scroll-lock");

      if (primaryDepth === 0 && linksDepth === 0) {
        var mainHeight = getMainHeight();
        main.style.height = formatHeight(mainHeight);
        drawerMenuAnimation.open();
      }
    }, 50);
  }

  function close(e) {
    menuButton.setAttribute("aria-expanded", false);
    menuButton.setAttribute("aria-label", menuButton.getAttribute("data-aria-label-closed"));
    e && e.preventDefault();
    focusTrap.deactivate();
    node.classList.remove(classes$c.visible);
    document.body.setAttribute("mobile-menu-open", "false");
    var childMenus = node.querySelectorAll(sel$2.subMenus);
    childMenus.forEach(function (childMenu) {
      childMenu.classList.remove(classes$c.visible);
      childMenu.setAttribute("aria-hidden", true);
    });
    setTimeout(function () {
      node.classList.remove(classes$c.active);
      enableBodyScroll(node);
      document.body.classList.remove("scroll-lock");
      document.body.style.top = "";
      window.scrollTo(0, scrollPosition);
      navigate(0);
      drawerMenuAnimation.close();
    }, 350);
  }

  function clickParent(e) {
    e.preventDefault();
    var parentLink = e.currentTarget;
    parentLink.ariaExpanded = "true";
    var childMenu = parentLink.nextElementSibling;
    childMenu.classList.add(classes$c.visible);
    childMenu.setAttribute("aria-hidden", false);
    main.style.height = formatHeight(childMenu.offsetHeight);
    menuContents.scrollTo(0, 0);
    navigate(linksDepth += 1);
  }

  function navigate(depth) {
    linksDepth = depth;
    primary.setAttribute("data-depth", depth);
    everything.setAttribute("data-in-initial-position", depth === 0);
  }

  function navigatePrimary(depth) {
    primaryDepth = depth;
    everything.setAttribute("data-depth", depth);
    everything.setAttribute("data-in-initial-position", depth === 0);
  }

  function clickBack(e) {
    e.preventDefault();
    var menuBefore = e.currentTarget.closest(sel$2.listItem).closest("ul");
    var height = menuBefore.offsetHeight;

    if (menuBefore == primary) {
      height = getMainHeight();
    }

    main.style.height = formatHeight(height);
    var parent = e.currentTarget.closest("ul");
    parent.classList.remove(classes$c.visible);
    var parentLink = parent.previousElementSibling;
    parentLink.ariaExpanded = "false";
    navigate(linksDepth -= 1);
  }

  function handleLocalizationClick(e) {
    e.preventDefault();
    navigatePrimary(1);
    var childMenu = e.currentTarget.nextElementSibling;
    childMenu.classList.add(classes$c.visible);
  }

  function handleSecondaryHeading(e) {
    e === null || e === void 0 ? void 0 : e.preventDefault();
    navigatePrimary(0);
    var parent = e.currentTarget.closest("ul");
    parent.classList.remove(classes$c.visible);
  }

  function handleCrossBorderChoice(e, input) {
    var value = e.currentTarget.dataset.value;
    input.value = value;
    close();
    form.submit();
  }

  function handleKeyboard(e) {
    if (!node.classList.contains(classes$c.visible)) return;

    if (e.key == "Escape" || e.keyCode === 27) {
      close();
    }
  }

  var handleLanguageChoice = function handleLanguageChoice(e) {
    return handleCrossBorderChoice(e, localeInput);
  };

  var handleCurrencyChoice = function handleCurrencyChoice(e) {
    return handleCrossBorderChoice(e, currencyInput);
  };

  window.addEventListener("keydown", handleKeyboard);

  function destroy() {
    overlay.removeEventListener("click", close); // closeBtn.removeEventListener('click', close);
    // searchLink.removeEventListener('click', openSearch);

    items.forEach(function (item) {
      return item.removeEventListener("click", handleItem);
    });
    enableBodyScroll(node);
    document.body.classList.remove("scroll-lock");
    document.body.style.top = "";
    window.scrollTo(0, scrollPosition);
    window.removeEventListener("keydown", handleKeyboard);
    quickSearchListener();
  }

  return {
    close: close,
    destroy: destroy,
    open: open
  };
};

var selectors$w = {
  header: ".header__outer-wrapper",
  containerInner: ".purchase-confirmation-popup__inner",
  freeShippingBar: ".free-shipping-bar",
  viewCartButton: ".purchase-confirmation-popup__view-cart",
  quickCart: ".quick-cart"
};
var classes$b = {
  active: "active",
  hidden: "hidden"
};
function PurchaseConfirmationPopup(node) {
  if (!node) return;
  var quickCartEnabled = Boolean(n$2(selectors$w.quickCart, document));
  var containerInner = n$2(selectors$w.containerInner, node);
  var purchaseConfirmationAnimation = null;

  if (shouldAnimate(node)) {
    purchaseConfirmationAnimation = animatePurchaseConfirmation(node);
  }

  var delegate = new Delegate(node);
  delegate.on("click", selectors$w.viewCartButton, function (event) {
    if (!quickCartEnabled) return;
    event.preventDefault();
    r$2("quick-cart:open");
    close();
  });
  c("confirmation-popup:open", function (_, _ref) {
    var product = _ref.product;
    return getItem(product);
  });

  function getItem(product) {
    var requestUrl = "".concat(theme.routes.cart.base, "/?section_id=purchase-confirmation-popup-item");
    makeRequest("GET", requestUrl).then(function (response) {
      var container = document.createElement("div");
      container.innerHTML = response;
      containerInner.innerHTML = "";
      containerInner.appendChild(container); // Show product within cart that was newly added

      var addedProduct = n$2("[data-product-key=\"".concat(product.key, "\"]"), node);
      i$1(addedProduct, classes$b.hidden);
      open();
    });
  }

  function open() {
    u$1(node, classes$b.active);

    if (shouldAnimate(node)) {
      purchaseConfirmationAnimation.animate();
    }

    var timeout = setTimeout(function () {
      close();
    }, 5000); // Clear timeout if mouse enters, then close if it leaves

    containerInner.addEventListener("mouseover", function () {
      clearTimeout(timeout);
      containerInner.addEventListener("mouseleave", close, {
        once: true
      });
    }, {
      once: true
    });
  }

  function close() {
    i$1(node, classes$b.active);

    if (shouldAnimate(node)) {
      setTimeout(function () {
        purchaseConfirmationAnimation.reset();
      }, 500);
    }
  }
}

var selectors$v = {
  headerInner: ".header__inner",
  form: ".disclosure-form",
  list: "[data-disclosure-list]",
  toggle: "[data-disclosure-toggle]",
  input: "[data-disclosure-input]",
  option: "[data-disclosure-option]"
};
var classes$a = {
  disclosureListRight: "disclosure-list--right",
  disclosureListTop: "disclosure-list--top"
};

function has(list, selector) {
  return list.map(function (l) {
    return l.contains(selector);
  }).filter(Boolean);
}

function Disclosure(node) {
  var headerInner = n$2(selectors$v.headerInner);
  var form = node.closest(selectors$v.form);
  var list = n$2(selectors$v.list, node);
  var toggle = n$2(selectors$v.toggle, node);
  var input = n$2(selectors$v.input, node);
  var options = t$3(selectors$v.option, node);
  var events = [e$3(toggle, "click", handleToggle), e$3(options, "click", submitForm), e$3(document, "click", handleBodyClick), e$3(toggle, "focusout", handleToggleFocusOut), e$3(list, "focusout", handleListFocusOut), e$3(node, "keyup", handleKeyup)];

  function submitForm(evt) {
    evt.preventDefault();
    var value = evt.currentTarget.dataset.value;
    input.value = value;
    form.submit();
  }

  function handleToggleFocusOut(evt) {
    var disclosureLostFocus = has([node], evt.relatedTarget).length === 0;

    if (disclosureLostFocus) {
      hideList();
    }
  }

  function handleListFocusOut(evt) {
    var childInFocus = has([node], evt.relatedTarget).length > 0;
    var ariaExpanded = toggle.getAttribute("aria-expanded") === "true";

    if (ariaExpanded && !childInFocus) {
      hideList();
    }
  }

  function handleKeyup(evt) {
    if (evt.which !== 27) return;
    hideList();
    toggle.focus();
  }

  function handleToggle() {
    var ariaExpanded = toggle.getAttribute("aria-expanded") === "true";

    if (ariaExpanded) {
      hideList();
    } else {
      showList();
    }
  }

  function handleBodyClick(evt) {
    var isOption = has([node], evt.target).length > 0;
    var ariaExpanded = toggle.getAttribute("aria-expanded") === "true";

    if (ariaExpanded && !isOption) {
      hideList();
    }
  }

  function showList() {
    toggle.setAttribute("aria-expanded", true);
    list.setAttribute("aria-hidden", false);
    positionGroup();
  }

  function hideList() {
    toggle.setAttribute("aria-expanded", false);
    list.setAttribute("aria-hidden", true);
  }

  function positionGroup() {
    i$1(list, classes$a.disclosureListTop);
    i$1(list, classes$a.disclosureListRight);
    var headerInnerBounds = headerInner.getBoundingClientRect();
    var nodeBounds = node.getBoundingClientRect();
    var listBounds = list.getBoundingClientRect(); // check if the drop down list is on the right side of the screen
    // if so position the drop down aligned to the right side of the toggle button

    if (nodeBounds.x + listBounds.width >= headerInnerBounds.width) {
      u$1(list, classes$a.disclosureListRight);
    } // check if the drop down list is too close to the bottom of the viewport
    // if so position the drop down aligned to the top of the toggle button


    if (nodeBounds.y >= window.innerHeight / 2) {
      u$1(list, classes$a.disclosureListTop);
    }
  }

  function unload() {
    events.forEach(function (evt) {
      return evt();
    });
  }

  return {
    unload: unload
  };
}

function setHeaderHeightVar$1(height) {
  document.documentElement.style.setProperty("--height-header", Math.ceil(height) + "px");
}

function setHeaderStickyTopVar(value) {
  document.documentElement.style.setProperty("--header-desktop-sticky-position", value + "px");
}

function setHeaderStickyHeaderHeight(value) {
  document.documentElement.style.setProperty("--header-desktop-sticky-height", value + "px");
}

var selectors$u = {
  disclosure: "[data-disclosure]"
};
register("header", {
  crossBorder: {},
  onLoad: function onLoad() {
    var _this = this;

    var _this$container$datas = this.container.dataset,
        enableStickyHeader = _this$container$datas.enableStickyHeader,
        transparentHeaderOnHome = _this$container$datas.transparentHeaderOnHome,
        transparentHeaderOnCollection = _this$container$datas.transparentHeaderOnCollection;
    var cartIcon = t$3("[data-js-cart-icon]", this.container);
    var cartCounts = t$3("[data-js-cart-count]", this.container);
    var menuButtons = t$3("[data-js-menu-button]", this.container);
    var searchButtons = t$3("[data-search]", this.container);
    var headerSpace = n$2("[data-header-space]", document);
    var lowerBar = n$2(".header__row-desktop.lower", this.container);
    this.meganavOpenedFromDesignMode = false;
    var menu$1 = menu(n$2("[data-drawer-menu]"));
    this.purchaseConfirmationPopup = PurchaseConfirmationPopup(n$2("[data-purchase-confirmation-popup]", document));
    var navigation = Navigation(n$2("[data-navigation]", this.container), this); // This is done here AND in the liquid so it is responsive in TE but doesn't wait for JS otherwise

    document.body.classList.toggle("header-transparent-on-home", !!transparentHeaderOnHome);
    document.body.classList.toggle("header-transparent-on-collection", !!transparentHeaderOnCollection);
    document.documentElement.classList.toggle("sticky-header-enabled", !!enableStickyHeader); // These all return a function for cleanup

    this.listeners = [c("cart:updated", function (_ref) {
      var cart = _ref.cart;
      cartCounts.forEach(function (cartCount) {
        cartCount.innerHTML = cart.item_count;
      });
    }), e$3(cartIcon, "click", function (e) {
      var quickShop = n$2(".quick-cart", document);
      if (!quickShop) return;
      e.preventDefault();
      r$2("quick-cart:open");
    })];
    e$3(menuButtons, "click", function (event) {
      event.preventDefault();

      if (event.currentTarget.getAttribute("aria-expanded") == "true") {
        menu$1.close();
      } else {
        menu$1.open();
      }
    }); // Components return a destroy function for cleanup

    this.components = [menu$1];

    if (searchButtons.length > 0) {
      var quickSearch = QuickSearch(n$2("[data-quick-search]"), this.container);
      this.listeners.push(e$3(searchButtons, "click", preventDefault(quickSearch.toggleSearch)));
      this.components.push(quickSearch);
    } // navigation only exists if the header style is Inline links


    navigation && this.components.push(navigation);

    if (enableStickyHeader) {
      // Our header is always sticky (with position: sticky) however at some
      // point we want to adjust the styling (eg. box-shadow) so we toggle
      // the is-sticky class when our arbitrary space element (.header__space)
      // goes in and out of the viewport.
      this.io = new IntersectionObserver(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 1),
            visible = _ref3[0].isIntersecting;

        l(_this.container, "is-sticky", !visible);
        l(document.documentElement, "sticky-header-active", !visible);
      });
      this.io.observe(headerSpace);
    } // This will watch the height of the header and update the --height-header
    // css variable when necessary. That var gets used for the negative top margin
    // to render the page body under the transparent header


    this.ro = new index(function (_ref4) {
      var _ref5 = _slicedToArray(_ref4, 1),
          target = _ref5[0].target;

      var headerHeight = target.offsetHeight;
      var lowerBarHeight = lowerBar.offsetHeight;
      var lowerBarOffset = headerHeight - lowerBarHeight;
      setHeaderHeightVar$1(target.getBoundingClientRect() ? target.getBoundingClientRect().height : target.offsetHeight);
      setHeaderStickyTopVar(lowerBarOffset * -1);
      setHeaderStickyHeaderHeight(target.offsetHeight - lowerBarOffset);
    });
    this.ro.observe(this.container); // Wire up Cross Border disclosures

    var cbSelectors = t$3(selectors$u.disclosure, this.container);

    if (cbSelectors) {
      cbSelectors.forEach(function (selector) {
        var d = selector.dataset.disclosure;
        _this.crossBorder[d] = Disclosure(selector);
      });
    }

    this.navScroller = scrollContainer(n$2(".header__links-primary-scroll-container", this.container));
  },
  onBlockSelect: function onBlockSelect(_ref6) {
    var target = _ref6.target;
    u$1(this.container, "dropdown-active");
    u$1(target, "active");
    this.meganavOpenedFromDesignMode = true;
    this.showHeaderOverlay();
  },
  onBlockDeselect: function onBlockDeselect(_ref7) {
    var target = _ref7.target;
    i$1(this.container, "dropdown-active");
    i$1(target, "active");
    this.meganavOpenedFromDesignMode = false;
    this.hideHeaderOverlay();
  },
  onUnload: function onUnload() {
    var _this2 = this;

    this.listeners.forEach(function (l) {
      return l();
    });
    this.components.forEach(function (c) {
      return c.destroy();
    });
    this.io && this.io.disconnect();
    this.ro.disconnect();
    Object.keys(this.crossBorder).forEach(function (t) {
      return _this2.crossBorder[t].unload();
    });
  },
  showHeaderOverlay: function showHeaderOverlay() {
    r$2("headerOverlay:show");
  },
  hideHeaderOverlay: function hideHeaderOverlay() {
    r$2("headerOverlay:hide");
  }
});

var selectors$t = {
  popupTrigger: "[data-popup-trigger]"
};

var passwordUnlock = function passwordUnlock(node) {
  var events = [];
  var popupTriggers = t$3(selectors$t.popupTrigger, node);

  if (popupTriggers.length) {
    events.push(e$3(popupTriggers, "click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var content = n$2("#modal-password-unlock", node);
      r$2("modal:open", null, {
        modalContent: content
      });
    }));
  }

  function unload() {
    events.forEach(function (evt) {
      return evt();
    });
  }

  return {
    unload: unload
  };
};

function setHeaderHeightVar(height) {
  document.documentElement.style.setProperty("--height-header", Math.ceil(height) + "px");
}

register("password-header", {
  crossBorder: {},
  onLoad: function onLoad() {
    var transparentHeaderOnHome = this.container.dataset.transparentHeaderOnHome; // This is done here AND in the liquid so it is responsive in TE but doesn't wait for JS otherwise

    document.body.classList.toggle("header-transparent-on-home", !!transparentHeaderOnHome); // This will watch the height of the header and update the --height-header
    // css variable when necessary. That var gets used for the negative top margin
    // to render the page body under the transparent header

    this.ro = new index(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 1),
          target = _ref2[0].target;

      setHeaderHeightVar(target.getBoundingClientRect() ? target.getBoundingClientRect().height : target.offsetHeight);
    });
    this.ro.observe(this.container);
    this.passwordUnlock = passwordUnlock(this.container);
  },
  onUnload: function onUnload() {
    this.listeners.forEach(function (l) {
      return l();
    });
    this.components.forEach(function (c) {
      return c.destroy();
    });
    this.passwordUnlock;
    this.io && this.io.disconnect();
    this.ro.disconnect();
  }
});

var selectors$s = {
  disclosure: "[data-disclosure]",
  header: "[data-header]"
};
register("footer", {
  crossBorder: {},
  onLoad: function onLoad() {
    var _this = this;

    var headers = t$3(selectors$s.header, this.container);
    this.headerClick = e$3(headers, "click", handleHeaderClick);

    function handleHeaderClick(_ref) {
      var currentTarget = _ref.currentTarget;
      var content = currentTarget.nextElementSibling;
      l(currentTarget, "open", !isVisible(content));
      slideStop(content);

      if (isVisible(content)) {
        slideUp(content);
      } else {
        slideDown(content);
      }
    } // Wire up Cross Border disclosures


    var cbSelectors = t$3(selectors$s.disclosure, this.container);

    if (cbSelectors) {
      cbSelectors.forEach(function (selector) {
        var d = selector.dataset.disclosure;
        _this.crossBorder[d] = Disclosure(selector);
      });
    }
  },
  onUnload: function onUnload() {
    var _this2 = this;

    this.headerClick();
    Object.keys(this.crossBorder).forEach(function (t) {
      return _this2.crossBorder[t].unload();
    });
  }
});

var storage = {
  get: function get() {
    return e("exit_intent");
  },
  set: function set(val) {
    return r("exit_intent", val);
  }
};
register("popup", {
  onLoad: function onLoad() {
    var _this = this;

    var closeBtn = n$2("[data-close]", this.container);
    var overlay = n$2("[data-overlay]", this.container);
    this.closeClick = e$3([closeBtn, overlay], "click", function (e) {
      e.preventDefault();

      _this.close();
    });

    this.bodyLeave = function () {};

    var timeout = this.container.dataset.timeout;

    var mouseleave = function mouseleave(e) {
      if (!e.relatedTarget && !e.toElement) {
        _this.open();

        _this.bodyLeave();
      }
    };

    if (!storage.get() && isMobile$1()) {
      setTimeout(function () {
        return _this.open();
      }, parseInt(timeout));
    } else if (!storage.get()) {
      this.bodyLeave = e$3(document.body, "mouseout", mouseleave);
    }
  },
  open: function open() {
    u$1(this.container, "visible");
  },
  close: function close() {
    storage.set(true);
    i$1(this.container, "visible");
  },
  onSelect: function onSelect() {
    this.open();
  },
  onDeselect: function onDeselect() {
    this.close();
  },
  onUnload: function onUnload() {
    this.closeClick();
    this.bodyLeave();
  }
});

var selectors$r = {
  slider: "[data-slider]",
  slide: "[data-slider] [data-slide]",
  navPrev: ".slider-nav-button-prev",
  navNext: ".slider-nav-button-next",
  mobileOnlyInner: ".announcement-bar__item-inner-mobile-only",
  desktopOnlyInner: ".announcement-bar__item-inner-desktop-only"
};
register("announcement-bar", {
  setHeightVariable: function setHeightVariable() {
    if (this.container.offsetHeight !== this.lastSetHeight) {
      document.documentElement.style.setProperty("--announcement-height", "".concat(this.container.offsetHeight, "px"));
      this.lastSetHeight = this.container.offsetHeight;
    }
  },
  onLoad: function onLoad() {
    var _this2 = this;

    this.setHeightVariable();
    this.widthWatcher = srraf(function (_ref) {
      _ref.vw;

      _this2.setHeightVariable();
    });

    this.disableTabbingToInners = function () {
      // Disable tabbing on items that aren't shown
      var desktopOnlyInners = t$3(selectors$r.desktopOnlyInner, this.container);
      var mobileOnlyInners = t$3(selectors$r.mobileOnlyInner, this.container);
      var desktopIsMobileSize = window.matchMedia(getMediaQuery("below-720")).matches;
      desktopOnlyInners.forEach(function (inner) {
        inner.toggleAttribute("inert", desktopIsMobileSize);
      });
      mobileOnlyInners.forEach(function (inner) {
        inner.toggleAttribute("inert", !desktopIsMobileSize);
      });
    };

    this.sliderContainer = n$2(selectors$r.slider, this.container);
    this.slides = t$3(selectors$r.slide, this.container);
    this.navPrev = t$3(selectors$r.navPrev, this.container);
    this.navNext = t$3(selectors$r.navNext, this.container);
    this.disableTabbingToInners();
    this.breakPointHandler = atBreakpointChange(720, function () {
      _this2.disableTabbingToInners();
    });

    if (this.slides.length < 2) {
      return null;
    }

    var autoplayEnabled = this.sliderContainer.dataset.autoplayEnabled == "true";
    var autoplayDelay = parseInt(this.sliderContainer.dataset.autoplayDelay, 10);

    var _this = this;

    import(flu.chunks.swiper).then(function (_ref2) {
      var Swiper = _ref2.Swiper,
          Navigation = _ref2.Navigation,
          Autoplay = _ref2.Autoplay;
      _this2.swiper = new Swiper(_this2.sliderContainer, {
        on: {
          init: function init() {
            u$1(_this.container, "slider-active");
          },
          slideChangeTransitionEnd: function slideChangeTransitionEnd() {
            var slideEls = this.slides;
            setTimeout(function () {
              slideEls.forEach(function (slide) {
                slide.toggleAttribute("inert", !slide.classList.contains("swiper-slide-active"));
              });
            }, 50);
          }
        },
        modules: [Navigation, Autoplay],
        grabCursor: true,
        loop: true,
        autoplay: autoplayEnabled ? {
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        } : false,
        navigation: {
          nextEl: _this2.navNext,
          prevEl: _this2.navPrev
        }
      });
    });
  },
  onBlockSelect: function onBlockSelect(_ref3) {
    var _this$swiper, _this$swiper$autoplay, _this$swiper2;

    var slide = _ref3.target;
    var index = parseInt(slide.dataset.index, 10);
    (_this$swiper = this.swiper) === null || _this$swiper === void 0 ? void 0 : (_this$swiper$autoplay = _this$swiper.autoplay) === null || _this$swiper$autoplay === void 0 ? void 0 : _this$swiper$autoplay.stop();
    (_this$swiper2 = this.swiper) === null || _this$swiper2 === void 0 ? void 0 : _this$swiper2.slideToLoop(index);
  },
  onBlockDeselect: function onBlockDeselect() {
    var _this$swiper3, _this$swiper3$autopla;

    (_this$swiper3 = this.swiper) === null || _this$swiper3 === void 0 ? void 0 : (_this$swiper3$autopla = _this$swiper3.autoplay) === null || _this$swiper3$autopla === void 0 ? void 0 : _this$swiper3$autopla.start();
  },
  onUnload: function onUnload() {
    var _this$swiper4, _this$widthWatcher;

    (_this$swiper4 = this.swiper) === null || _this$swiper4 === void 0 ? void 0 : _this$swiper4.destroy();
    (_this$widthWatcher = this.widthWatcher) === null || _this$widthWatcher === void 0 ? void 0 : _this$widthWatcher.destroy();
  }
});

var selectors$q = {
  item: "[data-input-item]",
  quantityInput: "[data-quantity-input]",
  quantityAdd: "[data-add-quantity]",
  quantitySubtract: "[data-subtract-quantity]",
  removeItem: "[data-remove-item]"
};
function QuantityButtons(node) {
  var delegate = new Delegate(node);
  delegate.on("click", selectors$q.quantitySubtract, function (_, target) {
    var item = target.closest(selectors$q.item);
    var itemId = item.dataset.id;
    var qty = n$2(selectors$q.quantityInput, item).value;
    r$2("quantity-update:subtract", null, {
      itemId: itemId
    });
    cart.updateItem(itemId, parseInt(qty) - 1);
  });
  delegate.on("click", selectors$q.quantityAdd, function (_, target) {
    var item = target.closest(selectors$q.item);
    var itemId = item.dataset.id;
    r$2("quantity-update:add", null, {
      itemId: itemId
    });
    cart.addItemById(itemId, 1);
  });
  delegate.on("click", selectors$q.removeItem, function (_, target) {
    var item = target.closest(selectors$q.item);
    var itemId = item.dataset.id;
    r$2("quantity-update:remove", null, {
      itemId: itemId
    });
    cart.updateItem(itemId, 0);
  });

  var unload = function unload() {
    delegate.off();
  };

  return {
    unload: unload
  };
}

var strings$1 = window.theme.strings.cart;
var selectors$p = {
  cartNoteTrigger: "[data-order-note-trigger]",
  cartNoteTriggerText: "[data-cart-not-trigger-text]",
  cartNoteInputWrapper: "[cart-note-input]",
  iconPlus: ".icon-plus-small",
  iconMinus: ".icon-minus-small"
};
function CartNoteToggle(node) {
  var delegate = new Delegate(node);
  delegate.on("click", selectors$p.cartNoteTrigger, function (_, target) {
    return handleCartNoteTrigger(target);
  });

  function handleCartNoteTrigger(target) {
    var inputWrapper = n$2(selectors$p.cartNoteInputWrapper, target.parentNode);
    var textInput = n$2("textarea", inputWrapper); // Handle icon change when open or close

    var plusIcon = n$2(selectors$p.iconPlus, target);
    var minusIcon = n$2(selectors$p.iconMinus, target);
    l([plusIcon, minusIcon], "hidden");

    if (isVisible(inputWrapper)) {
      slideStop(inputWrapper);
      slideUp(inputWrapper);
      inputWrapper.setAttribute("aria-expanded", false);
      inputWrapper.setAttribute("aria-hidden", true);
      var inputTriggertext = n$2(selectors$p.cartNoteTriggerText, node); // Update cart note trigger text

      if (textInput.value === "") {
        inputTriggertext.innerText = strings$1.addCartNote;
      } else {
        inputTriggertext.innerText = strings$1.editCartNote;
      }
    } else {
      slideStop(inputWrapper);
      slideDown(inputWrapper);
      inputWrapper.setAttribute("aria-expanded", true);
      inputWrapper.setAttribute("aria-hidden", false);
    }
  }

  var unload = function unload() {
    delegate.off();
  };

  return {
    unload: unload
  };
}

/**
 * Takes a selector and updates the innerHTML of that element with the contents found in the updated document
 * @param {*} selector The selector to target
 * @param {*} doc The updated document returned by the fetch request
 */

function updateInnerHTML(selector, doc) {
  var updatedItem = n$2(selector, doc);
  var oldItem = n$2(selector);

  if (updatedItem && oldItem) {
    oldItem.innerHTML = updatedItem.innerHTML;
  }
}

var selectors$o = {
  cartWrapper: ".quick-cart__wrapper",
  innerContainer: ".quick-cart__container",
  overlay: ".quick-cart__overlay",
  closeButton: ".quick-cart__close-icon",
  footer: ".quick-cart__footer",
  items: ".quick-cart__items",
  cartError: ".quick-cart__item-error",
  form: ".quick-cart__form",
  cartCount: ".quick-cart__heading sup",
  subtotal: ".quick-cart__footer-subtotal span",
  quantityInput: ".quick-cart .quantity-input__input",
  quantityItem: "[data-input-item]",
  discounts: ".quick-cart__item-discounts"
};
var classes$9 = {
  active: "active",
  hidden: "hidden",
  updatingQuantity: "has-quantity-update",
  removed: "is-removed"
};
register("quick-cart", {
  onLoad: function onLoad() {
    var _this = this;

    this.cartWrapper = n$2(selectors$o.cartWrapper, this.container);
    this.cartTrap = createFocusTrap(this.container, {
      allowOutsideClick: true
    }); // Events are all on events trigger by other components / functions

    this.events = [c("quick-cart:open", function () {
      return _this.openQuickCart();
    }), c("quick-cart:updated", function () {
      return _this.refreshQuickCart();
    }), c("quick-cart:error", function (_, _ref) {
      var id = _ref.id,
          errorMessage = _ref.errorMessage;

      _this.handleErrorMessage(id, errorMessage);
    }), c(["quantity-update:subtract", "quantity-update:add"], function (_, _ref2) {
      var itemId = _ref2.itemId;

      _this.handleQuantityUpdate(itemId);
    }), c("quantity-update:remove", function (_, _ref3) {
      var itemId = _ref3.itemId;

      _this.handleItemRemoval(itemId);
    })];
    this.quantityButtons = QuantityButtons(this.container);
    this.cartNoteToggle = CartNoteToggle(this.container);

    if (shouldAnimate(this.container)) {
      this.animateQuickCart = animateQuickCart(this.container);
    } // Delegate handles all click events due to rendering different content
    // within quick cart


    this.delegate = new Delegate(this.container);
    this.delegate.on("click", selectors$o.overlay, function () {
      return _this.close();
    });
    this.delegate.on("click", selectors$o.closeButton, function () {
      return _this.close();
    });
    this.delegate.on("change", selectors$o.quantityInput, function (e) {
      return _this.handleQuantityInputChange(e);
    });
  },
  openQuickCart: function openQuickCart() {
    var _this$animateQuickCar;

    u$1(this.cartWrapper, classes$9.active);
    this.cartTrap.activate();
    this.adjustItemPadding();
    (_this$animateQuickCar = this.animateQuickCart) === null || _this$animateQuickCar === void 0 ? void 0 : _this$animateQuickCar.open();
    disableBodyScroll(this.container, {
      allowTouchMove: function allowTouchMove(el) {
        while (el && el !== document.body) {
          if (el.getAttribute("data-scroll-lock-ignore") !== null) {
            return true;
          }

          el = el.parentNode;
        }
      },
      reserveScrollBarGap: true
    });
  },
  refreshQuickCart: function refreshQuickCart() {
    var _this2 = this;

    var url = "".concat(theme.routes.cart.base, "?section_id=quick-cart");
    makeRequest("GET", url).then(function (response) {
      var container = document.createElement("div");
      container.innerHTML = response;
      var responseInnerContainer = n$2(selectors$o.innerContainer, container);
      var cartHasItems = Boolean(n$2(selectors$o.items, _this2.container));
      var responseHasItems = Boolean(n$2(selectors$o.items, container)); // Cart has items and needs to update them

      if (responseHasItems && cartHasItems) {
        var _this2$animateQuickCa;

        // Render cart items
        updateInnerHTML("".concat(selectors$o.cartWrapper, " ").concat(selectors$o.items), container);

        _this2.adjustItemPadding(); // Render cart count


        updateInnerHTML("".concat(selectors$o.cartWrapper, " ").concat(selectors$o.cartCount), container); // Render subtotal

        updateInnerHTML("".concat(selectors$o.cartWrapper, " ").concat(selectors$o.subtotal), container); // Render promotions

        updateInnerHTML("".concat(selectors$o.cartWrapper, " ").concat(selectors$o.discounts), container); // Handle form scroll state

        var form = n$2(selectors$o.form, _this2.container);
        var previousScrollPosition = form.scrollTop || 0;
        form.scrollTop = previousScrollPosition;
        (_this2$animateQuickCa = _this2.animateQuickCart) === null || _this2$animateQuickCa === void 0 ? void 0 : _this2$animateQuickCa.setup();
      } else {
        // Cart needs to render empty from having items, or needs to render
        // items from empty state
        var innerContainer = n$2(selectors$o.innerContainer, _this2.container);
        innerContainer.innerHTML = responseInnerContainer.innerHTML;
      }
    });
  },
  handleErrorMessage: function handleErrorMessage(itemId) {
    var item = n$2("[data-id=\"".concat(itemId, "\"]"), this.container);
    i$1(n$2(selectors$o.cartError, item), classes$9.hidden);
    i$1(item, classes$9.updatingQuantity);
  },
  handleQuantityUpdate: function handleQuantityUpdate(itemId) {
    var item = n$2("[data-id=\"".concat(itemId, "\"]"), this.container);
    u$1(item, classes$9.updatingQuantity);
  },
  handleItemRemoval: function handleItemRemoval(itemId) {
    var item = n$2("[data-id=\"".concat(itemId, "\"]"), this.container);
    u$1(item, classes$9.removed);
    u$1(item, classes$9.updatingQuantity);
  },
  handleQuantityInputChange: function handleQuantityInputChange(_ref4) {
    var target = _ref4.target;
    var item = target.closest(selectors$o.quantityItem);
    var itemId = item.dataset.id;
    cart.updateItem(itemId, target.value);
    this.handleQuantityUpdate(itemId);
  },
  adjustItemPadding: function adjustItemPadding() {
    var items = n$2(selectors$o.items, this.container);
    if (!items) return; // Ensure cart items accounts for the height of cart footer

    var footer = n$2(selectors$o.footer, this.container);
    items.style.paddingBottom = "".concat(footer.clientHeight, "px");
  },
  close: function close() {
    var _this3 = this;

    i$1(this.cartWrapper, classes$9.active);
    setTimeout(function () {
      var _this3$animateQuickCa;

      (_this3$animateQuickCa = _this3.animateQuickCart) === null || _this3$animateQuickCa === void 0 ? void 0 : _this3$animateQuickCa.close();

      _this3.cartTrap.deactivate();

      enableBodyScroll(_this3.container);
    }, 500);
  },
  onSelect: function onSelect() {
    this.openQuickCart();
  },
  onDeselect: function onDeselect() {
    this.close();
  },
  onUnload: function onUnload() {
    this.delegate.off();
    this.events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    this.quantityButtons.unload();
    this.cartNoteToggle.unload();
  }
});

register("blog-posts", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateBlogPosts = animateBlogPosts(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateBlogPost;

    (_this$animateBlogPost = this.animateBlogPosts) === null || _this$animateBlogPost === void 0 ? void 0 : _this$animateBlogPost.destroy();
  }
});

var selectors$n = {
  itemTrigger: ".collapsible-row-list-item__trigger"
};
register("collapsible-row-list", {
  onLoad: function onLoad() {
    var _this = this;

    this.items = t$3(selectors$n.itemTrigger, this.container);
    this.clickHandlers = e$3(this.items, "click", function (e) {
      e.preventDefault();
      var _e$currentTarget = e.currentTarget,
          group = _e$currentTarget.parentNode,
          content = _e$currentTarget.nextElementSibling;

      if (isVisible(content)) {
        _this._close(e.currentTarget, group, content);
      } else {
        _this._open(e.currentTarget, group, content);
      }
    });

    if (shouldAnimate(this.container)) {
      this.animateCollapsibleRowList = animateCollapsibleRowList(this.container);
    }
  },
  _open: function _open(label, group, content) {
    slideStop(content);
    slideDown(content);
    group.setAttribute("data-open", true);
    label.setAttribute("aria-expanded", true);
    content.setAttribute("aria-hidden", false);
  },
  _close: function _close(label, group, content) {
    slideStop(content);
    slideUp(content);
    group.setAttribute("data-open", false);
    label.setAttribute("aria-expanded", false);
    content.setAttribute("aria-hidden", true);
  },
  onBlockSelect: function onBlockSelect(_ref) {
    var target = _ref.target;
    var label = n$2(selectors$n.itemTrigger, target);
    var group = label.parentNode,
        content = label.nextElementSibling;

    this._open(label, group, content);
  },
  onUnload: function onUnload() {
    var _this$animateCollapsi;

    this.clickHandlers();
    (_this$animateCollapsi = this.animateCollapsibleRowList) === null || _this$animateCollapsi === void 0 ? void 0 : _this$animateCollapsi.destroy();
  }
});

var selectors$m = {
  sliderContainer: ".swiper",
  visibleSlides: ".swiper-slide-visible"
};
var classes$8 = {
  overflow: "has-overflow",
  carousel: "carousel"
};
var Carousel = (function (node) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // Pass the swiper container or the contain section
  var swiperContainer = a$1(node, classes$8.carousel) ? node : n$2(selectors$m.sliderContainer, node);
  if (!swiperContainer) return;
  var carousel;
  var events = [];
  var defaultSwiperOptions = {
    slidesPerView: 2,
    grabCursor: true,
    watchSlidesProgress: true,
    on: {
      init: function init() {
        handleOverflow(this.slides);
      },
      breakpoint: function breakpoint() {
        onBreakpointChange(this.slides);
      }
    }
  };
  var nextButton = n$2("[data-next]", node);
  var prevButton = n$2("[data-prev]", node);
  var useNav = nextButton && prevButton; // Account for additional padding if slides overflow container

  var handleOverflow = function handleOverflow(slides) {
    // Allow breakpoints config settings to apply
    setTimeout(function () {
      var hasOverflow = a$1(swiperContainer, classes$8.overflow);
      var needsOverflow = t$3(selectors$m.visibleSlides, swiperContainer).length !== slides.length;

      if (!hasOverflow && needsOverflow) {
        u$1(swiperContainer, classes$8.overflow);
      } else if (hasOverflow && !needsOverflow) {
        i$1(swiperContainer, classes$8.overflow);
      }
    }, 0);
  };

  var onBreakpointChange = function onBreakpointChange(slides) {
    handleOverflow(slides);
  };

  function handleFocus(event) {
    var slide = event.target.closest(".swiper-slide");

    var slideIndex = _toConsumableArray(slide.parentElement.children).indexOf(slide); // TODO: ideally this would be dependant on if slide didn't have
    // `swiper-slide-visible` class (so would slide only as needed)
    // however that doesn't work with mobile peek, so brut forcing for now
    // and will always sliding now


    if (document.body.classList.contains("user-is-tabbing")) {
      carousel.slideTo(slideIndex);
    }
  }

  import(flu.chunks.swiper).then(function (_ref) {
    var Swiper = _ref.Swiper,
        Navigation = _ref.Navigation;
    var swiperOptions = Object.assign(defaultSwiperOptions, options); // nextEl and prevEl can be passed in check if they are before
    // using the defaults

    if ("navigation" in swiperOptions) {
      swiperOptions = Object.assign(swiperOptions, {
        modules: [Navigation]
      });
    } else if (useNav) {
      swiperOptions = Object.assign(swiperOptions, {
        modules: [Navigation],
        navigation: {
          nextEl: nextButton,
          prevEl: prevButton
        }
      });
    }

    carousel = new Swiper(swiperContainer, swiperOptions);
    events.push(e$3(swiperContainer, "focusin", handleFocus));
  });
  return {
    destroy: function destroy() {
      var _carousel;

      (_carousel = carousel) === null || _carousel === void 0 ? void 0 : _carousel.destroy();
      events.forEach(function (unsubscribe) {
        return unsubscribe();
      });
    }
  };
});

register("collection-list-slider", {
  events: [],
  onLoad: function onLoad() {
    var _this$container$datas = this.container.dataset,
        productsPerView = _this$container$datas.productsPerView,
        mobileProductsPerView = _this$container$datas.mobileProductsPerView;
    this.perView = parseInt(productsPerView, 10); // 1.05 factor gives us a "peek" without CSS hacks
    // TODO: encapsulate this in carousel instead of duplication wherever
    // we call on carousel.  Can also simplify the config that we pass in
    // to something like perViewSmall, perViewMedium, perViewLarge and same with
    // spaceBetween?

    this.mobilePerView = parseInt(mobileProductsPerView, 10) * 1.05;

    this._initCarousel();

    if (shouldAnimate(this.container)) {
      this.animateListSlider = animateListSlider(this.container);
    }
  },
  _initCarousel: function _initCarousel() {
    // Between 720 - 960 the slides per view stay consistent with section
    // settings, with the exception of 5, which then shrinks down to 4 across.
    this.carousel = Carousel(this.container, {
      slidesPerView: this.mobilePerView,
      spaceBetween: 12,
      breakpoints: {
        720: {
          spaceBetween: 16,
          slidesPerView: this.perView === 5 ? this.perView - 1 : this.perView
        },
        1200: {
          spaceBetween: 24,
          slidesPerView: this.perView
        }
      }
    });
  },
  onUnload: function onUnload() {
    var _this$carousel, _this$animateListSlid;

    (_this$carousel = this.carousel) === null || _this$carousel === void 0 ? void 0 : _this$carousel.destroy();
    (_this$animateListSlid = this.animateListSlider) === null || _this$animateListSlid === void 0 ? void 0 : _this$animateListSlid.destroy();
  }
});

var selectors$l = {
  "settings": "[data-timer-settings]",
  "days": "[data-days]",
  "hours": "[data-hours]",
  "minutes": "[data-minutes]",
  "seconds": "[data-seconds]"
};
var classes$7 = {
  "active": "active",
  "hide": "hide",
  "complete": "complete"
};
function CountdownTimer(container) {
  var settings = n$2(selectors$l.settings, container);

  var _JSON$parse = JSON.parse(settings.innerHTML),
      year = _JSON$parse.year,
      month = _JSON$parse.month,
      day = _JSON$parse.day,
      hour = _JSON$parse.hour,
      minute = _JSON$parse.minute,
      hideTimerOnComplete = _JSON$parse.hideTimerOnComplete;

  var daysEl = n$2(selectors$l.days, container);
  var hoursEl = n$2(selectors$l.hours, container);
  var minutesEl = n$2(selectors$l.minutes, container);
  var secondsEl = n$2(selectors$l.seconds, container);
  var countDownDate = new Date("".concat(month, " ").concat(day, ", ").concat(year, " ").concat(hour, ":").concat(minute)).getTime();
  var timerInterval = setInterval(timerLoop, 1000);
  timerLoop();
  u$1(container, classes$7.active);

  function timerLoop() {
    window.requestAnimationFrame(function () {
      // Get today's date and time
      var now = new Date().getTime(); // Find the distance between now and the count down date

      var distance = countDownDate - now; // Time calculations for days, hours, minutes and seconds

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
      var minutes = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60));
      var seconds = Math.floor(distance % (1000 * 60) / 1000); // If the count down is finished, write some text

      if (distance < 0) {
        timerInterval && clearInterval(timerInterval);
        daysEl.innerHTML = 0;
        hoursEl.innerHTML = 0;
        minutesEl.innerHTML = 0;
        secondsEl.innerHTML = 0;
        u$1(container, classes$7.complete);

        if (hideTimerOnComplete) {
          u$1(container, classes$7.hide);
        }
      } else {
        daysEl.innerHTML = days;
        hoursEl.innerHTML = hours;
        minutesEl.innerHTML = minutes;
        secondsEl.innerHTML = seconds;
      }
    });
  }

  function destroy() {
    timerInterval && clearInterval(timerInterval);
  }

  return {
    destroy: destroy
  };
}

var selectors$k = {
  "timer": "[data-countdown-timer]"
};
register("countdown-banner", {
  onLoad: function onLoad() {
    var _this = this;

    var timers = t$3(selectors$k.timer, this.container);
    this.countdownTimers = [];
    timers.forEach(function (timer) {
      _this.countdownTimers.push(CountdownTimer(timer));
    });

    if (shouldAnimate(this.container)) {
      this.animateCountdownBanner = animateCountdownBanner(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateCountdow;

    (_this$animateCountdow = this.animateCountdownBanner) === null || _this$animateCountdow === void 0 ? void 0 : _this$animateCountdow.destroy();
    this.countdownTimers.forEach(function (countdownTimer) {
      return countdownTimer.destroy();
    });
  }
});

var selectors$j = {
  "timer": "[data-countdown-timer]"
};
register("countdown-bar", {
  onLoad: function onLoad() {
    var _this = this;

    var timers = t$3(selectors$j.timer, this.container);
    this.countdownTimers = [];
    timers.forEach(function (timer) {
      _this.countdownTimers.push(CountdownTimer(timer));
    });

    if (shouldAnimate(this.container)) {
      this.animateCountdownBar = animateCountdownBar(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateCountdow;

    (_this$animateCountdow = this.animateCountdownBar) === null || _this$animateCountdow === void 0 ? void 0 : _this$animateCountdow.destroy();
    this.countdownTimers.forEach(function (countdownTimer) {
      return countdownTimer.destroy();
    });
  }
});

var selectors$i = {
  item: ".product-item",
  itemInner: ".product-item__inner",
  quickViewButton: ".show-product-quickview"
};
function ProductItem(container) {
  var items = t$3(selectors$i.item, container);
  if (!items.length) return; // Add z-index for quick-buy overlap

  items.forEach(function (item, i) {
    return item.style.setProperty("--z-index-item", items.length - i);
  });
  var productItemAnimations = AnimateProductItem(items);
  var quickViewButtons = t$3(selectors$i.quickViewButton, container);
  var events = [e$3(quickViewButtons, "click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    var linkEl = e.currentTarget;
    var url = linkEl.getAttribute("href");
    r$2("quick-view:open", null, {
      productUrl: url
    });
  })];

  var unload = function unload() {
    productItemAnimations.destroy();
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  };

  return {
    unload: unload
  };
}

register("featured-collection-grid", {
  events: [],
  onLoad: function onLoad() {
    var _this = this;

    var _this$container$datas = this.container.dataset,
        productsPerView = _this$container$datas.productsPerView,
        mobileProductsPerView = _this$container$datas.mobileProductsPerView;
    this.perView = parseInt(productsPerView, 10);
    this.mobilePerView = parseInt(mobileProductsPerView, 10) * 1.05; // 1.05 factor gives us a "peek" without CSS hacks
    // TODO: encapsulate this in carousel instead of duplication wherever
    // we call on carousel.  Can also simplify the config that we pass in
    // to something like perViewSmall, perViewMedium, perViewLarge and same with
    // spaceBetween?

    this.productItem = ProductItem(this.container);
    this.breakPointHandler = atBreakpointChange(960, function () {
      if (window.matchMedia(getMediaQuery("below-960")).matches) {
        _this._initCarousel();
      } else {
        _this.carousel.destroy();
      }
    });

    if (window.matchMedia(getMediaQuery("below-960")).matches) {
      this._initCarousel();
    }

    if (shouldAnimate(this.container)) {
      this.animateFeaturedCollectionGrid = animateFeaturedCollectionGrid(this.container);
    }
  },
  _initCarousel: function _initCarousel() {
    // Between 720 - 960 the slides per view stay consistent with section
    // settings, with the exception of 5, which then shrinks down to 4 across.
    this.carousel = Carousel(this.container, {
      slidesPerView: this.mobilePerView,
      spaceBetween: 12,
      breakpoints: {
        720: {
          spaceBetween: 16,
          slidesPerView: this.perView === 5 ? this.perView - 1 : this.perView
        }
      }
    });
  },
  onUnload: function onUnload() {
    var _this$carousel, _this$animateFeatured;

    (_this$carousel = this.carousel) === null || _this$carousel === void 0 ? void 0 : _this$carousel.destroy();
    (_this$animateFeatured = this.animateFeaturedCollectionGrid) === null || _this$animateFeatured === void 0 ? void 0 : _this$animateFeatured.destroy();
  }
});

var selectors$h = {
  navItems: ".featured-collection-slider__navigation-list-item",
  sliderContainer: ".carousel",
  navButtons: ".carousel__navigation-buttons"
};
var classes$6 = {
  selected: "selected",
  visible: "visible",
  fadeout: "fadeout",
  initReveal: "init-reveal",
  reveal: "reveal"
};
register("featured-collection-slider", {
  events: [],
  carousels: [],
  onLoad: function onLoad() {
    var _this = this;

    r$2("feature-collection-slider:loading");

    this._initCarousels(); // TODO possible temp fix
    // Multiple carousels can cause issues on change within the cusomizer,
    // This ensures carousels are reinitilizaed if one reloads.


    if (window.Shopify.designMode) {
      this.events.push(c("feature-collection-slider:loading", function () {
        return _this._initCarousels();
      }));
    }

    if (shouldAnimate(this.container)) {
      this.animateListSlider = animateListSlider(this.container);
    }
  },
  _initCarousels: function _initCarousels() {
    var _this2 = this;

    var _this$container$datas = this.container.dataset,
        productsPerView = _this$container$datas.productsPerView,
        mobileProductsPerView = _this$container$datas.mobileProductsPerView;
    this.perView = parseInt(productsPerView, 10);
    this.mobilePerView = parseInt(mobileProductsPerView, 10) * 1.05; // 1.05 factor gives us a "peek" without CSS hacks
    // TODO: encapsulate this in carousel instead of duplication wherever
    // we call on carousel.  Can also simplify the config that we pass in
    // to something like perViewSmall, perViewMedium, perViewLarge and same with
    // spaceBetween?

    this.productItem = ProductItem(this.container);
    this.carouselsElements = t$3(selectors$h.sliderContainer, this.container);
    this.navItems = t$3(selectors$h.navItems, this.container);
    this.navigationButtons = t$3(selectors$h.navButtons, this.container);
    this.navItems.forEach(function (button) {
      return _this2.events.push(e$3(button, "click", _this2._handleNavButton.bind(_this2)));
    });
    this.carouselsElements.forEach(function (container, index) {
      var navigationWrapper = n$2("[data-navigation=\"".concat(index, "\"]"), _this2.container);
      var nextButton = n$2("[data-next]", navigationWrapper);
      var prevButton = n$2("[data-prev]", navigationWrapper);

      _this2.carousels.push(Carousel(container, {
        slidesPerView: _this2.mobilePerView,
        spaceBetween: 13,
        // matches product grid
        navigation: {
          nextEl: nextButton,
          prevEl: prevButton
        },
        breakpoints: {
          720: {
            spaceBetween: 17,
            // matches product grid
            slidesPerView: _this2.perView === 5 ? _this2.perView - 1 : _this2.perView
          },
          1200: {
            spaceBetween: 25,
            // matches product grid
            slidesPerView: _this2.perView
          }
        }
      }));
    });
  },
  _handleNavButton: function _handleNavButton(e) {
    e.preventDefault();
    var navigationItem = e.currentTarget.dataset.navigationItem;

    if (!a$1(e.currentTarget, classes$6.selected)) {
      this._hideAll();

      this._show(parseInt(navigationItem, 10));
    }
  },
  _hideAll: function _hideAll() {
    var _this3 = this;

    i$1(this.navItems, classes$6.selected);
    i$1(this.navigationButtons, classes$6.visible);
    i$1(this.carouselsElements, classes$6.initReveal);
    i$1(this.carouselsElements, classes$6.reveal);

    if (shouldAnimate(this.container)) {
      u$1(this.carouselsElements, classes$6.fadeout);
      setTimeout(function () {
        i$1(_this3.carouselsElements, classes$6.visible);
      }, 300);
    } else {
      i$1(this.carouselsElements, classes$6.visible);
    }
  },
  _show: function _show(index) {
    var navigationWrapper = n$2("[data-navigation=\"".concat(index, "\"]"), this.container);
    u$1(navigationWrapper, classes$6.visible);
    var collection = n$2("[data-collection=\"".concat(index, "\"]"), this.container);

    if (this.navItems.length) {
      var navigationItem = n$2("[data-navigation-item=\"".concat(index, "\"]"), this.container);
      u$1(navigationItem, classes$6.selected);
    }

    if (shouldAnimate(this.container)) {
      u$1(collection, classes$6.fadeout);
      u$1(collection, classes$6.initReveal);
      setTimeout(function () {
        u$1(collection, classes$6.visible);
        i$1(collection, classes$6.fadeout);
        setTimeout(function () {
          u$1(collection, classes$6.reveal);
        }, 50);
      }, 300);
    } else {
      u$1(collection, classes$6.visible);
    }
  },
  onUnload: function onUnload() {
    var _this$animateListSlid;

    this.carousels.forEach(function (swiper) {
      return swiper.destroy();
    });
    (_this$animateListSlid = this.animateListSlider) === null || _this$animateListSlid === void 0 ? void 0 : _this$animateListSlid.destroy();
    this.events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  },
  onBlockSelect: function onBlockSelect(_ref) {
    var target = _ref.target;
    var collection = target.dataset.collection;

    this._hideAll();

    this._show(parseInt(collection, 10));
  }
});

register("featured-product", {
  onLoad: function onLoad() {
    this.product = new Product(this.container);

    if (shouldAnimate(this.container)) {
      this.animateProduct = animateProduct(this.container);
    }
  },
  onBlockSelect: function onBlockSelect(_ref) {
    var target = _ref.target;
    var label = n$2(".accordion__label", target);
    target.scrollIntoView({
      block: "center",
      behavior: "smooth"
    });
    if (!label) return;
    var group = label.parentNode,
        content = label.nextElementSibling;
    slideStop(content);
    slideDown(content);
    group.setAttribute("data-open", true);
    label.setAttribute("aria-expanded", true);
    content.setAttribute("aria-hidden", false);
  },
  onBlockDeselect: function onBlockDeselect(_ref2) {
    var target = _ref2.target;
    var label = n$2(".accordion__label", target);
    if (!label) return;
    var group = label.parentNode,
        content = label.nextElementSibling;
    slideStop(content);
    slideUp(content);
    group.setAttribute("data-open", false);
    label.setAttribute("aria-expanded", false);
    content.setAttribute("aria-hidden", true);
  },
  onUnload: function onUnload() {
    var _this$animateProduct;

    this.product.unload();
    (_this$animateProduct = this.animateProduct) === null || _this$animateProduct === void 0 ? void 0 : _this$animateProduct.destroy();
  }
});

var selectors$g = {
  recommendations: "[data-recommendations]",
  carouselSlide: ".carousel__slide"
};
register("recommended-products", {
  onLoad: function onLoad() {
    var _this = this;

    var _this$container$datas = this.container.dataset,
        limit = _this$container$datas.limit,
        id = _this$container$datas.productId,
        sectionId = _this$container$datas.sectionId,
        productsPerView = _this$container$datas.productsPerView,
        mobileProductsPerView = _this$container$datas.mobileProductsPerView;
    this.perView = parseInt(productsPerView, 10);
    this.mobilePerView = parseInt(mobileProductsPerView, 10) * 1.05; // 1.05 factor gives us a "peek" without CSS hacks
    // TODO: encapsulate this in carousel instead of duplication wherever
    // we call on carousel.  Can also simplify the config that we pass in
    // to something like perViewSmall, perViewMedium, perViewLarge and same with
    // spaceBetween?

    var content = n$2(selectors$g.recommendations, this.container);
    if (!content) return;
    var requestUrl = "".concat(window.theme.routes.productRecommendations, "?section_id=").concat(sectionId, "&limit=").concat(limit, "&product_id=").concat(id);
    var request = new XMLHttpRequest();
    request.open("GET", requestUrl, true);

    request.onload = function () {
      if (request.status >= 200 && request.status < 300) {
        var container = document.createElement("div");
        container.innerHTML = request.response;
        content.innerHTML = n$2(selectors$g.recommendations, container).innerHTML;
        var carousel = n$2(selectors$g.carouselSlide, content);
        _this.productItem = ProductItem(_this.container);

        if (shouldAnimate(_this.container)) {
          _this.animateListSlider = animateListSlider(_this.container);
        }

        if (carousel) {
          // Between 720 - 960 the slides per view stay consistent with section
          // settings, with the exception of 5, which then shrinks down to 4 across.
          _this.carousel = Carousel(content, {
            slidesPerView: _this.mobilePerView,
            spaceBetween: 12,
            breakpoints: {
              720: {
                spaceBetween: 16,
                slidesPerView: _this.perView === 5 ? _this.perView - 1 : _this.perView
              },
              1200: {
                spaceBetween: 24,
                slidesPerView: _this.perView
              }
            }
          });
        } else {
          _this._removeSection();
        }
      } else {
        // If request returns any errors remove the section markup
        _this._removeSection();
      }
    };

    request.send();
  },
  _removeSection: function _removeSection() {
    this.container.parentNode.removeChild(this.container);
  },
  onUnload: function onUnload() {
    var _this$carousel, _this$animateListSlid;

    (_this$carousel = this.carousel) === null || _this$carousel === void 0 ? void 0 : _this$carousel.destroy();
    (_this$animateListSlid = this.animateListSlider) === null || _this$animateListSlid === void 0 ? void 0 : _this$animateListSlid.destroy();
  }
});

var selectors$f = {
  slide: "[data-slide]",
  swiper: ".swiper",
  navigationPrev: ".slideshow-navigation__navigation-button--previous",
  navigationNext: ".slideshow-navigation__navigation-button--next",
  navigationDots: ".slideshow-navigation__dots",
  navigationDot: ".slideshow-navigation__dot",
  navigationLoader: ".slideshow-navigation__dot-loader",
  activeDot: "slideshow-navigation__dot--active",
  animatableItems: ".animation--section-blocks > *"
};
register("slideshow", {
  events: [],
  slideshow: null,
  onLoad: function onLoad() {
    var _this = this;

    this.enableAutoplay = this.container.dataset.enableAutoplay;
    this.autoplayDuration = this.container.dataset.autoplay;
    this.slideshowContainer = n$2(selectors$f.swiper, this.container);
    this.slides = t$3(selectors$f.slide, this.container);
    this.events.push(e$3(this.container, "focusin", function () {
      return _this.handleFocus();
    }));

    if (shouldAnimate(this.container)) {
      this.slideAnimations = this.slides.map(function (slide) {
        return delayOffset(slide, [selectors$f.animatableItems], 3);
      });
      this.observer = intersectionWatcher(this.container);
    }

    if (this.slides.length > 1) {
      import(flu.chunks.swiper).then(function (_ref) {
        var Swiper = _ref.Swiper,
            Navigation = _ref.Navigation,
            Autoplay = _ref.Autoplay,
            Pagination = _ref.Pagination,
            EffectFade = _ref.EffectFade;
        var swiperOptions = {
          modules: [Navigation, Pagination, EffectFade],
          slidesPerView: 1,
          grabCursor: true,
          effect: "fade",
          fadeEffect: {
            crossFade: false
          },
          watchSlidesProgress: true,
          loop: true,
          navigation: {
            nextEl: selectors$f.navigationNext,
            prevEl: selectors$f.navigationPrev
          },
          pagination: {
            el: selectors$f.navigationDots,
            clickable: true,
            bulletActiveClass: selectors$f.activeDot,
            bulletClass: "slideshow-navigation__dot",
            renderBullet: function renderBullet(_, className) {
              return "\n                <button class=\"".concat(className, "\" type=\"button\">\n                  <div class=\"slideshow-navigation__dot-loader\"></div>\n                </button>");
            }
          },
          on: {
            afterInit: function afterInit() {
              _this.handleBulletLabels();
            },
            slideChangeTransitionEnd: function slideChangeTransitionEnd() {
              var slideEls = this.slides;
              setTimeout(function () {
                slideEls.forEach(function (slide) {
                  slide.toggleAttribute("inert", !slide.classList.contains("swiper-slide-active"));
                });
              }, 50);
            }
          }
        };

        if (_this.enableAutoplay === "true" && !prefersReducedMotion()) {
          swiperOptions.modules.push(Autoplay);
          swiperOptions.autoplay = {
            delay: _this.autoplayDuration,
            disableOnInteraction: false
          };
        }

        _this.slideshow = new Swiper(_this.slideshowContainer, swiperOptions);
        r$2("slideshow:initialized");
      });
    }
  },
  handleFocus: function handleFocus() {
    if (a$1(document.body, "user-is-tabbing")) {
      this.slideshow.autoplay.stop();
    }
  },
  handleBulletLabels: function handleBulletLabels() {
    var _this2 = this;

    var bullets = t$3(selectors$f.navigationDot, this.container);
    bullets.forEach(function (bullet, index) {
      var associatedSlide = _this2.slides[index];
      var bulletLabel = associatedSlide.dataset.bulletLabel;
      bullet.setAttribute("aria-label", bulletLabel);
    });
  },
  handleBlockSelect: function handleBlockSelect(slideIndex) {
    this.slideshow.slideTo(parseInt(slideIndex, 10));
    this.slideshow.autoplay.stop(); // Pause all loading animations

    t$3(selectors$f.navigationLoader, this.container).forEach(function (loader) {
      loader.style.animationPlayState = "paused";
    });
  },
  handleBlockDeselect: function handleBlockDeselect() {
    var _this$slideshow;

    (_this$slideshow = this.slideshow) === null || _this$slideshow === void 0 ? void 0 : _this$slideshow.autoplay.start(); // Resume all loading animations

    t$3(selectors$f.navigationLoader, this.container).forEach(function (loader) {
      loader.style.animationPlayState = "running";
    });
  },
  onBlockSelect: function onBlockSelect(_ref2) {
    var _this3 = this;

    var target = _ref2.target;
    var slide = target.dataset.slide;

    if (this.slideshow) {
      this.handleBlockSelect(slide);
    } else {
      // Listen for initalization if slideshow does not exist
      this.events.push(c("slideshow:initialized", function () {
        _this3.handleBlockSelect(slide);
      }));
    }
  },
  onBlockDeselect: function onBlockDeselect() {
    var _this4 = this;

    if (this.slideshow) {
      this.handleBlockDeselect();
    } else {
      // Listen for initalization if slideshow does not exist
      this.events.push(c("slideshow:initialized", function () {
        _this4.handleBlockDeselect();
      }));
    }
  },
  onUnload: function onUnload() {
    var _this$slideshow2, _this$observer;

    (_this$slideshow2 = this.slideshow) === null || _this$slideshow2 === void 0 ? void 0 : _this$slideshow2.destroy();
    this.events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    (_this$observer = this.observer) === null || _this$observer === void 0 ? void 0 : _this$observer.destroy();
  }
});

var selectors$e = {
  playButton: "[data-play-button-block]",
  playButtonVideoContainer: "[data-play-button-block-video-container]",
  photoSwipeElement: ".pswp",
  video: ".play-button-block-video"
};
var icons = window.theme.icons;

var playButton = function playButton(node) {
  var photoSwipeInstance;
  var playButton = n$2(selectors$e.playButton, node);
  var videoHtml = n$2(selectors$e.playButtonVideoContainer, node).outerHTML;
  import(flu.chunks.photoswipe); // Load this ahead of needing

  var events = [e$3(playButton, "click", function () {
    import(flu.chunks.photoswipe).then(function (_ref) {
      var PhotoSwipeLightbox = _ref.PhotoSwipeLightbox,
          PhotoSwipe = _ref.PhotoSwipe;
      photoSwipeInstance = new PhotoSwipeLightbox({
        dataSource: [{
          html: videoHtml
        }],
        pswpModule: PhotoSwipe,
        mainClass: "pswp--video-lightbox",
        closeSVG: icons.close,
        arrowPrev: false,
        arrowNext: false,
        zoom: false,
        counter: false
      });
      photoSwipeInstance.init();
      photoSwipeInstance.loadAndOpen();
      photoSwipeInstance.on("bindEvents", function () {
        var instanceVideo = n$2(selectors$e.video, photoSwipeInstance.pswp.container);
        instanceVideo.play();
      });
    });
  })];

  var unload = function unload() {
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    photoSwipeInstance && photoSwipeInstance.destroy();
  };

  return {
    unload: unload
  };
};

var selectors$d = {
  video: ".video-hero__video",
  playButtonVideo: "[data-play-button-block-video]",
  playButtonBlock: ".play-button-block"
};
register("video-hero", {
  videoHandler: null,
  onLoad: function onLoad() {
    var playButtonVideos = t$3(selectors$d.playButtonVideo, this.container);
    var video = n$2(selectors$d.video, this.container);

    if (playButtonVideos.length) {
      this.playButtons = playButtonVideos.map(function (block) {
        return playButton(block.closest(selectors$d.playButtonBlock));
      });
    }

    if (video) {
      this.videoHandler = backgroundVideoHandler(this.container);
    }

    if (shouldAnimate(this.container)) {
      this.animateVideoHero = animateVideoHero(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateVideoHer;

    this.playButtons && this.playButtons.forEach(function (button) {
      return button.unload();
    });
    this.videoHandler && this.videoHandler();
    (_this$animateVideoHer = this.animateVideoHero) === null || _this$animateVideoHer === void 0 ? void 0 : _this$animateVideoHer.destroy();
  }
});

var selectors$c = {
  dots: ".navigation-dot"
};

var navigationDots = function navigationDots(container) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var navigationDots = t$3(selectors$c.dots, container);
  var events = [];
  navigationDots.forEach(function (dot) {
    events.push(e$3(dot, "click", function (e) {
      return _handleDotClick(e);
    }));
  });

  var _handleDotClick = function _handleDotClick(e) {
    e.preventDefault();
    if (e.target.classList.contains("is-selected")) return;

    if (options.onSelect) {
      var index = parseInt(e.target.dataset.index, 10);
      options.onSelect(index);
    }
  };

  var update = function update(dotIndex) {
    if (typeof dotIndex !== "number") {
      console.debug("navigationDots#update: invalid index, ensure int is passed");
      return;
    }

    var activeClass = "is-selected";
    navigationDots.forEach(function (dot) {
      return i$1(dot, activeClass);
    });
    u$1(navigationDots[dotIndex], activeClass);
  };

  var unload = function unload() {
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  };

  return {
    update: update,
    unload: unload
  };
};

var selectors$b = {
  slider: "[data-slider]",
  slide: "[data-slide]",
  logoNavButton: "[logo-nav-button]"
};
register("quote", {
  onLoad: function onLoad() {
    var _this = this;

    var sliderContainer = n$2(selectors$b.slider, this.container);
    var slides = t$3(selectors$b.slide, this.container);

    if (shouldAnimate(this.container)) {
      slides.forEach(function (slide) {
        return animateQuotes(slide);
      });
      this.observer = intersectionWatcher(this.container);
    }

    if (slides.length < 2) {
      if (slides.length) u$1(slides[0], "swiper-slide-visible");
      return null;
    }

    var paginationStyle = sliderContainer.dataset.paginationStyle;
    var autoplayEnabled = sliderContainer.dataset.autoplayEnabled == "true";
    var autoplayDelay = parseInt(sliderContainer.dataset.autoplayDelay, 10);
    this.events = [];
    import(flu.chunks.swiper).then(function (_ref) {
      var Swiper = _ref.Swiper,
          Autoplay = _ref.Autoplay,
          Navigation = _ref.Navigation,
          EffectFade = _ref.EffectFade;
      _this.swiper = new Swiper(sliderContainer, {
        modules: [Navigation, Autoplay, EffectFade],
        grabCursor: true,
        effect: "fade",
        fadeEffect: {
          crossFade: true
        },
        loop: true,
        autoplay: autoplayEnabled ? {
          delay: autoplayDelay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        } : false,
        navigation: {
          nextEl: ".slider-nav-button-next",
          prevEl: ".slider-nav-button-prev"
        }
      });

      if (paginationStyle === "dots") {
        _this.dotNavigation = navigationDots(_this.container, {
          onSelect: function onSelect(dotIndex) {
            _this.swiper.slideToLoop(dotIndex);
          }
        });
      } else if (paginationStyle === "logos") {
        _this.logoNavButtons = t$3(selectors$b.logoNavButton, _this.container);
        u$1(_this.logoNavButtons[0], "active");

        _this.logoNavButtons.forEach(function (button) {
          _this.events.push(e$3(button, "click", function (e) {
            var index = parseInt(e.currentTarget.dataset.index, 10);

            _this.swiper.slideToLoop(index);
          }));
        });
      }

      _this.swiper.on("slideChange", function () {
        var index = _this.swiper.realIndex;

        if (paginationStyle === "dots") {
          _this.dotNavigation.update(index);
        } else if (paginationStyle === "logos") {
          var activeClass = "active";

          _this.logoNavButtons.forEach(function (button) {
            return i$1(button, activeClass);
          });

          u$1(_this.logoNavButtons[index], activeClass);
        }
      });
    });
  },
  onBlockSelect: function onBlockSelect(_ref2) {
    var _this$swiper, _this$swiper$autoplay, _this$swiper2;

    var slide = _ref2.target;
    var index = parseInt(slide.dataset.index, 10);
    (_this$swiper = this.swiper) === null || _this$swiper === void 0 ? void 0 : (_this$swiper$autoplay = _this$swiper.autoplay) === null || _this$swiper$autoplay === void 0 ? void 0 : _this$swiper$autoplay.stop();
    (_this$swiper2 = this.swiper) === null || _this$swiper2 === void 0 ? void 0 : _this$swiper2.slideToLoop(index);
  },
  onBlockDeselect: function onBlockDeselect() {
    var _this$swiper3, _this$swiper3$autopla;

    (_this$swiper3 = this.swiper) === null || _this$swiper3 === void 0 ? void 0 : (_this$swiper3$autopla = _this$swiper3.autoplay) === null || _this$swiper3$autopla === void 0 ? void 0 : _this$swiper3$autopla.start();
  },
  onUnload: function onUnload() {
    var _this$swiper4, _this$dotNavigation, _this$observer;

    (_this$swiper4 = this.swiper) === null || _this$swiper4 === void 0 ? void 0 : _this$swiper4.destroy();
    (_this$dotNavigation = this.dotNavigation) === null || _this$dotNavigation === void 0 ? void 0 : _this$dotNavigation.unload();
    this.events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    (_this$observer = this.observer) === null || _this$observer === void 0 ? void 0 : _this$observer.destroy();
  }
});

var selectors$a = {
  hotspotWrappers: ".shoppable-item",
  hotspots: ".shoppable-item__hotspot",
  productCard: ".shoppable-item__product-card",
  closeButtons: "[data-shoppable-item-close]",
  mobileDrawer: ".shoppable-feature-mobile-drawer",
  desktopSliderContainer: ".shoppable-feature__secondary-content",
  slider: ".swiper",
  slide: ".swiper-slide",
  sliderPagination: ".swiper-pagination",
  sliderImages: ".product-card-mini__image img",
  imageContainer: ".shoppable__image-container",
  sliderNavPrev: ".slider-nav-button-prev",
  sliderNavNext: ".slider-nav-button-next",
  drawerBackground: ".mobile-drawer__overlay",
  drawerCloseButton: ".mobile-drawer__close",
  quickViewTrigger: "[data-quick-view-trigger]",
  wash: "[data-shoppable-wash]"
};
var classes$5 = {
  animating: "shoppable-item--animating",
  unset: "shoppable-item--position-unset",
  hidden: "hidden",
  active: "active",
  drawerActive: "active",
  pulse: "shoppable-item__hotspot--pulse"
};
var sliderTypes = {
  Desktop: "desktop",
  Mobile: "mobile"
};
register("shoppable", {
  onLoad: function onLoad() {
    var _this2 = this;

    this.imageContainer = n$2(selectors$a.imageContainer, this.container);
    this.showHotspotCards = this.container.dataset.showHotspotCards === "true";
    this.hasCarousel = this.container.dataset.hasCarousel === "true";
    this.productCards = t$3(selectors$a.productCard, this.container);
    this.hotspotContainers = t$3(selectors$a.hotspotWrappers, this.container);
    this.hotspots = t$3(selectors$a.hotspots, this.container);
    this.wash = n$2(selectors$a.wash, this.container);
    var closeButtons = t$3(selectors$a.closeButtons, this.container); // Self terminating mouseenter events

    this.hotspotEvents = this.hotspots.map(function (hotspot) {
      return {
        element: hotspot,
        event: e$3(hotspot, "mouseenter", function (e) {
          i$1(e.currentTarget.parentNode, classes$5.animating);

          _this2.hotspotEvents.find(function (o) {
            return o.element === hotspot;
          }).event();
        })
      };
    });
    this.events = [e$3(this.hotspots, "click", function (e) {
      return _this2._hotspotClickHandler(e);
    }), e$3(closeButtons, "click", function () {
      return _this2._closeAll();
    }), e$3(this.container, "keydown", function (_ref) {
      var keyCode = _ref.keyCode;
      if (keyCode === 27) _this2._closeAll();
    }), e$3(t$3(selectors$a.quickViewTrigger, this.container), "click", function (e) {
      var productUrl = e.target.dataset.productUrl;
      if (!productUrl) return;
      r$2("quick-view:open", null, {
        productUrl: productUrl
      });

      if (window.matchMedia(getMediaQuery("below-960")).matches) {
        _this2._closeDrawer();
      }
    })];
    this.breakPointHandler = atBreakpointChange(960, function () {
      _this2._closeAll();
    });

    if (this.hasCarousel) {
      this._setupDrawer();

      this._createOrRecreateSlider();

      this.mobileDrawer = n$2(selectors$a.mobileDrawer, this.container);
      this.widthWatcher = srraf(function (_ref2) {
        var vw = _ref2.vw,
            pvw = _ref2.pvw;
        var wasAboveBreakpoint = pvw >= 960,
            isAboveBreakpoint = vw >= 960;

        if (wasAboveBreakpoint !== isAboveBreakpoint) {
          _this2._createOrRecreateSlider();
        }
      });

      if (shouldAnimate(this.container)) {
        this.animateShoppableFeature = animateShoppableFeature(this.container);
      }
    } else {
      this.events.push(e$3(document, "click", function (e) {
        return _this2._clickOutsideHandler(e);
      }));
    }

    if (this.showHotspotCards) {
      // Show the first hotspot as active if showing as card and above drawer
      // showing screen width
      if (window.matchMedia(getMediaQuery("above-960")).matches && this.hotspots.length) {
        this._activateHotspot(0);
      } // Predefine product card dimensions


      this.productCards.forEach(function (card) {
        return _this2._setCardDemensions(card);
      });

      if (shouldAnimate(this.container)) {
        this.animateShoppableImage = animateShoppableImage(this.container);
      }
    }

    this._initPulseLoop();
  },
  _initPulseLoop: function _initPulseLoop() {
    var hotspots = t$3(selectors$a.hotspots, this.container);
    var pulseIndex = 0;
    this.pulseInterval = setInterval(function () {
      i$1(hotspots, classes$5.pulse);
      setTimeout(function () {
        u$1(hotspots[pulseIndex], classes$5.pulse);
        pulseIndex++;

        if (pulseIndex >= hotspots.length) {
          pulseIndex = 0;
        }
      }, 0);
    }, 3000);
  },
  _pulseLoop: function _pulseLoop() {},
  _createOrRecreateSlider: function _createOrRecreateSlider() {
    var _this3 = this;

    // This creates or recreates either a mobile or desktop slider as necessary
    var sliderType = window.matchMedia(getMediaQuery("above-960")).matches ? sliderTypes.Desktop : sliderTypes.Mobile;

    if (this.sliderType !== sliderType) {
      var _this$swiper;

      this.sliderType = sliderType;
      (_this$swiper = this.swiper) === null || _this$swiper === void 0 ? void 0 : _this$swiper.destroy();
      this.sliderInitalized = false;
      var sliderContainerSelector = sliderType === sliderTypes.Desktop ? selectors$a.desktopSliderContainer : selectors$a.mobileDrawer;
      this.sliderContainer = n$2(sliderContainerSelector, this.container);
      this.slider = n$2(selectors$a.slider, this.sliderContainer);
      this.slides = t$3(selectors$a.slide, this.sliderContainer);
      this.sliderPagination = n$2(selectors$a.sliderPagination, this.sliderContainer);
      this.sliderNavNext = n$2(selectors$a.sliderNavNext, this.sliderContainer);
      this.sliderNavPrev = n$2(selectors$a.sliderNavPrev, this.sliderContainer);
      this.sliderImages = t$3(selectors$a.sliderImages, this.sliderContainer);

      if (this.slides.length < 2) {
        return;
      }

      var _this = this;

      import(flu.chunks.swiper).then(function (_ref3) {
        var Swiper = _ref3.Swiper,
            Navigation = _ref3.Navigation,
            Pagination = _ref3.Pagination;
        _this3.swiper = new Swiper(_this3.slider, {
          modules: [Navigation, Pagination],
          grabCursor: window.matchMedia(getMediaQuery("below-960")).matches,
          slidesPerView: 1,
          watchSlidesProgress: true,
          loop: true,
          navigation: {
            nextEl: _this3.sliderNavNext,
            prevEl: _this3.sliderNavPrev
          },
          pagination: {
            el: _this3.sliderPagination,
            type: "fraction"
          },
          on: {
            sliderFirstMove: function sliderFirstMove() {
              _this.sliderHasBeenInteractedWith = true;
            },
            activeIndexChange: function activeIndexChange(swiper) {
              var index = swiper.realIndex;
              _this.sliderInitalized && _this._indicateActiveHotspot(index);
            },
            afterInit: function afterInit() {
              var _this$sliderImages;

              _this.sliderInitalized = true;
              (_this$sliderImages = _this.sliderImages) === null || _this$sliderImages === void 0 ? void 0 : _this$sliderImages.forEach(function (image) {
                return image.setAttribute("loading", "eager");
              });

              if (_this.sliderType !== sliderTypes.Mobile) {
                _this._indicateActiveHotspot(0);
              }
            },
            slideChangeTransitionEnd: function slideChangeTransitionEnd() {
              var slideEls = this.slides;
              setTimeout(function () {
                slideEls.forEach(function (slide) {
                  slide.toggleAttribute("inert", !slide.classList.contains("swiper-slide-active"));
                });
              }, 50);
            }
          }
        });
      });
    }
  },
  _indicateActiveHotspot: function _indicateActiveHotspot(index) {
    this.hotspotContainers.forEach(function (spot) {
      return i$1(spot, classes$5.active);
    });
    var dotWrapper = n$2(".shoppable-item[data-index='".concat(index, "']"), this.container);
    u$1(dotWrapper, classes$5.active);
  },
  _activateHotspot: function _activateHotspot(index) {
    var wrapper = n$2(".shoppable-item[data-index='".concat(index, "']"), this.container);
    var card = n$2(selectors$a.productCard, wrapper);
    n$2(selectors$a.hotspots, wrapper);

    if (!card) {
      if (this.swiper) {
        var isMobileSwiper = this.sliderType === sliderTypes.Mobile;
        this.swiper.slideToLoop(index, isMobileSwiper ? 0 : undefined);

        if (isMobileSwiper) {
          this._openDrawer();
        }
      }

      return;
    }

    if (a$1(card, "hidden")) {
      this._closeAll();

      card.setAttribute("aria-hidden", false);

      this._setCardDemensions(card);

      i$1(card, classes$5.hidden); // When a slider is involved, updating the slider's active
      // slide will then trigger an update on the hotspot, but
      // when there is no slider involved we will do that directly

      if (!this.swiper) {
        this._indicateActiveHotspot(index);
      }

      if (window.matchMedia(getMediaQuery("below-960")).matches) {
        this._showWash();
      }
    } else {
      card.setAttribute("aria-hidden", true);
      u$1(card, classes$5.hidden);
      i$1(wrapper, classes$5.active);
    }
  },
  _setCardDemensions: function _setCardDemensions(card) {
    var cardHeight = card.offsetHeight;
    var cardWidth = card.offsetWidth;
    card.style.setProperty("--card-height", cardHeight + "px");
    card.style.setProperty("--card-width", cardWidth + "px");
  },
  _setupDrawer: function _setupDrawer() {
    var _this4 = this;

    // TODO: should this and open/close drawer functions be moved to their own file?
    var drawerBackground = n$2(selectors$a.drawerBackground, this.container);
    var drawerCloseButton = n$2(selectors$a.drawerCloseButton, this.container);
    this.events.push(e$3(drawerBackground, "click", function () {
      return _this4._closeDrawer();
    }));
    this.events.push(e$3(drawerCloseButton, "click", function () {
      return _this4._closeDrawer();
    }));
  },
  _openDrawer: function _openDrawer() {
    u$1(this.mobileDrawer, classes$5.drawerActive);
    disableBodyScroll(this.mobileDrawer);

    this._showWash();
  },
  _showWash: function _showWash() {
    u$1(this.wash, classes$5.active);
  },
  _closeDrawer: function _closeDrawer() {
    if (this.mobileDrawer) {
      i$1(this.mobileDrawer, classes$5.drawerActive);
      enableBodyScroll(this.mobileDrawer);
    }

    this._closeAll();
  },
  _hotspotClickHandler: function _hotspotClickHandler(e) {
    var wrapper = e.currentTarget.parentNode.parentNode;
    var hotspotIndex = parseInt(wrapper.dataset.index, 10);

    this._activateHotspot(hotspotIndex);
  },
  _clickOutsideHandler: function _clickOutsideHandler(e) {
    if (!e.target.closest(selectors$a.productCard) && !a$1(e.target, "shoppable-item__hotspot")) {
      this._closeAll();
    }
  },
  _closeAll: function _closeAll() {
    this.productCards.forEach(function (card) {
      u$1(card, classes$5.hidden);
      card.setAttribute("aria-hidden", true);
    });
    this.hotspotContainers.forEach(function (spot) {
      return i$1(spot, classes$5.active);
    });
    i$1(this.wash, classes$5.active);
  },
  onBlockDeselect: function onBlockDeselect() {
    this._closeAll();
  },
  onBlockSelect: function onBlockSelect(_ref4) {
    var el = _ref4.target;
    var index = parseInt(el.dataset.index, 10);

    if (this.swiper) {
      this.swiper.slideToLoop(index);
    } else {
      this._activateHotspot(index);
    }
  },
  onUnload: function onUnload() {
    var _this$swiper2, _this$widthWatcher, _this$animateShoppabl, _this$animateShoppabl2;

    (_this$swiper2 = this.swiper) === null || _this$swiper2 === void 0 ? void 0 : _this$swiper2.destroy();
    (_this$widthWatcher = this.widthWatcher) === null || _this$widthWatcher === void 0 ? void 0 : _this$widthWatcher.destroy();
    this.events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    (_this$animateShoppabl = this.animateShoppableImage) === null || _this$animateShoppabl === void 0 ? void 0 : _this$animateShoppabl.destroy();
    (_this$animateShoppabl2 = this.animateShoppableFeature) === null || _this$animateShoppabl2 === void 0 ? void 0 : _this$animateShoppabl2.destroy();
    this.pulseInterval && clearInterval(this.pulseInterval);
  }
});

var selectors$9 = {
  video: "video",
  quickViewTrigger: "[data-quick-view-trigger]"
};
register("complete-the-look", {
  videoHandler: null,
  onLoad: function onLoad() {
    var video = n$2(selectors$9.video, this.container);

    if (video) {
      this.videoHandler = backgroundVideoHandler(this.container);
    }

    this.events = [e$3(t$3(selectors$9.quickViewTrigger, this.container), "click", function (e) {
      var productUrl = e.target.dataset.productUrl;
      if (!productUrl) return;
      r$2("quick-view:open", null, {
        productUrl: productUrl
      });
    })];

    if (shouldAnimate(this.container)) {
      this.animateCompleteTheLook = animateCompleteTheLook(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateComplete;

    this.videoHandler && this.videoHandler();
    this.events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    (_this$animateComplete = this.animateCompleteTheLook) === null || _this$animateComplete === void 0 ? void 0 : _this$animateComplete.destroy();
  }
});

var selectors$8 = {
  playButtonVideo: "[data-play-button-block-video]",
  playButtonBlock: ".play-button-block"
};
register("rich-text", {
  onLoad: function onLoad() {
    var playButtonVideos = t$3(selectors$8.playButtonVideo, this.container);

    if (playButtonVideos.length) {
      this.playButtons = playButtonVideos.map(function (block) {
        return playButton(block.closest(selectors$8.playButtonBlock));
      });
    }

    if (shouldAnimate(this.container)) {
      this.animateRichText = animateRichText(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateRichText;

    this.playButtons && this.playButtons.forEach(function (button) {
      return button.unload();
    });
    (_this$animateRichText = this.animateRichText) === null || _this$animateRichText === void 0 ? void 0 : _this$animateRichText.destroy();
  }
});

var selectors$7 = {
  playButtonVideo: "[data-play-button-block-video]",
  playButtonBlock: ".play-button-block"
};
register("image-with-text", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateImageWithText = animateImageWithText(this.container);
    }

    var playButtonVideos = t$3(selectors$7.playButtonVideo, this.container);

    if (playButtonVideos.length) {
      this.playButtons = playButtonVideos.map(function (block) {
        return playButton(block.closest(selectors$7.playButtonBlock));
      });
    }
  },
  onUnload: function onUnload() {
    var _this$animateImageWit;

    (_this$animateImageWit = this.animateImageWithText) === null || _this$animateImageWit === void 0 ? void 0 : _this$animateImageWit.destroy();
    this.playButtons && this.playButtons.forEach(function (button) {
      return button.unload();
    });
  }
});

var selectors$6 = {
  playButtonVideo: "[data-play-button-block-video]",
  playButtonBlock: ".play-button-block"
};
register("image-with-text-split", {
  onLoad: function onLoad() {
    var playButtonVideos = t$3(selectors$6.playButtonVideo, this.container);

    if (playButtonVideos.length) {
      this.playButtons = playButtonVideos.map(function (block) {
        return playButton(block.closest(selectors$6.playButtonBlock));
      });
    }

    if (shouldAnimate(this.container)) {
      this.animateImageWithTextSplit = animateImageWithTextSplit(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateImageWit;

    this.playButtons && this.playButtons.forEach(function (button) {
      return button.unload();
    });
    (_this$animateImageWit = this.animateImageWithTextSplit) === null || _this$animateImageWit === void 0 ? void 0 : _this$animateImageWit.destroy();
  }
});

var selectors$5 = {
  playButtonVideo: "[data-play-button-block-video]",
  playButtonBlock: ".play-button-block"
};
register("image-hero", {
  onLoad: function onLoad() {
    var playButtonVideos = t$3(selectors$5.playButtonVideo, this.container);

    if (playButtonVideos.length) {
      this.playButtons = playButtonVideos.map(function (block) {
        return playButton(block.closest(selectors$5.playButtonBlock));
      });
    }

    if (shouldAnimate(this.container)) {
      this.animateImageHero = animateImageHero(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateImageHer;

    this.playButtons && this.playButtons.forEach(function (button) {
      return button.unload();
    });
    (_this$animateImageHer = this.animateImageHero) === null || _this$animateImageHer === void 0 ? void 0 : _this$animateImageHer.destroy();
  }
});

register("image-hero-split", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      // Setup animations per item
      t$3(".animation--item", this.container).forEach(function (item) {
        return animateImageHeroSplit(item);
      });
    }

    this.observer = intersectionWatcher(this.container);
  },
  onUnload: function onUnload() {
    var _this$observer;

    this.playButtons && this.playButtons.forEach(function (button) {
      return button.unload();
    });
    (_this$observer = this.observer) === null || _this$observer === void 0 ? void 0 : _this$observer.destroy();
  }
});

var selectors$4 = {
  item: ".testimonials__item",
  swiper: ".swiper",
  navigationNext: ".testimonials__navigation-button--next",
  navigationPrev: ".testimonials__navigation-button--prev",
  productImage: ".testimonials__item-product-image"
};
register("testimonials", {
  events: [],
  onLoad: function onLoad() {
    var _this = this;

    this.items = t$3(selectors$4.item, this.container);
    this.itemsContainer = n$2(selectors$4.swiper, this.container);

    if (shouldAnimate(this.container)) {
      this.itemAnimations = this.items.map(function (item) {
        return animateTestimonials(item);
      });
      this.observer = intersectionWatcher(this.container);
    }

    if (this.items.length > 1) {
      import(flu.chunks.swiper).then(function (_ref) {
        var Swiper = _ref.Swiper,
            Navigation = _ref.Navigation,
            EffectFade = _ref.EffectFade;
        var swiperOptions = {
          modules: [Navigation, EffectFade],
          autoHeight: true,
          slidesPerView: 1,
          effect: "fade",
          loop: true,
          fadeEffect: {
            crossFade: true
          },
          grabCursor: true,
          navigation: {
            nextEl: selectors$4.navigationNext,
            prevEl: selectors$4.navigationPrev
          },
          breakpoints: {
            720: {
              spaceBetween: 42
            }
          },
          on: {
            slideChangeTransitionEnd: function slideChangeTransitionEnd() {
              var slideEls = this.slides;
              setTimeout(function () {
                slideEls.forEach(function (slide) {
                  slide.toggleAttribute("inert", !slide.classList.contains("swiper-slide-active"));
                });
              }, 50);
            }
          }
        }; // We use fade for desktop size animatiosn and slide for under
        // 720px

        if (window.matchMedia(getMediaQuery("below-720")).matches) {
          swiperOptions.effect = "slide";
          swiperOptions.slidesPerView = "auto";
        }

        _this.carousel = new Swiper(_this.itemsContainer, swiperOptions);

        _this.setMobileButtonOffset();

        r$2("testimonials:initialized");
      });
    } else if (this.items.length === 1) {
      u$1(this.items[0], "swiper-slide-visible");
    }
  },
  setMobileButtonOffset: function setMobileButtonOffset() {
    // Mobile paddles should vertically center on the image instead of the item
    var firstImage = n$2(selectors$4.productImage, this.container);
    var mobileButtonHeight = 34;
    var halfMobileButtonHeight = mobileButtonHeight / 2;
    var halfImageHeight = firstImage.offsetHeight / 2;
    var offset = halfImageHeight + halfMobileButtonHeight;
    this.container.style.setProperty("--mobile-button-offset", "".concat(offset, "px"));
  },
  handleBlockSelect: function handleBlockSelect(slideIndex) {
    this.carousel.slideToLoop(parseInt(slideIndex, 10));
  },
  onBlockSelect: function onBlockSelect(_ref2) {
    var _this2 = this;

    var target = _ref2.target;
    var index = target.dataset.index;

    if (this.carousel) {
      this.handleBlockSelect(index);
    } else {
      // Listen for initalization if carousel does not exist
      this.events.push(c("testimonials:initialized", function () {
        _this2.handleBlockSelect(index);
      }));
    }
  },
  onUnload: function onUnload() {
    var _this$observer;

    this.events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    (_this$observer = this.observer) === null || _this$observer === void 0 ? void 0 : _this$observer.destroy();
  }
});

register("sales-banner", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateSalesBanner = animateSalesBanner(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateSalesBan;

    (_this$animateSalesBan = this.animateSalesBanner) === null || _this$animateSalesBan === void 0 ? void 0 : _this$animateSalesBan.destroy();
  }
});

register("promotion-bar", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animatePromotionBar = animatePromotionBar(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animatePromotio;

    (_this$animatePromotio = this.animatePromotionBar) === null || _this$animatePromotio === void 0 ? void 0 : _this$animatePromotio.destroy();
  }
});

register("grid", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateGrid = animateGrid(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateGrid;

    (_this$animateGrid = this.animateGrid) === null || _this$animateGrid === void 0 ? void 0 : _this$animateGrid.destroy();
  }
});

register("collection-list-grid", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateCollectionListGrid = animateCollectionListGrid(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateCollecti;

    (_this$animateCollecti = this.animateCollectionListGrid) === null || _this$animateCollecti === void 0 ? void 0 : _this$animateCollecti.destroy();
  }
});

register("contact-form", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateContactForm = animateContactForm(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateContactF;

    (_this$animateContactF = this.animateContactForm) === null || _this$animateContactF === void 0 ? void 0 : _this$animateContactF.destroy();
  }
});

register("multi-column", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateMultiColumn = animateMultiColumn(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateMultiCol;

    (_this$animateMultiCol = this.animateMultiColumn) === null || _this$animateMultiCol === void 0 ? void 0 : _this$animateMultiCol.destroy();
  }
});

var selectors$3 = {
  cartError: ".cart__form-item-error",
  cartNoteTrigger: "[data-order-note-trigger]",
  cartUpdateButton: ".cart__update",
  quantityInput: ".cart .quantity-input__input",
  quantityItem: "[data-input-item]"
};
var classes$4 = {
  updatingQuantity: "has-quantity-update",
  removed: "is-removed"
};
register("cart", {
  onLoad: function onLoad() {
    var _this = this;

    var cartNoteTrigger = n$2(selectors$3.cartNoteTrigger, this.container);
    if (cartNoteTrigger) this.cartNoteToggle = CartNoteToggle(this.container);
    this.quantityButtons = QuantityButtons(this.container); // Events are all on events trigger by other components / functions

    this.events = [c("cart:updated", function () {
      return _this.refreshCart();
    }), c("cart:error", function (_, _ref) {
      var id = _ref.id,
          errorMessage = _ref.errorMessage;

      _this.handleErrorMessage(id, errorMessage);
    }), c(["quantity-update:subtract", "quantity-update:add"], function (_, _ref2) {
      var itemId = _ref2.itemId;

      _this.handleQuantityUpdate(itemId);
    }), c("quantity-update:remove", function (_, _ref3) {
      var itemId = _ref3.itemId;

      _this.handleItemRemoval(itemId);
    })]; // Delegate handles all click events due to rendering different content
    // within cart

    this.delegate = new Delegate(this.container);
    this.delegate.on("change", selectors$3.quantityInput, function (e) {
      return _this.handleQuantityInputChange(e);
    });
  },
  refreshCart: function refreshCart() {
    var _this2 = this;

    var url = "".concat(theme.routes.cart.base, "?section_id=main-cart");
    makeRequest("GET", url).then(function (response) {
      var _window$Shopify;

      var container = document.createElement("div");
      container.innerHTML = response;
      _this2.container.innerHTML = container.innerHTML;

      if ((_window$Shopify = window.Shopify) !== null && _window$Shopify !== void 0 && _window$Shopify.StorefrontExpressButtons) {
        window.Shopify.StorefrontExpressButtons.initialize();
      }
    });
  },
  handleErrorMessage: function handleErrorMessage(itemId) {
    var item = n$2("[data-id=\"".concat(itemId, "\"]"), this.container);
    i$1(n$2(selectors$3.cartError, item), "hidden");
    i$1(item, classes$4.updatingQuantity);
  },
  handleQuantityInputChange: function handleQuantityInputChange(_ref4) {
    var target = _ref4.target;
    var item = target.closest(selectors$3.quantityItem);
    var itemId = item.dataset.id;
    cart.updateItem(itemId, target.value);
    this.handleQuantityUpdate(itemId);
  },
  handleQuantityUpdate: function handleQuantityUpdate(itemId) {
    var item = n$2("[data-id=\"".concat(itemId, "\"]"), this.container);
    u$1(item, classes$4.updatingQuantity);
  },
  handleItemRemoval: function handleItemRemoval(itemId) {
    var item = n$2("[data-id=\"".concat(itemId, "\"]"), this.container);
    u$1(item, classes$4.removed);
    u$1(item, classes$4.updatingQuantity);
  },
  onUnload: function onUnload() {
    var _this$cartNoteToggle;

    this.events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    this.quantityButtons.unload();
    (_this$cartNoteToggle = this.cartNoteToggle) === null || _this$cartNoteToggle === void 0 ? void 0 : _this$cartNoteToggle.unload();
  }
});

register("product", {
  onLoad: function onLoad() {
    this.product = new Product(this.container);
    this.animateProduct = animateProduct(this.container);
  },
  onBlockSelect: function onBlockSelect(_ref) {
    var target = _ref.target;
    var label = n$2(".accordion__label", target);
    target.scrollIntoView({
      block: "center",
      behavior: "smooth"
    });
    if (!label) return;
    var group = label.parentNode,
        content = label.nextElementSibling;
    slideStop(content);
    slideDown(content);
    group.setAttribute("data-open", true);
    label.setAttribute("aria-expanded", true);
    content.setAttribute("aria-hidden", false);
  },
  onBlockDeselect: function onBlockDeselect(_ref2) {
    var target = _ref2.target;
    var label = n$2(".accordion__label", target);
    if (!label) return;
    var group = label.parentNode,
        content = label.nextElementSibling;
    slideStop(content);
    slideUp(content);
    group.setAttribute("data-open", false);
    label.setAttribute("aria-expanded", false);
    content.setAttribute("aria-hidden", true);
  },
  onUnload: function onUnload() {
    var _this$animateProduct;

    this.product.unload();
    (_this$animateProduct = this.animateProduct) === null || _this$animateProduct === void 0 ? void 0 : _this$animateProduct.destroy();
  }
});

/* @preserve
 * https://github.com/Elkfox/Ajaxinate
 * Copyright (c) 2017 Elkfox Co Pty Ltd (elkfox.com)
 * MIT License (do not remove above copyright!)
 */

/* Configurable options;
 *
 * method: scroll or click
 * container: selector of repeating content
 * pagination: selector of pagination container
 * offset: number of pixels before the bottom to start loading more on scroll
 * loadingText: 'Loading', The text shown during when appending new content
 * callback: null, callback function after new content is appended
 *
 * Usage;
 *
 * import {Ajaxinate} from 'ajaxinate';
 *
 * new Ajaxinate({
 *   offset: 5000,
 *   loadingText: 'Loading more...',
 * });
 */

/* eslint-env browser */
function Ajaxinate(config) {
  const settings = config || {};

  const defaults = {
    method: "scroll",
    container: "#AjaxinateContainer",
    pagination: "#AjaxinatePagination",
    offset: 0,
    loadingText: "Loading",
    callback: null,
  };

  // Merge custom configs with defaults
  this.settings = Object.assign(defaults, settings);

  // Functions
  this.addScrollListeners = this.addScrollListeners.bind(this);
  this.addClickListener = this.addClickListener.bind(this);
  this.checkIfPaginationInView = this.checkIfPaginationInView.bind(this);
  this.preventMultipleClicks = this.preventMultipleClicks.bind(this);
  this.removeClickListener = this.removeClickListener.bind(this);
  this.removeScrollListener = this.removeScrollListener.bind(this);
  this.removePaginationElement = this.removePaginationElement.bind(this);
  this.destroy = this.destroy.bind(this);

  // Selectors
  this.containerElement = document.querySelector(this.settings.container);
  this.paginationElement = document.querySelector(this.settings.pagination);
  this.initialize();
}

Ajaxinate.prototype.initialize = function initialize() {
  if (!this.containerElement) {
    return;
  }

  const initializers = {
    click: this.addClickListener,
    scroll: this.addScrollListeners,
  };

  initializers[this.settings.method]();
};

Ajaxinate.prototype.addScrollListeners = function addScrollListeners() {
  if (!this.paginationElement) {
    return;
  }

  document.addEventListener("scroll", this.checkIfPaginationInView);
  window.addEventListener("resize", this.checkIfPaginationInView);
  window.addEventListener("orientationchange", this.checkIfPaginationInView);
};

Ajaxinate.prototype.addClickListener = function addClickListener() {
  if (!this.paginationElement) {
    return;
  }

  this.nextPageLinkElement = this.paginationElement.querySelector("a");
  this.clickActive = true;

  if (
    typeof this.nextPageLinkElement !== "undefined" &&
    this.nextPageLinkElement !== null
  ) {
    this.nextPageLinkElement.addEventListener(
      "click",
      this.preventMultipleClicks
    );
  }
};

Ajaxinate.prototype.preventMultipleClicks = function preventMultipleClicks(
  event
) {
  event.preventDefault();

  if (!this.clickActive) {
    return;
  }

  this.nextPageLinkElement.innerText = this.settings.loadingText;
  this.nextPageUrl = this.nextPageLinkElement.href;
  this.clickActive = false;

  this.loadMore();
};

Ajaxinate.prototype.checkIfPaginationInView = function checkIfPaginationInView() {
  const top =
    this.paginationElement.getBoundingClientRect().top - this.settings.offset;
  const bottom =
    this.paginationElement.getBoundingClientRect().bottom +
    this.settings.offset;

  if (top <= window.innerHeight && bottom >= 0) {
    this.nextPageLinkElement = this.paginationElement.querySelector("a");
    this.removeScrollListener();

    if (this.nextPageLinkElement) {
      this.nextPageLinkElement.innerText = this.settings.loadingText;
      this.nextPageUrl = this.nextPageLinkElement.href;

      this.loadMore();
    }
  }
};

Ajaxinate.prototype.loadMore = function getTheHtmlOfTheNextPageWithAnAjaxRequest() {
  this.request = new XMLHttpRequest();
  this.request.onreadystatechange = function success() {
    if (this.request.readyState === 4 && this.request.status === 200) {
      var parser = new DOMParser();
      var htmlDoc = parser.parseFromString(
        this.request.responseText,
        "text/html"
      );
      var newContainer = htmlDoc.querySelectorAll(this.settings.container)[0];
      var newPagination = htmlDoc.querySelectorAll(this.settings.pagination)[0];
      this.containerElement.insertAdjacentHTML(
        "beforeend",
        newContainer.innerHTML
      );
      this.paginationElement.innerHTML = newPagination.innerHTML;
      if (
        this.settings.callback &&
        typeof this.settings.callback === "function"
      ) {
        this.settings.callback(this.request.responseXML);
      }
      this.initialize();
    }
  }.bind(this);
  this.request.open("GET", this.nextPageUrl, false);
  this.request.send();
};

Ajaxinate.prototype.removeClickListener = function removeClickListener() {
  this.nextPageLinkElement.removeEventListener(
    "click",
    this.preventMultipleClicks
  );
};

Ajaxinate.prototype.removePaginationElement = function removePaginationElement() {
  this.paginationElement.innerHTML = "";
  this.destroy();
};

Ajaxinate.prototype.removeScrollListener = function removeScrollListener() {
  document.removeEventListener("scroll", this.checkIfPaginationInView);
  window.removeEventListener("resize", this.checkIfPaginationInView);
  window.removeEventListener("orientationchange", this.checkIfPaginationInView);
};

Ajaxinate.prototype.destroy = function destroy() {
  const destroyers = {
    click: this.removeClickListener,
    scroll: this.removeScrollListener,
  };

  destroyers[this.settings.method]();

  return this;
};

var filtering = function filtering(container) {
  var forms = t$3("[data-filter-form]", container);
  var formData, searchParams;
  setParams();

  function setParams(form) {
    form = form || forms[0];
    formData = new FormData(form);
    searchParams = new URLSearchParams(formData).toString();
  }
  /**
   * Takes the updated form element and updates all other forms with the updated values
   * @param {*} target
   */


  function syncForms(target) {
    if (!target) return;
    var targetInputs = t$3("[data-filter-item-input]", target);
    targetInputs.forEach(function (targetInput) {
      if (targetInput.type === "checkbox" || targetInput.type === "radio") {
        var valueEscaped = targetInput.dataset.valueEscaped;
        var items = t$3("input[name='".concat(targetInput.name, "'][data-value-escaped='").concat(valueEscaped, "']"));
        items.forEach(function (input) {
          input.checked = targetInput.checked;
        });
      } else {
        var _items = t$3("input[name='".concat(targetInput.name, "']"));

        _items.forEach(function (input) {
          input.value = targetInput.value;
        });
      }
    });
  }
  /**
   * When filters are removed, set the checked attribute to false
   * for all filter inputs for that filter.
   * Can accept multiple filters
   * @param {Array} targets Array of inputs
   */


  function uncheckFilters(targets) {
    if (!targets) return;
    var selector;
    targets.forEach(function (target) {
      selector = !selector ? "" : ", ".concat(selector);
      var _target$dataset = target.dataset,
          name = _target$dataset.name,
          valueEscaped = _target$dataset.valueEscaped;
      selector = "input[name='".concat(name, "'][data-value-escaped='").concat(valueEscaped, "']").concat(selector);
    });
    var inputs = t$3(selector, container);
    inputs.forEach(function (input) {
      input.checked = false;
    });
  }

  function clearRangeInputs() {
    var rangeInputs = t$3("[data-range-input]", container);
    rangeInputs.forEach(function (input) {
      input.value = "";
    });
  }

  function resetForms() {
    forms.forEach(function (form) {
      form.reset();
    });
  }

  return {
    getState: function getState() {
      return {
        url: searchParams
      };
    },
    filtersUpdated: function filtersUpdated(target, cb) {
      syncForms(target);
      setParams(target);
      r$2("filters:updated");
      return cb(this.getState());
    },
    removeFilters: function removeFilters(target, cb) {
      uncheckFilters(target);
      setParams();
      r$2("filters:filter-removed");
      return cb(this.getState());
    },
    removeRange: function removeRange(cb) {
      clearRangeInputs();
      setParams();
      return cb(this.getState());
    },
    clearAll: function clearAll(cb) {
      searchParams = "";
      resetForms();
      return cb(this.getState());
    }
  };
};

var FILTERS_REMOVE = "collection:filters:remove";
var RANGE_REMOVE = "collection:range:remove";
var EVERYTHING_CLEAR = "collection:clear";
var FILTERS_UPDATE = "collection:filters:update";
var updateFilters = function updateFilters(target) {
  return r$2(FILTERS_UPDATE, null, {
    target: target
  });
};
var removeFilters = function removeFilters(target) {
  return r$2(FILTERS_REMOVE, null, {
    target: target
  });
};
var filtersUpdated = function filtersUpdated(cb) {
  return c(FILTERS_UPDATE, cb);
};
var filtersRemoved = function filtersRemoved(cb) {
  return c(FILTERS_REMOVE, cb);
};
var everythingCleared = function everythingCleared(cb) {
  return c(EVERYTHING_CLEAR, cb);
};
var rangeRemoved = function rangeRemoved(cb) {
  return c(RANGE_REMOVE, cb);
};

var filterHandler = function filterHandler(_ref) {
  var container = _ref.container,
      renderCB = _ref.renderCB;
  var subscriptions = null;
  var filters = null;
  var delegate = null;
  filters = filtering(container); // Set initial evx state from collection url object

  o$1(filters.getState());
  subscriptions = [filtersRemoved(function (_, _ref2) {
    var target = _ref2.target;
    filters.removeFilters(target, function (data) {
      renderCB(data.url);
      o$1(data)();
    });
  }), rangeRemoved(function () {
    filters.removeRange(function (data) {
      renderCB(data.url);
      o$1(data)();
    });
  }), filtersUpdated(function (_, _ref3) {
    var target = _ref3.target;
    filters.filtersUpdated(target, function (data) {
      renderCB(data.url);
      o$1(data)();
    });
  }), everythingCleared(function () {
    filters.clearAll(function (data) {
      renderCB(data.url);
      o$1(data)();
    });
  })];
  delegate = new Delegate(container);
  delegate.on("click", "[data-remove-filter]", function (e) {
    e.preventDefault();
    removeFilters([e.target]);
  });
  window.addEventListener("popstate", onPopstate);

  function onPopstate() {
    var url = new URL(window.location);
    var searchParams = url.search.replace("?", "");
    renderCB(searchParams, false);
    o$1({
      url: searchParams
    });
  }

  var unload = function unload() {
    delegate && delegate.off();
    subscriptions && subscriptions.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    window.removeEventListener("popstate", onPopstate);
  };

  return {
    unload: unload
  };
};

var strings = window.theme.strings;

var priceRange = function priceRange(container) {
  var inputs = t$3("input", container);
  var minInput = inputs[0];
  var maxInput = inputs[1];
  var events = [e$3(inputs, "change", onRangeChange)];
  var slider = n$2("[data-range-slider]", container);
  var min = Math.floor(minInput.value ? minInput.value : minInput.getAttribute("min"));
  var max = Math.floor(maxInput.value ? maxInput.value : maxInput.getAttribute("max"));
  import(flu.chunks.nouislider).then(function (_ref) {
    var noUiSlider = _ref.noUiSlider;
    noUiSlider.create(slider, {
      start: [minInput.value ? minInput.value : minInput.getAttribute("min"), maxInput.value ? maxInput.value : maxInput.getAttribute("max")],
      handleAttributes: [{
        "aria-label": strings.accessibility.range_lower
      }, {
        "aria-label": strings.accessibility.range_upper
      }],
      connect: true,
      range: {
        "min": parseInt(minInput.getAttribute("min")),
        "max": parseInt(maxInput.getAttribute("max"))
      }
    });
    slider.noUiSlider.on("slide", function (e) {
      var maxNew, minNew;

      var _e = _slicedToArray(e, 2);

      minNew = _e[0];
      maxNew = _e[1];
      minInput.value = Math.floor(minNew);
      maxInput.value = Math.floor(maxNew);
      setMinAndMaxValues();
    });
    slider.noUiSlider.on("set", function (e) {
      var maxNew, minNew;
      minNew = Math.floor(e[0]);
      maxNew = Math.floor(e[1]);

      if (minNew != min) {
        minInput.value = minNew;
        fireMinChangeEvent();
        min = Math.floor(minInput.value ? minInput.value : minInput.getAttribute("min"));
      }

      if (maxNew != max) {
        maxInput.value = maxNew;
        fireMaxChangeEvent();
        max = Math.floor(maxInput.value ? maxInput.value : maxInput.getAttribute("max"));
      }

      setMinAndMaxValues();
    });
    setMinAndMaxValues();
  });

  function setMinAndMaxValues() {
    if (maxInput.value) minInput.setAttribute("max", maxInput.value);
    if (minInput.value) maxInput.setAttribute("min", minInput.value);
    if (minInput.value === "") maxInput.setAttribute("min", 0);
    if (maxInput.value === "") minInput.setAttribute("max", maxInput.getAttribute("max"));
  }

  function adjustToValidValues(input) {
    var value = Number(input.value);
    var minNew = Number(input.getAttribute("min"));
    var maxNew = Number(input.getAttribute("max"));
    if (value < minNew) input.value = minNew;
    if (value > maxNew) input.value = maxNew;
  }

  function fireMinChangeEvent() {
    minInput.dispatchEvent(new Event("change", {
      bubbles: true
    }));
  }

  function fireMaxChangeEvent() {
    maxInput.dispatchEvent(new Event("change", {
      bubbles: true
    }));
  }

  function onRangeChange(event) {
    adjustToValidValues(event.currentTarget);
    setMinAndMaxValues();
    if (minInput.value === "" && maxInput.value === "") return;
    var currentMax, currentMin;

    var _slider$noUiSlider$ge = slider.noUiSlider.get();

    var _slider$noUiSlider$ge2 = _slicedToArray(_slider$noUiSlider$ge, 2);

    currentMin = _slider$noUiSlider$ge2[0];
    currentMax = _slider$noUiSlider$ge2[1];
    currentMin = Math.floor(currentMin);
    currentMax = Math.floor(currentMax);
    if (currentMin !== Math.floor(minInput.value)) slider.noUiSlider.set([minInput.value, null]);
    if (currentMax !== Math.floor(maxInput.value)) slider.noUiSlider.set([null, maxInput.value]);
  }

  function validateRange() {
    inputs.forEach(function (input) {
      return setMinAndMaxValues();
    });
  }

  var reset = function reset() {
    slider.noUiSlider.set([minInput.getAttribute("min"), maxInput.getAttribute("max")], false);
    minInput.value = "";
    maxInput.value = "";
    min = Math.floor(minInput.getAttribute("min"));
    max = Math.floor(maxInput.getAttribute("max"));
    setMinAndMaxValues();
  };

  var unload = function unload() {
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    slider.noUiSlider.destroy();
  };

  return {
    unload: unload,
    reset: reset,
    validateRange: validateRange
  };
};

/**
 * Takes a selector and replaces the element with the new element found in the updated document
 * @param {*} selector The selector to target
 * @param {*} doc The updated document returned by the fetch request
 */

function replaceElement(selector, doc) {
  var updatedItem = n$2(selector, doc);
  var oldItem = n$2(selector);

  if (updatedItem && oldItem) {
    oldItem.parentElement.replaceChild(updatedItem, oldItem);
  }
}

var timer;
function debounce(func) {
  var time = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  return function (event) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(func, time, event);
  };
}

var sel$1 = {
  drawer: "[data-filter-drawer]",
  drawerTitle: "[data-filter-drawer-title]",
  filter: "[data-filter]",
  filterItem: "[data-filter-item]",
  filterTarget: "[data-filter-drawer-target]",
  flyouts: "[data-filter-modal]",
  button: "[data-button]",
  wash: "[data-drawer-wash]",
  sort: "[data-sort]",
  close: "[data-close-icon]",
  group: ".filter-drawer__group",
  groupToggle: "[data-drawer-group-toggle]",
  panel: ".filter-drawer__panel",
  flyoutWrapper: "[data-filer-modal-wrapper]",
  priceRange: "[data-price-range]",
  resultsCount: "[data-results-count]",
  activeFilters: "[data-active-filters]",
  activeFilterCount: "[data-active-filter-count]"
};
var classes$3 = {
  active: "active",
  activeFilters: "filters-active",
  fixed: "is-fixed",
  filterDisabled: "filter-item__content--disabled"
};

var filterDrawer = function filterDrawer(node) {
  if (!node) {
    return false;
  }

  var container = n$2(sel$1.drawer, node);

  if (!container) {
    return false;
  }

  var flyouts = t$3(sel$1.flyouts, container);
  var wash = n$2(sel$1.wash, container);
  var rangeInputs = t$3("[data-range-input]", container);
  var focusTrap = null;
  var range = null;
  var filterDrawerAnimation = null;

  if (shouldAnimate(node)) {
    filterDrawerAnimation = animateFilterDrawer(container);
  }

  var rangeContainer = n$2(sel$1.priceRange, container);

  if (rangeContainer) {
    range = priceRange(rangeContainer);
  }

  var events = [e$3(t$3(sel$1.filterTarget, node), "click", clickFlyoutTrigger), e$3(container, "change", changeHandler), e$3(wash, "click", clickWash), e$3(t$3("".concat(sel$1.button, ", ").concat(sel$1.clearAll), container), "click", clickButton), e$3(t$3(sel$1.close, container), "click", clickWash), e$3(container, "keydown", function (_ref) {
    var keyCode = _ref.keyCode;
    if (keyCode === 27) clickWash();
  }), e$3(rangeInputs, "change", rangeChanged), c("filters:filter-removed", function () {
    return syncActiveStates();
  })];

  function changeHandler(e) {
    if (e.target.classList.contains("filter-item__checkbox")) {
      filterChange(e.target);
    } else if (e.target.classList.contains("filter-item__radio")) {
      sortChange(e);
    }
  }

  function clickFlyoutTrigger(e) {
    e.preventDefault();
    var filterDrawerTarget = e.currentTarget.dataset.filterDrawerTarget;
    var modal = n$2("[data-filter-modal=\"".concat(filterDrawerTarget, "\"]"), container);
    focusTrap = createFocusTrap(modal, {
      allowOutsideClick: true
    });
    u$1(container, classes$3.fixed);
    setTimeout(function () {
      if (shouldAnimate(node)) {
        filterDrawerAnimation.open(modal);
      }

      u$1(container, classes$3.active);
      u$1(modal, classes$3.active);
    }, 0);
    modal.setAttribute("aria-hidden", "false");
    focusTrap.activate();
    disableBodyScroll(node, {
      allowTouchMove: function allowTouchMove(el) {
        while (el && el !== document.body) {
          if (el.getAttribute("data-scroll-lock-ignore") !== null) {
            return true;
          }

          el = el.parentNode;
        }
      },
      reserveScrollBarGap: true
    });
  }

  function clickWash(e) {
    e && e.preventDefault();
    focusTrap && focusTrap.deactivate();
    i$1(flyouts, classes$3.active);
    i$1(container, classes$3.active);
    flyouts.forEach(function (flyout) {
      return flyout.setAttribute("aria-hidden", "true");
    });
    enableBodyScroll(node);
    setTimeout(function () {
      i$1(container, classes$3.fixed);

      if (shouldAnimate(node)) {
        filterDrawerAnimation.close(flyouts);
      }
    }, 500);
  }

  function filterChange(filter) {
    if (filter.classList.contains(classes$3.filterDisabled)) {
      return;
    }

    checkForActiveModalitems(filter);
    range && range.validateRange();
    debounce(function () {
      return updateFilters(container);
    }, 1000)();
  }

  function sortChange(e) {
    checkForActiveModalitems(e.target);
    range && range.validateRange();
    updateFilters(container);
  }

  function rangeChanged(e) {
    checkForActiveModalitems(e.currentTarget);
    var wrappingContainer = e.target.closest(sel$1.group);
    wrappingContainer && l(wrappingContainer, classes$3.activeFilters, rangeInputsHaveValue());
    updateFilters(container);
  }

  function clickButton(e) {
    e.preventDefault();
    var button = e.currentTarget.dataset.button;
    var scope = e.currentTarget.closest(sel$1.flyouts);
    var filterModal = scope.dataset.filterModal;

    if (button === "close") {
      clickWash();
    } // Sort flyouts


    if (filterModal === "__sort") {
      if (button === "clear-all") {
        t$3("[data-filter-modal=\"__sort\"] ".concat(sel$1.sort), container).forEach(function (element) {
          n$2("input", element).checked = false;
        });
        i$1(e.currentTarget.closest(sel$1.panel), classes$3.activeFilters);
      }
    } else {
      // Regular filter flyout
      if (button === "clear-all") {
        t$3("input", scope).forEach(function (input) {
          input.checked = false;
        });
        var panel = e.currentTarget.closest(sel$1.panel);
        i$1([].concat(_toConsumableArray(t$3(sel$1.group, panel)), [panel]), classes$3.activeFilters);
        range && range.reset();
        updateFilters(container);
      }

      if (button === "group_toggle") {
        var group = n$2("#".concat(e.currentTarget.getAttribute("aria-controls")));
        var ariaExpanded = e.currentTarget.getAttribute("aria-expanded") === "true";
        slideStop(group);

        if (ariaExpanded) {
          closeGroup(e.currentTarget, group);
        } else {
          openGroup(e.currentTarget, group);
        }
      }
    }
  }

  function openGroup(button, group) {
    slideDown(group);
    button.setAttribute("aria-expanded", true);
    group.setAttribute("aria-hidden", false);
  }

  function closeGroup(button, group) {
    slideUp(group);
    button.setAttribute("aria-expanded", false);
    group.setAttribute("aria-hidden", true);
  }

  function containsCheckedInputs(items) {
    return items.some(function (input) {
      return input.checked;
    });
  }

  function rangeInputsHaveValue() {
    return rangeInputs.some(function (input) {
      return input.value !== "";
    });
  }

  function checkForActiveModalitems(currentTarget) {
    var panel = currentTarget.closest(sel$1.panel);
    if (!panel) return;
    var activeItems = containsCheckedInputs(t$3("input", panel)) || rangeInputsHaveValue();
    l(panel, classes$3.activeFilters, activeItems);
  }

  function syncActiveStates() {
    var panels = t$3(sel$1.panel, container);
    panels.forEach(function (panel) {
      var activeItems = false;
      var rangeInputs = n$2("[data-range-input]", panel);

      if (containsCheckedInputs(t$3("input", panel))) {
        activeItems = true;
      }

      if (rangeInputs && rangeInputsHaveValue()) {
        activeItems = true;
      }

      l(panel, classes$3.activeFilters, activeItems);
    });
  }

  function renderFilters(doc) {
    var updatedFilterItems = t$3("".concat(sel$1.drawer, " ").concat(sel$1.filterItem), doc);
    updatedFilterItems.forEach(function (element) {
      replaceElement("".concat(sel$1.drawer, " ").concat(sel$1.filterItem, "[for=\"").concat(element.getAttribute("for"), "\"] .filter-item__checkbox"), doc);
      replaceElement("".concat(sel$1.drawer, " ").concat(sel$1.filterItem, "[for=\"").concat(element.getAttribute("for"), "\"] .filter-item__count"), doc);
    });
    var updatedGroupToggles = t$3("".concat(sel$1.drawer, " ").concat(sel$1.groupToggle), doc);
    updatedGroupToggles.forEach(function (element) {
      updateInnerHTML("".concat(sel$1.drawer, " [data-drawer-group-toggle=\"").concat(element.getAttribute("data-drawer-group-toggle"), "\"]"), doc);
    });
    updateInnerHTML("".concat(sel$1.drawer, " ").concat(sel$1.resultsCount), doc);
    updateInnerHTML("".concat(sel$1.drawer, " ").concat(sel$1.activeFilters), doc);
    updateInnerHTML("".concat(sel$1.drawer, " ").concat(sel$1.drawerTitle), doc);
    updateInnerHTML("[data-mobile-filters] [data-mobile-filters-toggle]", doc);
  }

  function unload() {
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    range && range.unload();
  }

  return {
    renderFilters: renderFilters,
    unload: unload
  };
};

var sel = {
  bar: "[data-filter-bar]",
  filterItem: "[data-filter-item]",
  dropdownToggle: "[data-dropdown-toggle]",
  group: "[data-filter-group]",
  groupLabels: "[data-filter-group-label]",
  groupValues: "[data-filter-group-values]",
  groupReset: "[data-filter-group-reset]",
  groupHeader: "[data-group-values-header]",
  priceRange: "[data-price-range]",
  rangeInput: "[data-range-input]",
  removeRange: "[data-remove-range]",
  filterInputs: "[data-filter-item-input]",
  sortInputs: "[data-sort-item-input]",
  resultsCount: "[data-results-count]",
  activeFilters: "[data-active-filters]",
  clearAll: "[data-clear-all-filters]"
};
var classes$2 = {
  activeFilters: "filters-active",
  filterDisabled: "filter-item__content--disabled",
  filterBarActive: "filter-bar__filters-inner--active",
  filterBarWashActive: "filter-bar--wash-active",
  filterGroupActive: "filter-group--active",
  filterGroupRight: "filter-group__values--right"
}; // eslint-disable-next-line valid-jsdoc

/**
 * A class to handle desktop filter bar functionality
 * @param {*} node the collection section container
 * @returns renderFilters and unload methods
 */

var filterBar = function filterBar(node) {
  if (!node) {
    return false;
  } // `node` is the colelction section container.
  // Using `container` here as the filter bar container to keep filter bar
  // and filter drawer DOM scope separate.


  var container = n$2(sel.bar, node);
  var groupLabels = t$3(sel.groupLabels, container);
  var rangeInputs = t$3(sel.rangeInput, container);
  var rangeContainer = n$2(sel.priceRange, container);
  var focusTrap = null;
  var range = null;

  if (rangeContainer) {
    range = priceRange(rangeContainer);
  }

  var events = [e$3(window, "click", clickHandler), e$3(container, "change", changeHandler), c("filters:filter-removed", function () {
    return syncActiveStates();
  }), e$3(container, "keydown", function (_ref) {
    var keyCode = _ref.keyCode;
    if (keyCode === 27) closeGroups();
  })]; // eslint-disable-next-line valid-jsdoc

  /**
   * Delegates click events
   * @param {event} e click event
   */

  function clickHandler(e) {
    var group = e.target.closest(sel.group);
    var dropdownToggle = e.target.closest(sel.dropdownToggle);
    var groupReset = e.target.closest(sel.groupReset);
    var removeRange = e.target.closest(sel.removeRange);
    var clearAll = e.target.closest(sel.clearAll); // If the click happened outside of a filter group
    // We don't want to close the groups if the click happened on a filter in a group

    if (!group) {
      closeGroups();
    }

    if (dropdownToggle) {
      toggleDropdown(dropdownToggle);
    }

    if (groupReset) {
      handleGroupReset(groupReset);
    }

    if (removeRange) {
      e.preventDefault();
      priceRangeRemove();
    }

    if (clearAll) {
      e.preventDefault();
      clearAllFilters();
    }
  }

  function clearAllFilters() {
    range && range.reset();
    t$3("".concat(sel.filterInputs), container).forEach(function (input) {
      input.checked = false;
    });
    updateFilters(container);
  }

  function handleGroupReset(groupReset) {
    var group = groupReset.closest(sel.groupValues);
    var filterType = group.dataset.filterType;

    if (filterType === "price_range") {
      priceRangeRemove();
    } else {
      t$3(sel.filterInputs, group).forEach(function (input) {
        input.checked = false;
      });
      updateFilters(container);
    }
  }

  function priceRangeRemove() {
    range && range.reset();
    checkForActiveFilters();
    updateFilters(container);
  } // eslint-disable-next-line valid-jsdoc

  /**
   * Delegates change events
   * @param {event} e change event
   */


  function changeHandler(e) {
    var filterInput = e.target.closest("".concat(sel.bar, " ").concat(sel.filterInputs, ", ").concat(sel.bar, " ").concat(sel.sortInputs));
    var rangeInput = e.target.closest("".concat(sel.bar, " ").concat(sel.rangeInput));

    if (filterInput) {
      checkForActiveFilters();
      filterChange(filterInput);
    } else if (rangeInput) {
      checkForActiveFilters();
      filterChange(rangeInput);
    }
  }

  function closeGroups() {
    groupLabels.forEach(function (button) {
      hideDropdown(button);
    });
  }

  function toggleDropdown(button) {
    var ariaExpanded = button.getAttribute("aria-expanded") === "true";

    if (ariaExpanded) {
      closeGroups();
      hideDropdown(button);
    } else {
      closeGroups();
      showDropdown(button);
    }
  }

  function showDropdown(button) {
    var group = button.closest(sel.group);
    button.setAttribute("aria-expanded", true);
    var dropdown = n$2("#".concat(button.getAttribute("aria-controls")), container);
    var dropdownToggle = button.dataset.dropdownToggle;

    if (dropdown) {
      if (dropdownToggle === "filter-bar-filters") {
        slideStop(dropdown);
        slideDown(dropdown).then(function () {
          dropdown.setAttribute("aria-hidden", false);
        });
      } else {
        dropdown.setAttribute("aria-hidden", false);

        if (group) {
          u$1(group, classes$2.filterGroupActive);
          positionGroup(group, dropdown); // Lock the filter bar to stop horizontal scrolling

          u$1(container, classes$2.filterBarWashActive);
          focusTrap = createFocusTrap(group, {
            allowOutsideClick: true
          });
          focusTrap.activate();
        }
      }
    }
  }

  function hideDropdown(button) {
    var group = button.closest(sel.group);
    i$1(container, classes$2.filterBarWashActive);
    button.setAttribute("aria-expanded", false);
    var dropdown = n$2("#".concat(button.getAttribute("aria-controls")), container);
    var dropdownToggle = button.dataset.dropdownToggle;

    if (dropdown) {
      dropdown.setAttribute("aria-hidden", true);

      if (dropdownToggle === "filter-bar-filters") {
        slideStop(dropdown);
        slideUp(dropdown);
      } else if (group) {
        i$1(group, classes$2.filterGroupActive);
        focusTrap && focusTrap.deactivate();
      }
    }
  }

  function positionGroup(group, dropdown) {
    i$1(dropdown, classes$2.filterGroupRight); // The filter bar bounding rect

    var parentBounds = group.parentElement.getBoundingClientRect(); // This filter groups bounding rect.
    // This will be around the toggle button
    // and what the drop down is positioned inside of

    var groupBounds = group.getBoundingClientRect(); // The drop down bounding rect

    var dropdownBounds = dropdown.getBoundingClientRect(); // Check if the drop down will stick out too far past the toggle button
    // Basicially checks if the drop down will overflow the page or not
    // 1. add the left side X position of the toggle button
    //    to the width of the drop down
    //    to get the left side position of the drop down
    // 2. If the left side of the drop down is past the width of the filter bar
    // 3. Add a class to the drop down to position it
    //    to the right side of the toggle button

    if (groupBounds.x + dropdownBounds.width >= parentBounds.width) {
      u$1(dropdown, classes$2.filterGroupRight);
    }
  }

  function updateGroupPositions() {
    var buttons = t$3(sel.dropdownToggle, container);
    buttons.forEach(function (button) {
      var ariaExpanded = button.getAttribute("aria-expanded") === "true";

      if (ariaExpanded) {
        var group = button.closest(sel.group);
        var dropdown = n$2("#".concat(button.getAttribute("aria-controls")), container);

        if (group && dropdown) {
          positionGroup(group, dropdown);
        }
      }
    });
  }

  function filterChange(filter) {
    if (filter.classList.contains(classes$2.filterDisabled)) {
      return;
    }

    checkForActiveFilters();
    range && range.validateRange();
    debounce(function () {
      return updateFilters(container);
    }, 1000)();
  }

  function checkForActiveFilters() {
    var activeItems = containsCheckedInputs(t$3(sel.filterInputs, container)) || rangeInputsHaveValue();
    l(container, classes$2.activeFilters, activeItems);
  }

  function rangeInputsHaveValue() {
    return rangeInputs.some(function (input) {
      return input.value !== "";
    });
  }

  function containsCheckedInputs(items) {
    return items.some(function (input) {
      return input.checked;
    });
  }

  function syncActiveStates() {
    var activeItems = false;

    if (rangeInputs && rangeInputsHaveValue() || containsCheckedInputs(t$3(sel.filterInputs, container))) {
      activeItems = true;
    }

    l(container, classes$2.activeFilters, activeItems);
  }

  function renderFilters(doc) {
    var updatedFilterItems = t$3("".concat(sel.bar, " ").concat(sel.filterItem), doc);
    updatedFilterItems.forEach(function (element) {
      replaceElement("".concat(sel.bar, " ").concat(sel.filterItem, "[for=\"").concat(element.getAttribute("for"), "\"] .filter-item__checkbox"), doc);
      replaceElement("".concat(sel.bar, " ").concat(sel.filterItem, "[for=\"").concat(element.getAttribute("for"), "\"] .filter-item__count"), doc);
    });
    updateInnerHTML("".concat(sel.bar, " ").concat(sel.resultsCount), doc);
    updateInnerHTML("".concat(sel.bar, " ").concat(sel.activeFilters), doc);
    updateInnerHTML("".concat(sel.bar, " ").concat(sel.groupHeader), doc);
    var updatedDropdownToggles = t$3("".concat(sel.bar, " ").concat(sel.dropdownToggle), doc);

    if (updatedDropdownToggles.length > 0) {
      updatedDropdownToggles.forEach(function (updated) {
        updateInnerHTML("".concat(sel.bar, " [data-dropdown-toggle=\"").concat(updated.getAttribute("data-dropdown-toggle"), "\"]"), doc);
      });
    }

    var updatedGroupHeader = t$3("".concat(sel.bar, " ").concat(sel.groupHeader), doc);
    updatedGroupHeader.forEach(function (element) {
      updateInnerHTML("".concat(sel.bar, " [data-group-values-header=\"").concat(element.getAttribute("data-group-values-header"), "\"]"), doc);
    });
    updateGroupPositions();
  }

  function unload() {
    events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
    range && range.unload();
    focusTrap && focusTrap.deactivate();
  }

  return {
    renderFilters: renderFilters,
    unload: unload
  };
};

var selectors$2 = {
  infiniteScrollContainer: ".collection__infinite-container",
  infiniteScrollTrigger: ".collection__infinite-trigger",
  partial: "[data-partial]",
  filterDrawer: "[data-filter-drawer]",
  filterBar: "[data-filter-bar]",
  loader: ".collection__loading"
};
var classes$1 = {
  active: "is-active",
  hideProducts: "animation--collection-products-hide"
};
register("collection", {
  infiniteScroll: null,
  onLoad: function onLoad() {
    var _this$container$datas = this.container.dataset,
        collectionItemCount = _this$container$datas.collectionItemCount,
        paginationType = _this$container$datas.paginationType;
    if (!parseInt(collectionItemCount)) return;
    this.filterDrawerEl = n$2(selectors$2.filterDrawer, this.container);
    this.filterbarEl = n$2(selectors$2.filterBar, this.container);

    if (this.filterDrawerEl || this.filterbarEl) {
      this.partial = n$2(selectors$2.partial, this.container);
      this.filterDrawer = filterDrawer(this.container);
      this.filterBar = filterBar(this.container);
      this.filterHandler = filterHandler({
        container: this.container,
        renderCB: this._renderView.bind(this)
      });
    } // Ininite scroll


    this.paginationType = paginationType;
    this.paginated = this.paginationType === "paginated";
    this.infiniteScrollTrigger = n$2(selectors$2.infiniteScrollTrigger, this.container);

    if (!this.paginated) {
      this._initInfiniteScroll();
    }

    this.productItem = ProductItem(this.container);

    if (shouldAnimate(this.container)) {
      this.animateCollection = animateCollection(this.container);
    }
  },
  _initInfiniteScroll: function _initInfiniteScroll() {
    var _this = this;

    var infiniteScrollOptions = {
      container: selectors$2.infiniteScrollContainer,
      pagination: selectors$2.infiniteScrollTrigger,
      loadingText: "Loading...",
      callback: function callback() {
        var _this$animateCollecti;

        _this.productItem && _this.productItem.unload();
        _this.productItem = ProductItem(_this.container);
        (_this$animateCollecti = _this.animateCollection) === null || _this$animateCollecti === void 0 ? void 0 : _this$animateCollecti.infiniteScrollReveal();
        r$2("collection:updated");
      }
    };

    if (this.paginationType === "click") {
      infiniteScrollOptions.method = "click";
    }

    this.infiniteScroll = new Ajaxinate(infiniteScrollOptions);
  },
  _renderView: function _renderView(searchParams) {
    var _this2 = this;

    var updateHistory = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var url = "".concat(window.location.pathname, "?section_id=").concat(this.container.dataset.sectionId, "&").concat(searchParams);
    var loading = n$2(selectors$2.loader, this.container);
    u$1(this.partial, classes$1.hideProducts);
    u$1(loading, classes$1.active);
    fetch(url).then(function (res) {
      return res.text();
    }).then(function (res) {
      var _this2$animateCollect;

      if (updateHistory) {
        _this2._updateURLHash(searchParams);
      }

      var doc = new DOMParser().parseFromString(res, "text/html");
      var contents = n$2(selectors$2.partial, doc).innerHTML;
      _this2.partial.innerHTML = contents;
      (_this2$animateCollect = _this2.animateCollection) === null || _this2$animateCollect === void 0 ? void 0 : _this2$animateCollect.updateContents();

      if (!_this2.paginated && _this2.infiniteScrollTrigger) {
        _this2.infiniteScrollTrigger.innerHTML = "";

        _this2._initInfiniteScroll();
      }

      _this2.filterDrawer && _this2.filterDrawer.renderFilters(doc);
      _this2.filterBar && _this2.filterBar.renderFilters(doc);
      _this2.productItem && _this2.productItem.unload();
      _this2.productItem = ProductItem(_this2.container);
      i$1(loading, classes$1.active);
      r$2("collection:updated");
    });
  },
  _updateURLHash: function _updateURLHash(searchParams) {
    history.pushState({
      searchParams: searchParams
    }, "", "".concat(window.location.pathname).concat(searchParams && "?".concat(searchParams)));
  },
  onUnload: function onUnload() {
    var _this$animateCollecti2;

    this.infiniteScroll && this.infiniteScroll.destroy();
    this.filterHandler && this.filterHandler.unload();
    this.filterDrawer && this.filterDrawer.unload();
    this.filterBar && this.filterBar.unload();
    this.filtering && this.filtering.unload();
    this.productItem && this.productItem.unload();
    (_this$animateCollecti2 = this.animateCollection) === null || _this$animateCollecti2 === void 0 ? void 0 : _this$animateCollecti2.destroy();
  }
});

register("login", {
  onLoad: function onLoad() {
    var main = n$2('[data-part="login"]', this.container);
    var reset = n$2('[data-part="reset"]', this.container);
    var toggles = t$3("[data-toggle]", this.container);
    var loginError = n$2(".form-status__message--error", reset);
    var isSuccess = n$2(".form-status__message--success", reset);
    var successMessage = n$2("[data-success-message]", this.container);

    if (isSuccess) {
      u$1(successMessage, "visible");
      u$1([main, reset], "hide");
    }

    if (loginError) {
      toggleView();
    }

    function toggleView(e) {
      e && e.preventDefault();
      l([main, reset], "hide");
      main.setAttribute("aria-hidden", a$1(main, "hide"));
      reset.setAttribute("aria-hidden", a$1(reset, "hide"));
    }

    this.toggleClick = e$3(toggles, "click", toggleView);
  },
  onUnload: function onUnload() {
    this.toggleClick();
  }
});

register("addresses", {
  onLoad: function onLoad() {
    var _this = this;

    this.modals = t$3("[data-address-modal]", this.container);
    this.focusTrap = null;
    var overlays = t$3("[data-overlay]", this.container);
    var open = t$3("[data-open]", this.container);
    var close = t$3("[data-close]", this.container);
    var remove = t$3("[data-remove]", this.container);
    var countryOptions = t$3("[data-country-option]", this.container) || [];
    this.events = [e$3(open, "click", function (e) {
      return _this.openModal(e);
    }), e$3([].concat(_toConsumableArray(close), _toConsumableArray(overlays)), "click", function (e) {
      return _this.closeModal(e);
    }), e$3(remove, "click", function (e) {
      return _this.removeAddress(e);
    }), e$3(this.modals, "keydown", function (e) {
      if (e.keyCode === 27) _this.closeModal(e);
    })];
    countryOptions.forEach(function (el) {
      var formId = el.dataset.formId;
      var countrySelector = "AddressCountry_" + formId;
      var provinceSelector = "AddressProvince_" + formId;
      var containerSelector = "AddressProvinceContainer_" + formId;
      new window.Shopify.CountryProvinceSelector(countrySelector, provinceSelector, {
        hideElement: containerSelector
      });
    });
  },
  onUnload: function onUnload() {
    this.events.forEach(function (unsubscribe) {
      return unsubscribe();
    });
  },
  openModal: function openModal(e) {
    e.preventDefault();
    var which = e.currentTarget.dataset.open;
    var modal = this.modals.find(function (el) {
      return el.dataset.addressModal == which;
    });
    u$1(modal, "active");
    this.focusTrap = createFocusTrap(modal, {
      allowOutsideClick: true
    });
    this.focusTrap.activate();
    disableBodyScroll(modal, {
      allowTouchMove: function allowTouchMove(el) {
        while (el && el !== document.body) {
          if (el.getAttribute("data-scroll-lock-ignore") !== null) {
            return true;
          }

          el = el.parentNode;
        }
      },
      reserveScrollBarGap: true
    });
    setTimeout(function () {
      u$1(modal, "visible");
    }, 50);
  },
  closeModal: function closeModal(e) {
    e.preventDefault();
    var modal = e.target.closest(".addresses__modal");
    enableBodyScroll(modal);
    this.focusTrap.deactivate();
    i$1(modal, "visible");
    setTimeout(function () {
      i$1(modal, "active");
    }, 350);
  },
  removeAddress: function removeAddress(e) {
    var _e$currentTarget$data = e.currentTarget.dataset,
        confirmMessage = _e$currentTarget$data.confirmMessage,
        target = _e$currentTarget$data.target;

    if (confirm(confirmMessage)) {
      window.Shopify.postLink(target, {
        parameters: {
          _method: "delete"
        }
      });
    }
  }
});

register("article", {
  onLoad: function onLoad() {
    focusFormStatus(this.container);
    var socialShareContainer = n$2(".social-share", this.container);

    if (socialShareContainer) {
      this.socialShare = SocialShare(socialShareContainer);
    }

    wrapIframes(t$3("iframe", this.container));
    wrapTables(t$3("table", this.container));

    if (shouldAnimate(this.container)) {
      this.animateArticle = animateArticle(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateArticle;

    this.socialShare && this.socialShare();
    (_this$animateArticle = this.animateArticle) === null || _this$animateArticle === void 0 ? void 0 : _this$animateArticle.destroy();
  }
});

register("password", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animatePassword = animatePassword(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animatePassword;

    (_this$animatePassword = this.animatePassword) === null || _this$animatePassword === void 0 ? void 0 : _this$animatePassword.destroy();
  }
});

var selectors$1 = {
  video: ".about__block-video"
};
register("page", {
  onLoad: function onLoad() {
    var _this = this;

    var videos = t$3(selectors$1.video, this.container);
    this.videoHandlers = [];

    if (videos.length) {
      videos.forEach(function (video) {
        _this.videoHandlers.push(backgroundVideoHandler(video.parentNode));
      });
    }

    this.accordions = Accordions(t$3(".accordion", this.container));
    wrapIframes(t$3("iframe", this.container));
    wrapTables(t$3("table", this.container));

    if (shouldAnimate(this.container)) {
      this.animatePage = animatePage(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animatePage;

    this.accordions.unload();
    this.videoHandlers.forEach(function (handler) {
      return handler();
    });
    (_this$animatePage = this.animatePage) === null || _this$animatePage === void 0 ? void 0 : _this$animatePage.destroy();
  }
});

var selectors = {
  searchSection: ".search",
  searchBanner: ".search-header",
  infiniteScrollContainer: ".search__infinite-container",
  infiniteScrollTrigger: ".search__infinite-trigger",
  partial: "[data-partial]",
  filterDrawer: "[data-filter-drawer]",
  filterBar: "[data-filter-bar]",
  loader: ".search__loading"
};
var classes = {
  active: "is-active",
  hideProducts: "animation--search-products-hide"
};
register("search", {
  infiniteScroll: null,
  onLoad: function onLoad() {
    this.searchBannerEl = n$2(selectors.searchBanner, this.container);

    if (shouldAnimate(this.searchBannerEl)) {
      this.animateSearchBanner = animateSearchBanner(this.searchBannerEl);
    }

    var _this$container$datas = this.container.dataset,
        searchItemCount = _this$container$datas.searchItemCount,
        paginationType = _this$container$datas.paginationType;
    if (!parseInt(searchItemCount)) return;
    this.searchSectionEl = n$2(selectors.searchSection, this.container);
    this.filterDrawerEl = n$2(selectors.filterDrawer, this.container);
    this.filterBarEl = n$2(selectors.filterBar, this.container);

    if (this.filterBarEl) {
      this.partial = n$2(selectors.partial, this.container);
      this.filterDrawer = filterDrawer(this.searchSectionEl);
      this.filterBar = filterBar(this.searchSectionEl);
      this.filterHandler = filterHandler({
        container: this.searchSectionEl,
        renderCB: this._renderView.bind(this)
      });
    } // Ininite scroll


    this.paginationType = paginationType;
    this.paginated = this.paginationType === "paginated";
    this.infiniteScrollTrigger = n$2(selectors.infiniteScrollTrigger, this.container);

    if (!this.paginated) {
      this._initInfiniteScroll();
    }

    this.productItem = ProductItem(this.container);

    if (shouldAnimate(this.searchSectionEl)) {
      this.animateSearch = animateSearch(this.searchSectionEl);
    }
  },
  _initInfiniteScroll: function _initInfiniteScroll() {
    var _this = this;

    var infiniteScrollOptions = {
      container: selectors.infiniteScrollContainer,
      pagination: selectors.infiniteScrollTrigger,
      loadingText: "Loading...",
      callback: function callback() {
        var _this$animateSearch;

        _this.productItem && _this.productItem.unload();
        _this.productItem = ProductItem(_this.container);
        (_this$animateSearch = _this.animateSearch) === null || _this$animateSearch === void 0 ? void 0 : _this$animateSearch.infiniteScrollReveal();
        r$2("collection:updated");
      }
    };

    if (this.paginationType === "click") {
      infiniteScrollOptions.method = "click";
    }

    this.infiniteScroll = new Ajaxinate(infiniteScrollOptions);
  },
  _renderView: function _renderView(searchParams) {
    var _this2 = this;

    var updateHistory = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    var url = "".concat(window.location.pathname, "?section_id=").concat(this.container.dataset.sectionId, "&").concat(searchParams);
    var loading = n$2(selectors.loader, this.container);
    u$1(loading, classes.active);
    fetch(url).then(function (res) {
      return res.text();
    }).then(function (res) {
      var _this2$animateSearch;

      if (updateHistory) {
        _this2._updateURLHash(searchParams);
      }

      var doc = new DOMParser().parseFromString(res, "text/html");
      var contents = n$2(selectors.partial, doc).innerHTML;
      _this2.partial.innerHTML = contents;
      (_this2$animateSearch = _this2.animateSearch) === null || _this2$animateSearch === void 0 ? void 0 : _this2$animateSearch.updateContents();

      if (!_this2.paginated && _this2.infiniteScrollTrigger) {
        _this2.infiniteScrollTrigger.innerHTML = "";

        _this2._initInfiniteScroll();
      }

      _this2.filterDrawer && _this2.filterDrawer.renderFilters(doc);
      _this2.filterBar && _this2.filterBar.renderFilters(doc);
      _this2.productItem && _this2.productItem.unload();
      _this2.productItem = ProductItem(_this2.container);
      i$1(loading, classes.active);
      r$2("collection:updated");
    });
  },
  _updateURLHash: function _updateURLHash(searchParams) {
    history.pushState({
      searchParams: searchParams
    }, "", "".concat(window.location.pathname).concat(searchParams && "?".concat(searchParams)));
  },
  onUnload: function onUnload() {
    var _this$animateSearch2, _this$animateSearchBa;

    this.infiniteScroll && this.infiniteScroll.destroy();
    this.filterHandler && this.filterHandler.unload();
    this.filterDrawer && this.filterDrawer.unload();
    this.filterBar && this.filterBar.unload();
    this.filtering && this.filtering.unload();
    this.productItem && this.productItem.unload();
    (_this$animateSearch2 = this.animateSearch) === null || _this$animateSearch2 === void 0 ? void 0 : _this$animateSearch2.destroy();
    (_this$animateSearchBa = this.animateSearchBanner) === null || _this$animateSearchBa === void 0 ? void 0 : _this$animateSearchBa.destroy();
  }
});

register("contact", {
  onLoad: function onLoad() {
    this.accordions = Accordions(t$3(".accordion", this.container));
    wrapIframes(t$3("iframe", this.container));
    wrapTables(t$3("table", this.container));
  },
  onUnload: function onUnload() {
    this.accordions.unload();
  }
});

register("blog", {
  onLoad: function onLoad() {
    var mobileNavSelect = n$2("#blog-mobile-nav", this.container);

    if (mobileNavSelect) {
      this.mobileNavSelectEvent = e$3(mobileNavSelect, "change", function () {
        window.location.href = mobileNavSelect.value;
      });
    }

    if (shouldAnimate(this.container)) {
      this.animateBlog = animateBlog(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateBlog;

    (_this$animateBlog = this.animateBlog) === null || _this$animateBlog === void 0 ? void 0 : _this$animateBlog.destroy();
    this.mobileNavSelectEvent && this.mobileNavSelectEvent.unsubscribe();
  }
});

register("collection-banner", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateCollectionBanner = animateCollectionBanner(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateCollecti;

    (_this$animateCollecti = this.animateCollectionBanner) === null || _this$animateCollecti === void 0 ? void 0 : _this$animateCollecti.destroy();
  }
});

register("list-collections", {
  onLoad: function onLoad() {
    if (shouldAnimate(this.container)) {
      this.animateListCollections = animateListCollections(this.container);
    }
  },
  onUnload: function onUnload() {
    var _this$animateListColl;

    (_this$animateListColl = this.animateListCollections) === null || _this$animateListColl === void 0 ? void 0 : _this$animateListColl.destroy();
  }
});

if (window.Shopify.designMode === true) {
  u$1(document.documentElement, "theme-editor");
  document.documentElement.classList.add("theme-editor");
} else {
  var el = n$2(".theme-editor-scroll-offset", document);
  el && el.parentNode.removeChild(el);
} // Function to load all sections


var loadSections = function loadSections() {
  load("*");
  o$1({
    SelectedProductSection: null
  });
}; // Call above function either immediately or bind on loaded event


if (document.readyState === "complete" || document.readyState === "interactive") {
  loadSections();
} else {
  e$3(document, "DOMContentLoaded", loadSections);
}

if (isMobile$1({
  tablet: true,
  featureDetect: true
})) {
  u$1(document.body, "is-mobile");
} // Page transitions


pageTransition(); // a11y tab handler

handleTab(); // Apply contrast classes

sectionClasses(); // Load productlightbox

productLightbox(); // Quick view modal

var quickViewModalElement = n$2("[data-quick-view-modal]", document);

if (quickViewModalElement) {
  quickViewModal(quickViewModalElement);
} // Setup modal


var modalElement = n$2("[data-modal]", document);
modal(modalElement);
var flashModal = n$2("[data-flash-alert]", document);
flashAlertModal(flashModal); // Product availabilty drawer

var availabilityDrawer = n$2("[data-store-availability-drawer]", document);
storeAvailabilityDrawer(availabilityDrawer); // Setup header overlay

var headerOverlayContainer = document.querySelector("[data-header-overlay]");
headerOverlay(headerOverlayContainer); // Make it easy to see exactly what theme version
// this is by commit SHA

window.SHA = "d650bd4e7c";
