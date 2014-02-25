/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2014 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)
     * Daniel Wagner (danielwagner)

************************************************************************ */

/**
 * Low-level pointer event handler.
 *
 * @require(qx.bom.client.Event)
 */
qx.Bootstrap.define("qx.event.handler.PointerCore", {

  extend : Object,

  statics : {
    MOUSE_TO_POINTER_MAPPING: {
      mousedown: "pointerdown",
      mouseup: "pointerup",
      mousemove: "pointermove",
      mouseout: "pointerout",
      mouseover: "pointerover"
    },

    TOUCH_TO_POINTER_MAPPING: {
      touchstart: "pointerdown",
      touchend: "pointerup",
      touchmove: "pointermove",
      touchcancel: "pointercancel"
    },

    MSPOINTER_TO_POINTER_MAPPING: {
      MSPointerDown : "pointerdown",
      MSPointerMove : "pointermove",
      MSPointerUp : "pointerup",
      MSPointerCancel : "pointercancel",
      MSPointerLeave : "pointerleave",
      MSPointerEnter: "pointerenter",
      MSPointerOver : "pointerover",
      MSPointerOut : "pointerout"
    }
  },

  /**
   * Create a new instance
   *
   * @param target {Element} element on which to listen for native touch events
   */
  construct : function(target) {
    this.__defaultTarget = target;
    this.__eventNames = [];
    this.__buttonStates = [];

    if (qx.core.Environment.get("event.mspointer")) {
      var engineName = qx.core.Environment.get("engine.name");
      var docMode = parseInt(qx.core.Environment.get("browser.documentmode"), 10);
      if (engineName == "mshtml" && docMode == 10) {
        this.__eventNames = ["MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel"];
        this._initPointerObserver();
      }
    } else {
      if (qx.core.Environment.get("device.touch")) {
        this.__eventNames = ["touchstart", "touchend", "touchmove", "touchcancel"];
        this._initObserver(this._onTouchEvent);
      }

      this.__eventNames = ["mousedown", "mouseup", "mousemove", "mouseover", "mouseout", "contextmenu"];
      this._initObserver(this._onMouseEvent);
    }
  },

  members : {
    __defaultTarget : null,
    __eventNames : null,
    __wrappedListener : null,
    __lastButtonState : null,
    __buttonStates : null,
    __contextMenu : false,
    __primaryIdentifier : null,

    /**
     * Adds listeners to native pointer events if supported
     */
    _initPointerObserver : function() {
      this.__wrappedListener = qx.lang.Function.listener(this._onPointerEvent, this);
      this._initObserver(this._onPointerEvent);
    },


    _initObserver : function(callback) {
      this.__wrappedListener = qx.lang.Function.listener(callback, this);
      this.__eventNames.forEach(function(type) {
        qx.bom.Event.addNativeListener(this.__defaultTarget, type, this.__wrappedListener);
      }.bind(this));
    },

    /**
     * Handler for native pointer events
     * @param domEvent {Event}  Native DOM event
     */
    _onPointerEvent : function(domEvent) {
      var type = qx.event.handler.PointerCore.MSPOINTER_TO_POINTER_MAPPING[domEvent.type];
      var target = qx.bom.Event.getTarget(domEvent);
      domEvent.type = type;
      var evt = new qx.event.type.native.Pointer(type, domEvent);
      this._fireEvent(evt, type, target);
    },

    /**
     * Handler for touch events
     * @param domEvent {Event} Native DOM event
     */
    _onTouchEvent: function(domEvent) {
      var type = qx.event.handler.PointerCore.TOUCH_TO_POINTER_MAPPING[domEvent.type];
      var target = qx.bom.Event.getTarget(domEvent);
      var changedTouches = domEvent.changedTouches;
      domEvent.stopPropagation();

      if (domEvent.type == "touchstart" && !this.__primaryIdentifier) {
        this.__primaryIdentifier = changedTouches[0].identifier;
      }

      for (var i = 0, l = changedTouches.length; i < l; i++) {
        var touch = changedTouches[i];

        var touchProps = {
          clientX: touch.clientX,
          clientY: touch.clientY,
          pageX: touch.pageX,
          pageY: touch.pageY,
          identifier: touch.identifier,
          screenX: touch.screenX,
          screenY: touch.screenY,
          target: touch.target
        };

        if (domEvent.type == "touchstart") {
          // Fire pointerenter before pointerdown
          var evt = this._createPointerEvent("pointerover", domEvent, "touch", touch.identifier + 2, touchProps);
          this._fireEvent(evt, "pointerover", target);
        }

        var evt = this._createPointerEvent(type, domEvent, "touch", touch.identifier + 2, touchProps);

        if (domEvent.type == "touchstart" || domEvent.type == "touchmove" || domEvent.type == "touchend" || domEvent.type == "touchcancel") {
          if (touch.identifier == this.__primaryIdentifier) {
            evt.isPrimary = true;
          }
        }

        this._fireEvent(evt, type, target);

        if (domEvent.type == "touchend" || domEvent.type == "touchcancel") {
          // Fire pointerout after pointerup
          var evt = this._createPointerEvent("pointerout", domEvent, "touch", touch.identifier + 2, touchProps);
          this._fireEvent(evt, "pointerout", target);

          if (this.__primaryIdentifier == touch.identifier) {
            this.__primaryIdentifier = null;
          }
        }
      }
    },


    /**
    * Handler for touch events
    * @param domEvent {Event} Native DOM event
    */
    _onMouseEvent : function(domEvent) {
      domEvent.stopPropagation();
      if (domEvent.type == "mousedown") {
        this.__buttonStates[domEvent.which] = 1;
      } else if (domEvent.type == "mouseup") {
        this.__buttonStates[domEvent.which] = 0;
        if (this.__contextMenu) {
          this.__contextMenu = false;
          return;
        }
      }

      var type = qx.event.handler.PointerCore.MOUSE_TO_POINTER_MAPPING[domEvent.type];
      var target = qx.bom.Event.getTarget(domEvent);

      var evt = this._createPointerEvent(type, domEvent, "mouse", 1);
      evt.isPrimary = true;

      var buttonsPressed = qx.lang.Array.sum(this.__buttonStates);

      if (this.__lastButtonState != buttonsPressed) {
        var moveEvt = new qx.event.type.native.Pointer("pointermove", domEvent);
        moveEvt.isPrimary = true;
        moveEvt.pointerType = "mouse";
        this._fireEvent(moveEvt, "pointermove", target);
      }

      this.__lastButtonState = buttonsPressed;

      if ((domEvent.type == "mousedown" && buttonsPressed > 1) ||
        (domEvent.type == "mouseup" && buttonsPressed > 0))
      {
        return;
      }

      if (domEvent.type == "contextmenu") {
        this.__buttonStates[domEvent.which] = 0;
        this.__contextMenu = true;
        return;
      }

      this._fireEvent(evt, type, target);
      this.__contextMenu = false;
    },


    _createPointerEvent : function(type, domEvent, pointerType, pointerId, properties) {
      var evt = new qx.event.type.native.Pointer(type, domEvent, properties);
      evt.pointerType = pointerType;
      evt.pointerId = pointerId;
      return evt;
    },


    /**
     * Removes native pointer event listeners.
     */
    _stopObserver : function() {
      for (var i = 0; i < this.__eventNames.length; i++) {
        qx.bom.Event.removeNativeListener(this.__defaultTarget, this.__eventNames[i], this.__wrappedListener);
      }
    },

    /**
     * Fire a touch event with the given parameters
     *
     * @param domEvent {Event} DOM event
     * @param type {String ? null} type of the event
     * @param target {Element ? null} event target
     */
    _fireEvent : function(domEvent, type, target)
    {
      target = target || domEvent.target;
      type = type || domEvent.type;

      target.dispatchEvent(domEvent);
    },

    /**
     * Dispose this object
     */
    dispose : function() {
      this._stopObserver();
      this.__defaultTarget = null;
    }
  }
});
