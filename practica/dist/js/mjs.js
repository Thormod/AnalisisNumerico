/*jslint sloppy: true, indent: 2 */
/*global XMLHttpRequest */

(function (global) {
  "use strict";

  global.onerror = (function () {
    var sent = {};
    return function (message, filename, lineno, colno, error) {
      if ("\v" === "v") {
        return;
      }
      if (message === "Script error.") {
        return;
      }
      message = (message || "").toString();
      filename = (filename || "").toString();
      lineno = (lineno || 0).toString();
      colno = (colno || 0).toString();
      var stack = error ? (error.stack || "").toString() : "";
      var data = "message=" + encodeURIComponent(message) + "&" +
                 "filename=" + encodeURIComponent(filename) + "&" +
                 "lineno=" + encodeURIComponent(lineno) + "&" +
                 "colno=" + encodeURIComponent(colno) + "&" +
                 "stack=" + encodeURIComponent(stack);
      if (!sent[data]) {
        sent[data] = true;
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "//matrixcalc.org/jserrors.php?error=1", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(data);
      }
    };
  }());

  //http://www.w3.org/TR/CSP2/#firing-securitypolicyviolationevent-events
  //global.onsecuritypolicyviolation = function () {
  //TODO: 
  //};

}(this));


/*
fix for IE8 issues with:

this.T = function () {
  throw new RangeError();
};
try {
  T();
} catch (e) {
  if (!(e instanceof RangeError)) {
    alert("IE 8 bug (?)");
  }
}
*/

var BigInteger = undefined;
var ArithmeticException = undefined;
var Matrix = undefined;
var Expression = undefined;
var Polynom = undefined;
var RPN = undefined;
var Utils = undefined;
var snapshot = undefined;
var appendScript = undefined;
var SmallFraction = undefined;
var printSomething = undefined;
var mgetZero = undefined;
var permutations = undefined;


(function (global) {
  "use strict";

  function MapEntry(key, value) {
    this.key = key;
    this.value = value;
    this.nextEntry = undefined;
    this.next = undefined;
    this.previous = undefined;
  }

  function Map() {
    this.data = {};
    this.size = 0;
    this.sentinel = new MapEntry(undefined, undefined);
    this.sentinel.next = this.sentinel;
    this.sentinel.previous = this.sentinel;
  }

  String.prototype["Map.key"] = function () {
    return "" + this;
  };
  Number.prototype["Map.key"] = function () {
    return (0 + this).toString();
  };
  //Object.prototype["Map.key"] = function () {
  //  return "";
  //};
  Map.getKey = function (key) {
    return key == undefined || key["Map.key"] == undefined ? "" : key["Map.key"]();
  };

  Map.prototype.forEach = function (callback, thisArg) {
    var node = this.sentinel.next;
    while (node !== this.sentinel) {
      callback.call(thisArg, node.value, node.key, this);
      while (node !== this.sentinel && node.next == undefined) {
        node = node.previous;
      }
      node = node.next;
    }
  };

  Map.prototype.clear = function () {
    var node = this.sentinel;
    while (node !== this.sentinel) {
      delete this.data[Map.getKey(node.key)];
      var tmp = node.next;
      node.next = undefined;
      node.previous = this.sentinel;
      node = tmp;
    }
    this.size = 0;
  };

  Map.prototype.get = function (key) {
    var k = Map.getKey(key);
    var entry = this.data[k];
    while (entry != undefined) {
      if (entry.key === key) {
        return entry.value;
      }
      entry = entry.nextEntry;
    }
    return undefined;
  };

  Map.prototype.has = function (key) {
    var k = Map.getKey(key);
    var entry = this.data[k];
    while (entry != undefined) {
      if (entry.key === key) {
        return true;
      }
      entry = entry.nextEntry;
    }
    return false;
  };

  Map.prototype.set = function (key, value) {
    var k = Map.getKey(key);
    var entry = this.data[k];
    var newEntry = new MapEntry(key, value);
    newEntry.previous = this.sentinel.previous;
    newEntry.next = this.sentinel;
    this.data[k] = newEntry;
    var previousEntry = newEntry;
    var size = this.size + 1;
    while (entry != undefined) {
      if (entry.key !== key) {
        previousEntry.nextEntry = entry;
        previousEntry = entry;
      } else {
        size -= 1;
        newEntry.previous = entry.previous;
        newEntry.next = entry.next;
        entry.next = undefined;
      }
      entry = entry.nextEntry;
    }
    newEntry.previous.next = newEntry;
    newEntry.next.previous = newEntry;
    this.size = size;
  };

  Map.prototype["delete"] = function (key) {
    var k = Map.getKey(key);
    var entry = this.data[k];
    delete this.data[k];
    var previousEntry = undefined;
    var size = this.size;
    while (entry != undefined) {
      if (entry.key !== key) {
        if (previousEntry == undefined) {
          this.data[k] = entry;
        } else {
          previousEntry.nextEntry = entry;
        }
        previousEntry = entry;
      } else {
        size -= 1;
        entry.previous.next = entry.next;
        entry.next.previous = entry.previous;
        entry.next = undefined;
      }
      entry = entry.nextEntry;
    }
    this.size = size;
  };

  global.Map = global.Map != undefined ? global.Map : Map;

}(this));

(function (global) {
  "use strict";

  if (Math.trunc == undefined) {
    Math.trunc = function (x) {
      return x < 0 ? Math.ceil(x) : Math.floor(x);
    };
  }

  if (String.prototype.repeat == undefined) {
    String.prototype.repeat = function (count) {
      var x = this.toString();
      if (count < 1) {
        return "";
      }
      var accumulator = "";
      while (count !== 1) {
        var t = Math.trunc(count / 2);
        if (t * 2 !== count) {
          accumulator += x;
        }
        x += x;
        count = t;
      }
      return accumulator + x;
    };
  }

  if (Object.keys == undefined) {
    Object.keys = function (object) {
      var keys = [];
      for (var name in object) {
        if (Object.prototype.hasOwnProperty.call(object, name)) {
          keys.push(name);
        }
      }
      return keys;
    };
  }

  if (Object.defineProperty == undefined && Object.prototype.__defineGetter__ != undefined && Object.prototype.__defineSetter__ != undefined) {
    Object.defineProperty = function (object, property, descriptor) {
      var getter = descriptor.get;
      if (getter != undefined) {
        object.__defineGetter__(property, getter);
      }
      var setter = descriptor.set;
      if (setter != undefined) {
        object.__defineSetter__(property, setter);
      }
    };
  }

  if (Object.create == undefined) {
    Object.create = function (prototype, properties) {
      var F = function () {
        if (properties != undefined) {
          var keys = Object.keys(properties);
          var i = -1;
          while (++i < keys.length) {
            var key = keys[i];
            Object.defineProperty(this, key, properties[key]);
          }
        }
      };
      F.prototype = prototype;
      return new F();
    };
  }

  if (Object.assign == undefined) {
    Object.assign = function (target) {
      for (var i = 1; i < arguments.length; i += 1) {
        var nextSource = arguments[i];
        if (nextSource != undefined) {
          var keys = Object.keys(nextSource);
          for (var j = 0; j < keys.length; j += 1) {
            var key = keys[j];
            target[key] = nextSource[key];
          }
        }
      }
      return target;
    };
  }

  if (Date.now == undefined) {
    Date.now = function () {
      return new Date().getTime();
    };
  }

  if (Number.parseInt == undefined) {
    Number.parseInt = parseInt;
  }

  if (Number.parseFloat == undefined) {
    Number.parseFloat = parseFloat;
  }

}(this));

/*jslint plusplus: true, vars: true, indent: 2 */
/*global Event, Node, document, window*/

// https://bugzilla.mozilla.org/show_bug.cgi?id=687787

(function () {
  "use strict";

  var custom = false;

  var onEvent = function (event, type) {
    // CustomEvent is not supported under FF < 6
    var e = document.createEvent("Event");
    e.initEvent(type, true, false);
    custom = true;
    event.target.dispatchEvent(e);
    custom = false;
  };

  var onFocusIn = function (event) {
    onEvent(event, "focusin");
  };

  var onFocusOut = function (event) {
    onEvent(event, "focusout");
  };

  function stopListeningFocusInt(event) {
    if (!custom) {
      document.removeEventListener("focusin", stopListeningFocusInt, false);
      document.removeEventListener("focus", onFocusIn, true);
    }
  }

  function stopListeningFocusOut(event) {
    if (!custom) {
      document.removeEventListener("focusout", stopListeningFocusOut, false);
      document.removeEventListener("blur", onFocusOut, true);
    }
  }

  if ("\v" !== "v" && document.addEventListener != undefined) {
    if (!("onfocusin" in document.documentElement)) {
      document.addEventListener("focusin", stopListeningFocusInt, false);
      document.addEventListener("focus", onFocusIn, true);
    }
    if (!("onfocusout" in document.documentElement)) {
      document.addEventListener("focusout", stopListeningFocusOut, false);
      document.addEventListener("blur", onFocusOut, true);
    }
  }

}());

(function () {
  "use strict";

  var onEvent = function (event, type) {
    var relatedTarget = event.relatedTarget;
    while (relatedTarget != undefined && relatedTarget !== event.target) {
      relatedTarget = relatedTarget.parentNode;
    }
    if (relatedTarget == undefined) {
      var e = document.createEvent("MouseEvent");
      e.initMouseEvent(type, false, false, event.view, event.detail,  event.screenX, event.screenY, event.clientX, event.clientY, event.ctrlKey, event.altKey, event.shiftKey, event.metaKey, event.button, event.relatedTarget);
      event.target.dispatchEvent(e);
    }
  };

  if (!("onmouseenter" in document.documentElement)) {
    document.addEventListener("mouseover", function (event) {
      onEvent(event, "mouseenter");
    }, false);
    document.documentElement.onmouseenter = undefined;
  }

  if (!("onmouseleave" in document.documentElement)) {
    document.addEventListener("mouseout", function (event) {
      onEvent(event, "mouseleave");
    }, false);
    document.documentElement.onmouseleave = undefined;
  }

}());

(function () {
  "use strict";

  // FF < 6
  if (Event.prototype.getPreventDefault != undefined && !("defaultPrevented" in Event.prototype)) {
    Object.defineProperty(Event.prototype, "defaultPrevented", {
      get: function () {
        return this.getPreventDefault();
      },
      configurable: true,
      enumerable: false
    });
  }

}());

(function () {
  "use strict";

  if (window.clipboardData != undefined && window.ClipboardEvent == undefined) { // IE 8 - IE 11 (not Edge)
    Object.defineProperty(Event.prototype, "clipboardData", {
      get: function () {
        return window.clipboardData;
      },
      configurable: true,
      enumerable: false
    });
    var nativeExecCommand = document.execCommand;
    document.execCommand = function (name, showDefaultUI, value) {
      if (name === "copy" && window.getSelection().isCollapsed) {
        var e = document.createEvent("Event");
        e.initEvent("copy", true, true);
        document.dispatchEvent(e);
      } else {
        nativeExecCommand.call(this, name, showDefaultUI, value);
      }
    };
    document.addEventListener("keydown", function (event) {
      if (event.keyCode === "C".charCodeAt(0) && event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && !event.defaultPrevented) {
        if (window.getSelection().isCollapsed) {
          event.preventDefault();
          document.execCommand("copy");
        }
      }
    }, false);
  }

}());

(function () {
  "use strict";

  // shim for http://www.whatwg.org/specs/web-apps/current-work/multipage/editing.html#sequential-focus-navigation-and-the-tabindex-attribute
  // https://code.google.com/p/chromium/issues/detail?id=122652
  // https://bugzilla.mozilla.org/show_bug.cgi?id=421933

  document.addEventListener("keydown", function (event) {
    var DOM_VK_RETURN = 13;
    if (event.keyCode === DOM_VK_RETURN && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && !event.defaultPrevented) {
      if (event.target.getAttribute("tabindex") != undefined) {
        event.preventDefault();
        event.target.click();
      }
    }
  }, false);

}());

(function () {
  "use strict";

  if (window.XDomainRequest != undefined && !("draggable" in document.documentElement)) {
    document.addEventListener("selectstart", function (event) {
      // IE 8 - IE 9 Drag and Drop helper
      var target = event.target;
      while (target != undefined && !(target.nodeType === Node.ELEMENT_NODE && target.getAttribute("draggable") != undefined)) {
        target = target.parentNode;
      }
      if (target != undefined) {
        event.preventDefault();
        target.dragDrop();
      }
    }, false);
  }

}());

if (document.head == undefined) {
  document.head = document.querySelector("head");
}

if (Element.prototype.scrollIntoViewIfNeeded == undefined) {
  Element.prototype.scrollIntoViewIfNeeded = function () {
    // `centerIfNeeded` is not implemented
    var rect = this.getBoundingClientRect();
    if (rect.left < 0 || document.documentElement.clientWidth < rect.right ||
        rect.top < 0 || document.documentElement.clientHeight < rect.bottom) {
      this.scrollIntoView(document.documentElement.clientHeight < rect.bottom - rect.top || rect.top < 0);
    }
  };
}

// Chrome < 20, Safari < 6
if (!("click" in HTMLElement.prototype)) {
  HTMLElement.prototype.click = function (element) {
    var event = document.createEvent("MouseEvent");
    event.initMouseEvent("click", true, true, window, 1,  0, 0, 0, 0, false, false, false, false, 0, undefined);
    this.dispatchEvent(event);
  };
}

/*jslint plusplus: true, vars: true, indent: 2 */
/*global document, Element */

/*
  element.classList for (IE8+)

  Object.defineProperty with DOM
*/

(function (E) {

  "use strict";

  function ClassList(element) {
    this.element = element;
    this.tokens = element.className.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ").split(" ");
    this.length = this.tokens.length;
  }

  ClassList.prototype.item = function (index) {
    return this.tokens[index];
  };
  ClassList.prototype.contains = function (className) {
    var i = -1;
    while (++i < this.tokens.length) {
      if (this.tokens[i] === className) {
        return true;
      }
    }
    return false;
  };
  ClassList.prototype.add = function (className) {
    var i = -1;
    while (++i < this.tokens.length) {
      if (this.tokens[i] === className) {
        return;
      }
    }
    this.tokens.push(className);
    this.element.className = this.tokens.join(" ");
    this.length += 1;
  };
  ClassList.prototype.remove = function (className) {
    var i = -1;
    var k = 0;
    while (++i < this.tokens.length) {
      if (this.tokens[i] !== className) {
        this.tokens[k] = this.tokens[i];
        k += 1;
      }
    }
    if (k !== i) {
      this.tokens.length = k;
      this.element.className = this.tokens.join(" ");
      this.length = k;
    }
  };
  ClassList.prototype.toggle = function (className) {
    var i = -1;
    var k = 0;
    while (++i < this.tokens.length) {
      if (this.tokens[i] !== className) {
        this.tokens[k] = this.tokens[i];
        k += 1;
      }
    }
    if (k !== i) {
      this.tokens.length = k;
      this.length = k;
    } else {
      this.tokens.push(className);
      this.length += 1;
    }
    this.element.className = this.tokens.join(" ");
  };
  ClassList.prototype.toString = function () {
    return this.element.className;
  };

  if (E != undefined && !("classList" in document.documentElement)) {
    Object.defineProperty(E.prototype, "classList", {
      get: function () {
        return new ClassList(this);
      },
      configurable: true, /* IE8-9 bug */
      enumerable: false
    });
  }

}(Element));

/*global document, window, Element */

(function (global) {
  "use strict";

  function cubicBezier(a, b, t) {
    return 3 * a * (1 - t) * (1 - t) * t + 3 * b * (1 - t) * t * t + t * t * t;
  }

  function cubic(a, b, c, d) {
    return function (x, error) {
      var start = 0;
      var end = 1;
      while (end - start > error) {
        var middle = (start + end) / 2;
        var e = cubicBezier(a, c, middle);
        if (e < x) {
          start = middle;
        } else {
          end = middle;
        }
      }
      return cubicBezier(b, d, start);
    };
  }

  var easeInOut = cubic(0.42, 0, 0.58, 1);

  var animationNameCounter = 0;

  var styleElement = undefined;

  function getStyleSheet() {
    if (styleElement == undefined) {
      styleElement = document.createElement("style");
      document.head.appendChild(styleElement);
    }
    return styleElement.sheet;
  }

  function setAnimationStyles(element, keyframes, duration) {
    var styleSheet = getStyleSheet();
    var cssRules = styleSheet.cssRules;
    animationNameCounter += 1;
    var newName = "animation" + animationNameCounter.toString();
    var oldName = element.style.animationName;
    var oldIndex = -1;
    for (var i = 0; i < cssRules.length; i += 1) {
      if (cssRules[i].type === window.CSSRule.KEYFRAMES_RULE && cssRules[i].name === oldName) {
        oldIndex = i;
      }
    }
    if (keyframes != undefined) {
      var rule = "@keyframes " + newName + " { " + keyframes.map(function (x, index, keyframes) { return (100 * index / (keyframes.length - 1)).toString() + "% { " + x + " } "; }).join("\n") + " } ";
      styleSheet.insertRule(rule, cssRules.length);
      element.style.animationDelay = "0s";
      element.style.animationDirection = "normal";
      element.style.animationDuration = duration.toString() + "s";
      element.style.animationFillMode = "both";
      element.style.animationIterationCount = "1";
      element.style.animationName = newName;
      element.style.animationPlayState = "running";
      element.style.animationTimingFunction = "linear";
    } else {
      element.style.animationDelay = "";
      element.style.animationDirection = "";
      element.style.animationDuration = "";
      element.style.animationFillMode = "";
      element.style.animationIterationCount = "";
      element.style.animationName = "";
      element.style.animationPlayState = "";
      element.style.animationTimingFunction = "";
    }
    if (oldIndex !== -1) {
      styleSheet.deleteRule(oldIndex);
    }
  }

  var animations = [];

  var interpolateValues = function (a, b, p) {
    return ((1 - p) * Number.parseFloat(a) + p * Number.parseFloat(b)).toString() + (a.indexOf("px") !== -1 ? "px" : "");
  };

  var addValues = function (a, b) {
    return (Number.parseFloat(a) + Number.parseFloat(b)).toString() + (a.indexOf("px") !== -1 ? "px" : "");
  };

  function Keyframe(opacity, transform) {
    this.opacity = opacity;
    this.transform = transform;
  }

  Keyframe.parseKeyframe = function (style) {
    return new Keyframe(style.opacity == undefined ? "" : style.opacity.toString().replace(/^\s+|\s+$/g, ""), style.transform == undefined ? "" : style.transform.toString().replace(/^\s+|\s+$/g, ""));
  };

  Keyframe.prototype.interpolate = function (keyframe, p) {
    var opacity = interpolateValues(this.opacity, keyframe.opacity, p);

    var toTransformList = function (transform) {
      var list = [];
      while (transform.length !== 0) {
        var match = /^\s*([a-z]+)\s*\(/.exec(transform);
        var opened = 1;
        var i = match == undefined ? transform.length : match[0].length;
        while (opened !== 0 && i < transform.length) {
          if (transform.charCodeAt(i) === "(".charCodeAt(0)) {
            opened += 1;
          }
          if (transform.charCodeAt(i) === ")".charCodeAt(0)) {
            opened -= 1;
          }
          i += 1;
        }
        if (opened !== 0) {
          throw new Error(transform);
        }
        var args = transform.slice(match[0].length, i - 1);
        transform = transform.slice(i).replace(/^\s+/, "");
        list.push({
          name: match[1],
          args: args.split(",")
        });
      }
      return list;
    };
    var a = toTransformList(this.transform);
    var b = toTransformList(keyframe.transform);
    var transform = "";
    if (a.length === 0 && b.length === 1 && b[0].name === "scale") {
      a = [{
        name: b[0].name,
        args: ["1"]
      }];
    }
    if (a.length === 0 && b.length === 1 && b[0].name === "translate") {
      a = [{
        name: b[0].name,
        args: ["0px", "0px"]
      }];
    }
    if (a.length !== b.length) {
      throw new Error("not implemented" + this.transform + " " + keyframe.transform);
    }
    for (var i = 0; i < a.length; i += 1) {
      if (a[i].name !== b[i].name || a[i].args.length !== b[i].args.length) {
        throw new Error("not implemented" + this.transform + " " + keyframe.transform);
      }
      transform += a[i].name + "(";
      for (var j = 0; j < a[i].args.length; j += 1) {
        transform += (j !== 0 ? "," : "");
        transform += interpolateValues(a[i].args[j], b[i].args[j], p);
      }
      transform += ") ";
    }
    return new Keyframe(opacity, transform);
  };

  Keyframe.prototype.add = function (keyframe, composite) {
    var opacity = keyframe.opacity !== "" ? (composite !== "add" ? keyframe.opacity : addValues(this.opacity, keyframe.opacity)) : this.opacity;
    var transform = keyframe.transform !== "" ?  (composite !== "add" ? keyframe.transform : this.transform + " " + keyframe.transform) : this.transform;
    return new Keyframe(opacity, transform);
  };

  Keyframe.prototype.toString = function () {
    var result = "";
    if (this.opacity !== "") {
      result += "opacity: " + this.opacity + ";";
    }
    if (this.transform !== "") {
      result += "transform: " + this.transform + ";";
    }
    return result;
  };

  Keyframe.willChange = "transform, opacity";

  Keyframe.getDefault = function () {
    return new Keyframe("1", "");
  };

  var updateAnimation = function (element, startTime, endTime) {
    var style = Keyframe.getDefault().add(Keyframe.parseKeyframe(element.style), "replace");
    var keyframes = [];
    for (var time = startTime; time < endTime; time += 1000 / 60) {
      var value = style;
      for (var i = 0; i < animations.length; i += 1) {
        var a = animations[i];
        if (a.element === element) {
          var timeFraction = (time - a.startTime) / a.duration;
          if (timeFraction < 0) {
            timeFraction = 0;
          }
          if (timeFraction > 1) {
            timeFraction = 1;
          }
          var p = easeInOut(timeFraction, 1000 / 60 / a.duration / 32);
          var frame0 = value.add(a.keyframes[0], a.composite);
          var frame1 = value.add(a.keyframes[1], a.composite);
          value = frame0.interpolate(frame1, p);
        }
      }
      keyframes.push(value.toString());
    }
    setAnimationStyles(element, keyframes, (endTime - startTime) / 1000);
  };
  
  if (Element.prototype.animate == undefined || global.KeyframeEffect == undefined) {
    Element.prototype.animate = function (frames, keyframeEffectOptions) {
      var now = Date.now();
      var keyframes = [];
      for (var j = 0; j < frames.length; j += 1) {
        keyframes.push(Keyframe.parseKeyframe(frames[j]));
      }
      var element = this;
      var animation = {
        element: element,
        keyframes: keyframes,
        duration: keyframeEffectOptions.duration,
        composite: keyframeEffectOptions.composite,
        startTime: now,
        endTime: now + keyframeEffectOptions.duration,
        onfinish: undefined
      };
      if (window.operamini == undefined &&
          ("animationName" in document.documentElement.style) &&
          ("transform" in document.documentElement.style) &&
          Number.parseFloat != undefined) {
        animations.push(animation);
        element.style.willChange = Keyframe.willChange;
        var endTime = 0;
        for (var i = 0; i < animations.length; i += 1) {
          if (animations[i].element === element) {
            endTime = Math.max(endTime, animations[i].endTime);
          }
        }
        updateAnimation(element, now, endTime);
        window.setTimeout(function () {
          var k = 0;
          var active = 0;
          for (var i = 0; i < animations.length; i += 1) {
            if (animations[i] !== animation) {
              if (animations[i].element === element) {
                active += 1;
              }
              animations[k] = animations[i];
              k += 1;
            }
          }
          animations.length = k;
          if (active === 0) {
            setAnimationStyles(element, undefined, 0);
            element.style.willChange = "";
          }
          if (animation.onfinish != undefined) {
            animation.onfinish();
          }
        }, animation.duration);
      } else {
        window.setTimeout(function () {
          if (animation.onfinish != undefined) {
            animation.onfinish();
          }
        }, 0);
      }
      return animation;
    };
  };

}(this));


(function (global) {
  "use strict";

  var isDOMAttrModifiedSupported = function () {
    var a = document.createElement("a");
    var flag = false;
    a.addEventListener("DOMAttrModified", function (event) {
      flag = true;
    }, false);
    a.setAttribute("data-test", "data-test");
    return flag;
  };

  if (global.MutationObserver == undefined && !isDOMAttrModifiedSupported()) {
    var setAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (name, value) {
      var event = document.createEvent("MutationEvent");
      event.initMutationEvent("DOMAttrModified", true, false, this, this.getAttribute(name), value, name, MutationEvent.ADDITION);
      this.dispatchEvent(event);
      setAttribute.call(this, name, value);
    };
    var removeAttribute = Element.prototype.removeAttribute;
    Element.prototype.removeAttribute = function (name) {
      var event = document.createEvent("MutationEvent");
      event.initMutationEvent("DOMAttrModified", true, false, this, this.getAttribute(name), "", name, MutationEvent.REMOVAL);
      this.dispatchEvent(event);
      removeAttribute.call(this, name);
    };
  }

}(this));

(function (global) {
  "use strict";

  function MutationObserver(callback) {
    this.callback = callback;
    this.listeners = [];
  }

  MutationObserver.prototype.observe = function (target, options) {
    var observer = this;
    var callback = this.callback;
    var attributeFilter = options.attributeFilter == undefined ? "" : options.attributeFilter.join(" ");
    var handler = function (event) {
      if ((event.attrName == undefined || event.attrName === "" || attributeFilter.indexOf(event.attrName) !== -1) && ((event.type === "DOMAttrModified" || event.type === "DOMCharacterDataModified" ? event.target : event.relatedNode) === event.currentTarget || options.subtree)) {
        //TODO: delay with some `asap`
        callback([{
          type: event.type === "DOMAttrModified" ? "attributes" : (event.type === "DOMCharacterDataModified" ? "characterData" : "childList"),
          target: event.type === "DOMAttrModified" || event.type === "DOMCharacterDataModified" ? event.target : event.relatedNode,
          addedNodes: event.type === "DOMNodeInserted" ? [event.target] : [],
          removedNodes: event.type === "DOMNodeRemoved" ? [event.target] : [],
          previousSibling: event.target.previousSibling,
          nextSibling: event.target.nextSibling,
          attributeName: event.attrName,
          attributeNamespace: undefined,
          oldValue: event.prevValue
        }], observer);
      }
    };
    this.listeners.push({
      target: target,
      handler: handler,
      options: options
    });
    if (options.attributes) {
      target.addEventListener("DOMAttrModified", handler, false);
    }
    if (options.characterData) {
      target.addEventListener("DOMCharacterDataModified", handler, false);
    }
    if (options.childList) {
      target.addEventListener("DOMNodeInserted", handler, false);
    }
    if (options.childList) {
      target.addEventListener("DOMNodeRemoved", handler, false);
    }
  };

  MutationObserver.prototype.disconnect = function () {
    while (this.listeners.length !== 0) {
      var listener = this.listeners.pop();
      var target = listener.target;
      var handler = listener.handler;
      var options = listener.options;
      if (options.attributes) {
        target.removeEventListener("DOMAttrModified", handler, false);
      }
      if (options.characterData) {
        target.removeEventListener("DOMCharacterDataModified", handler, false);
      }
      if (options.childList) {
        target.removeEventListener("DOMNodeInserted", handler, false);
      }
      if (options.childList) {
        target.removeEventListener("DOMNodeRemoved", handler, false);
      }
    }
  };

  MutationObserver.prototype.takeRecords = function() {
    return [];
  };

  if (global.MutationObserver == undefined) {
    global.MutationObserver = MutationObserver;
  }

}(this));

/*global document, window */

(function (global) {
  "use strict";

  var inert = {
    observers: [],
    dialogs: [],
  };
  inert.f = function (tabIndex) {
    return -42 - tabIndex;
  };
  inert.makeInert = function (node, dialog) {
    if (!dialog.contains(node)) {
      if (node.tabIndex >= 0) {
        node.tabIndex = this.f(node.tabIndex);
      }
      var c = node.firstElementChild;
      while (c != undefined) {
        this.makeInert(c, dialog);
        c = c.nextElementSibling;
      }
    }
  };
  inert.makeNonInert = function (node, dialog) {
    if (!dialog.contains(node)) {
      if (node.tabIndex <= this.f(0)) {
        node.tabIndex = this.f(node.tabIndex);
      }
      var c = node.firstElementChild;
      while (c != undefined) {
        this.makeNonInert(c, dialog);
        c = c.nextElementSibling;
      }
    }
  };
  inert.push = function (dialog) {
    this.makeInert(document.documentElement, dialog);
    var observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i += 1) {
        var mutation = mutations[i];
        if (inert.type === "attributes") {
          inert.makeInert(mutation.target, dialog);
        } else {
          var addedNodes = mutation.addedNodes;
          for (var j = 0; j < addedNodes.length; j += 1) {
            inert.makeInert(addedNodes[j], dialog);
          }
          var removedNodes = mutation.removedNodes;
          for (var k = 0; k < removedNodes.length; k += 1) {
            inert.makeNonInert(removedNodes[k], dialog);
          }
        }
      }
    });
    observer.observe(document.documentElement, {
      //attributeFilter: ["tabindex"]
      //attributes: true,
      childList: true,
      subtree: true,
    });
    this.dialogs.push(dialog);
    this.observers.push(observer);
  };
  inert.pop = function () {
    var dialog = this.dialogs.pop();
    var observer = this.observers.pop();
    observer.disconnect();
    this.makeNonInert(document.documentElement, dialog);
  };

  var show = function () {
    if (this.getAttribute("open") == undefined) {
      this.setAttribute("open", "open");
    }
  };

  var showModal = function () {
    if (this.getAttribute("open") == undefined) {
      this.setAttribute("data-modal", "data-modal");
      this.setAttribute("open", "open");
      inert.push(this);
      var autofocus = this.querySelector("*[autofocus]");
      autofocus.focus();
    }
  };

  var close = function (returnValue) {
    if (this.getAttribute("open") != undefined) {
      if (this.getAttribute("data-modal") != undefined) {
        this.removeAttribute("data-modal");
        inert.pop(this);
      }
      this.removeAttribute("open");
      this.returnValue = returnValue;
      var event = document.createEvent("Event");
      event.initEvent("close", false, false);
      this.dispatchEvent(event);
    }
  };

  // var dialog = document.createElement("dialog");
  // dialog.initDialog();
  // document.body.appendChild(dialog);
  // dialog.showModal();

  //!
  Element.prototype.initDialog = function () {
    var dialog = this;
    dialog.setAttribute("role", "dialog");
    if (dialog.show == undefined || dialog.showModal == undefined || dialog.close == undefined) {
      dialog.show = show;
      dialog.showModal = showModal;
      dialog.close = close;
      dialog.returnValue = undefined;
      dialog.addEventListener("keydown", function (event) {
        var DOM_VK_ESCAPE = 27;
        if (event.keyCode === DOM_VK_ESCAPE && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && !event.defaultPrevented) {
          event.preventDefault();
          this.close(undefined);
        }
      }, false);
      dialog.addEventListener("submit", function (event) {
        event.preventDefault();
        this.close(event.target.getAttribute("value"));
      }, false);
    }
  };

}(this));


(function () {
  "use strict";

  Element.prototype.initDetails = function () {
    var details = this;
    var summary = details.querySelector("summary");
    if (summary == undefined) {
      summary = details.querySelector(".summary");// backward compatibility
    }
    details.setAttribute("role", "group");
    details.setAttribute("aria-expanded", "false");
    summary.setAttribute("role", "button");
    summary.setAttribute("tabindex", "0");
    summary.addEventListener("click", function (event) {
      var summary = this;
      var details = summary.parentNode;
      event.preventDefault();
      var isOpen = details.getAttribute("open") != undefined;
      if (!isOpen) {
        details.setAttribute("aria-expanded", "true");
        details.setAttribute("open", "open");
      } else {
        details.setAttribute("aria-expanded", "false");
        details.removeAttribute("open");
      }
      summary.focus();
      var e = document.createEvent("Event");
      e.initEvent("toggle", false, false);
      details.dispatchEvent(e);
    }, false);
    // role="button" => click should be fired with SPACE key too
    summary.addEventListener("keydown", function (event) {
      var DOM_VK_SPACE = 32;
      if (event.keyCode === DOM_VK_SPACE && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && !event.defaultPrevented) {
        event.preventDefault(); // scrolling
      }
    }, false);
    summary.addEventListener("keyup", function (event) {
      var DOM_VK_SPACE = 32;
      if (event.keyCode === DOM_VK_SPACE && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && !event.defaultPrevented) {
        event.preventDefault();
        this.click();
      }
    }, false);    
  };

}());

/*global Node, window, document*/

(function () {
  "use strict";
  
  var operators = {
    ",": {c: ",", p: -10},//?
    "&rarr;": {c: "->", p: -9},//?
    "&harr;": {c: "<->", p: -9},//?
    ".^": {c: ".^", p: 7},
    "^": {c: "^", p: 6},
    "&times;": {c: "*", p: 5},
    "/": {c: "/", p: 4},
    "&minus;": {c: "-", p: 3},
    "+": {c: "+", p: 2}
  };

  var newTable = {};

  var keys = Object.keys(operators);
  for (var i = 0; i < keys.length; i += 1) {
    var div = document.createElement("div");
    div.innerHTML = keys[i];
    newTable[div.innerHTML] = operators[keys[i]];
  }

  var isRightToLeftAssociative = function (operator) {
    return operator === "^" || operator === ".^";
  };

  var fence = function (x, operator, left) {
    return (x.precedence < operators[operator].p || (x.precedence === operators[operator].p && (left && !isRightToLeftAssociative(x) || !left && isRightToLeftAssociative(x)))) ? "(" + x.string + ")" : x.string;
  };

  var transformMTABLE = function (node) {
    var childNode = node.firstElementChild;
    var rows = "";
    while (childNode != undefined) {
      if (childNode.tagName.toUpperCase() === "MTR") {
        var c = childNode.firstElementChild;
        var row = "";
        while (c != undefined) {
          if (c.tagName.toUpperCase() === "MTD") {
            row += (row !== "" ? ", " : "") + fence(transformMathML(c), ",", true);
          }
          c = c.nextElementSibling;
        }
        rows += (rows !== "" ? ", " : "") + "{" + row + "}";
      }
      childNode = childNode.nextElementSibling;
    }
    return "{" + rows + "}"; // "(" + ... + ")" ?
  };
  
  function TransformResult(string, precedence) {
    this.string = string;
    this.precedence = precedence;
  }

  var transformMathML = function (node) {
    var nodeName = node.tagName.toUpperCase();
    if (nodeName === "MTD" ||
        nodeName === "MROW" ||
        nodeName === "MENCLOSE" ||
        nodeName === "MFENCED" ||
        nodeName === "MO" ||
        nodeName === "MI" ||
        nodeName === "MN") {
      var childNode = node.firstChild;
      var s = "";
      var p = 42;
      while (childNode != undefined) {
        if (childNode.nodeType === Node.TEXT_NODE) {
          s += childNode.nodeValue;
        } else if (childNode.nodeType === Node.ELEMENT_NODE) {
          var tmp = transformMathML(childNode);
          s += tmp.string;
          p = Math.min(p, tmp.precedence);
        }
        childNode = childNode.nextSibling;
      }
      if (nodeName === "MO") {
        p = Math.min(p, newTable[s] == undefined ? 0 : newTable[s].p);
        s = newTable[s] == undefined ? s : newTable[s].c;
      }
      return nodeName === "MFENCED" ? new TransformResult(node.getAttribute("open") + s + node.getAttribute("close"), 42) : new TransformResult(s, p);
    }
    if (nodeName === "MSUP") {
      return new TransformResult(fence(transformMathML(node.firstElementChild), "^", true) + "^" + fence(transformMathML(node.firstElementChild.nextElementSibling), "^", false), operators["^"].p);
    }
    if (nodeName === "MSUB") {
      //TODO: fix a_(1,2) ?
      var x = transformMathML(node.firstElementChild.nextElementSibling).string;
      return new TransformResult(transformMathML(node.firstElementChild).string + "_" + (x.indexOf(",") !== -1 ? "(" + x + ")" : x), 42); // "(" + ... + ")" ?
    }
    if (nodeName === "MFRAC") {
      return new TransformResult(fence(transformMathML(node.firstElementChild), "/", true) + "/" + fence(transformMathML(node.firstElementChild.nextElementSibling), "/", false), operators["/"].p);
    }
    if (nodeName === "MSQRT") {
      return new TransformResult("sqrt(" + transformMathML(node.firstElementChild).string + ")", 42);
    }
    if (nodeName === "MTABLE") {
      return new TransformResult(transformMTABLE(node), 42);
    }
    if (nodeName === "MTEXT") {//?
      var range = document.createRange();
      range.setStart(node, 0);
      range.setEnd(node, getLength(node));
      var ss = serialize(range, false, specialSerializer).replace(/^\s+|\s+$/g, "");
      return new TransformResult(ss === "" ? "" : "text(" + ss + ")", 42);
    }
    throw new Error("transformMathML:" + nodeName);
  };

  var isBlock = function (display) {
    switch (display) {
      case "inline":
      case "inline-block":
      case "inline-flex":
      case "inline-grid":
      case "inline-table":
      case "none":
      case "table-column":
      case "table-column-group":
      case "table-cell":
        return false;
    }
    return true;
  };

  var getLength = function (container) {
    if (container.nodeType === Node.TEXT_NODE) {
      return container.nodeValue.length;
    }
    if (container.nodeType === Node.ELEMENT_NODE) {
      var i = 0;
      var child = container.firstChild;
      while (child != undefined) {
        child = child.nextSibling;
        i += 1;
      }
      return i;
    }
  };

  var getChildNode = function (container, offset, node, roundUp) {
    var child = undefined;
    var x = container;
    var intersectsAll = (roundUp ? offset === getLength(container) : offset === 0);
    while (x !== node) {
      child = x;
      intersectsAll = intersectsAll && (roundUp ? child.nextSibling == undefined : child.previousSibling == undefined);
      x = x.parentNode;
    }
    if (child != undefined) {
      return [roundUp ? child.nextSibling : child, intersectsAll];
    }
    var i = -1;
    child = container.firstChild; // node === container
    while (++i < offset) {
      child = child.nextSibling;
    }
    return [child, intersectsAll];
  };

  var serialize = function (range, isLineStart, specialSerializer) {
    // big thanks to everyone
    // see https://github.com/timdown/rangy/blob/master/src/modules/rangy-textrange.js
    // see https://github.com/WebKit/webkit/blob/ec2f4d46b97bb20fd0877b1f4b5ec50f7b9ec521/Source/WebCore/editing/TextIterator.cpp#L1188
    // see https://github.com/jackcviers/Rangy/blob/master/spec/innerText.htm

    var node = range.commonAncestorContainer;
    var startContainer = range.startContainer;
    var startOffset = range.startOffset;
    var endContainer = range.endContainer;
    var endOffset = range.endOffset;

    if (node.nodeType === Node.TEXT_NODE) {
      var nodeValue = node.nodeValue.slice(node === startContainer ? startOffset : 0, node === endContainer ? endOffset : Infinity);
      nodeValue = nodeValue.replace(/[\x20\n\r\t\v]+/g, " ");
      if (isLineStart) {
        nodeValue = nodeValue.replace(/^[\x20\n\r\t\v]/g, "");
      }
      return nodeValue;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      var display = window.getComputedStyle(node, undefined).display;
      if (display === "none") {
        return "";
      }
      var intersectsAll = true;
      var tmp0 = getChildNode(startContainer, startOffset, node, false);
      var startChildNode = tmp0[0];
      intersectsAll = intersectsAll && tmp0[1];
      var tmp1 = getChildNode(endContainer, endOffset, node, true);
      var endChildNode = tmp1[0];
      intersectsAll = intersectsAll && tmp1[1];
      var childNode = startChildNode;
      var result = "";
      if (isBlock(display) && !isLineStart) {
        result += "\n";
        isLineStart = true;
      }
      var x = undefined;
      if (intersectsAll) {
         x = specialSerializer(node);
      }
      if (x != undefined) {
        result += x;
      } else {
        while (childNode !== endChildNode) {
          var childNodeRange = document.createRange();
          childNodeRange.setStart(childNode, 0);
          childNodeRange.setEnd(childNode, getLength(childNode));
          if (childNode === startChildNode && startContainer !== node) {
            childNodeRange.setStart(startContainer, startOffset);
          }
          if (childNode.nextSibling === endChildNode && endContainer !== node) {
            childNodeRange.setEnd(endContainer, endOffset);
          }
          var v = serialize(childNodeRange, isLineStart, specialSerializer);
          isLineStart = v === "" && isLineStart || v.slice(-1) === "\n";
          result += v;
          childNode = childNode.nextSibling;
        }
      }
      if (display === "table-cell") {
        result += "\t";
      }
      if (isBlock(display) && !isLineStart) {
        result = result.replace(/[\x20\n\r\t\v]$/g, "");
        result += "\n";
        isLineStart = true;
      }
      return result;
    }
    return "";
  };

  var serializePlainText = function (range, specialSerializer) {
    var isLineStart = !(range.startContainer.nodeType === Node.TEXT_NODE && range.startContainer.nodeValue.slice(0, range.startOffset).replace(/\s+/, "") !== "");
    var isLineEnd = !(range.endContainer.nodeType === Node.TEXT_NODE && range.endContainer.nodeValue.slice(range.endOffset, Infinity).replace(/\s+/, "") !== "");
    var value = serialize(range, false, specialSerializer);
    if (isLineStart) {
      value = value.replace(/^\s/g, "");
    }
    if (isLineEnd) {
      value = value.replace(/\s$/g, "");
    }
    return value;
  };

  var specialSerializer = function (node) {
    var tagName = node.tagName.toUpperCase();
    if (tagName.charCodeAt(0) === "M".charCodeAt(0) &&
        tagName !== "MENU" &&
        tagName !== "MENUITEM" &&
        tagName !== "MAIN" &&
        tagName !== "METER" &&
        tagName !== "MO" &&
        tagName !== "MTEXT" && // to avoid infinite recursion
        tagName !== "MTR" &&
        tagName !== "MUNDER") {
      try {
        return transformMathML(node).string;
      } catch (error) {
        if (error.message !== "transformMathML") {
          window.setTimeout(function () {
            throw error;
          }, 0);
        }
      }
    }
    return undefined;
  };

  var onCopy = function (event) {
    var dataTransfer = event.type === "copy" ? event.clipboardData : event.dataTransfer;
    var tagName = event.target.nodeType === Node.ELEMENT_NODE ? event.target.tagName.toUpperCase() : "";
    if ("\v" !== "v" && tagName !== "INPUT" && tagName !== "TEXTAREA" && tagName !== "A" && tagName !== "IMG") {
      //! dataTransfer.effectAllowed throws an exception in FireFox if tagName is INPUT or TEXTAREA
      if ((event.type === "copy" || dataTransfer.effectAllowed === "uninitialized") && !event.defaultPrevented) {
        var serializeHTML = function (range) {
          var fragment = range.cloneContents();
          var div = document.createElement("div");
          div.appendChild(fragment);
          return div.innerHTML;
        };
        var selection = window.getSelection();
        var rangeCount = selection.rangeCount;
        if (rangeCount !== 0) {
          var i = -1;
          var plainText = "";
          var htmlText = "";
          while (++i < rangeCount) {
            var range = selection.getRangeAt(i);
            htmlText += serializeHTML(range);
            plainText += serializePlainText(range, specialSerializer);
          }
          try {
            dataTransfer.setData("Text", plainText);
            dataTransfer.setData("text/html", htmlText);
          } catch (error) {
            // IE
          }
          if (event.type === "copy") {
            event.preventDefault();
          }
        }
      }
    }
  };

  document.addEventListener("copy", onCopy, false);
  document.addEventListener("dragstart", onCopy, false);
}());

/*jslint plusplus: true, vars: true, indent: 2 */

(function (exports) {
  "use strict";

  if (Math.trunc == undefined) {
    Math.trunc = function (x) {
      return x < 0 ? Math.ceil(x) : Math.floor(x);
    };
  }
  if (Math.sign == undefined) {
    Math.sign = function (x) {
      return x < 0 ? -1 : (x > 0 ? +1 : 0 * x);
    };
  }
  if (Number.EPSILON == undefined) {
    Number.EPSILON = (function (x) {
      return x(x, 1 / 4503599627370496);
    }(function (f, epsilon) {
      return (1 + epsilon / 2) !== 1 ? f(f, epsilon / 2) : epsilon;
    }));
  }

  // BigInteger.js
  // Available under Public Domain
  // https://github.com/Yaffle/BigInteger/

  // For implementation details, see "The Handbook of Applied Cryptography"
  // http://www.cacr.math.uwaterloo.ca/hac/about/chap14.pdf

  var parseInteger = function (s, from, to, radix) {
    var i = from - 1;
    var n = 0;
    var y = radix < 10 ? radix : 10;
    while (++i < to) {
      var code = s.charCodeAt(i);
      var v = code - 48;
      if (v < 0 || y <= v) {
        v = 10 - 65 + code;
        if (v < 10 || radix <= v) {
          v = 10 - 97 + code;
          if (v < 10 || radix <= v) {
            throw new RangeError();
          }
        }
      }
      n = n * radix + v;
    }
    return n;
  };

  var createArray = function (length) {
    var x = new Array(length);
    var i = -1;
    while (++i < length) {
      x[i] = 0;
    }
    return x;
  };

  // count >= 1
  var pow = function (x, count) {
    var accumulator = 1;
    var v = x;
    var c = count;
    while (c > 1) {
      var q = Math.trunc(c / 2);
      if (q * 2 !== c) {
        accumulator *= v;
      }
      v *= v;
      c = q;
    }
    return accumulator * v;
  };

  var BASE = 2 / Number.EPSILON;
  var SPLIT = 67108864 * pow(2, Math.trunc((Math.trunc(Math.log(BASE) / Math.log(2) + 0.5) - 53) / 2) + 1) + 1;

  var fastTrunc = function (x) {
    var v = (x - BASE) + BASE;
    return v > x ? v - 1 : v;
  };

  // Veltkamp-Dekker's algorithm
  // see http://web.mit.edu/tabbott/Public/quaddouble-debian/qd-2.3.4-old/docs/qd.pdf
  // with FMA:
  // var product = a * b;
  // var error = Math.fma(a, b, -product);
  var performMultiplication = function (carry, a, b) {
    var at = SPLIT * a;
    var ahi = at - (at - a);
    var alo = a - ahi;
    var bt = SPLIT * b;
    var bhi = bt - (bt - b);
    var blo = b - bhi;
    var product = a * b;
    var error = ((ahi * bhi - product) + ahi * blo + alo * bhi) + alo * blo;

    var hi = fastTrunc(product / BASE);
    var lo = product - hi * BASE + error;

    if (lo < 0) {
      lo += BASE;
      hi -= 1;
    }

    lo += carry - BASE;
    if (lo < 0) {
      lo += BASE;
    } else {
      hi += 1;
    }

    return {lo: lo, hi: hi};
  };

  var performDivision = function (a, b, divisor) {
    if (a >= divisor) {
      throw new RangeError();
    }
    var p = a * BASE;
    var y = p / divisor;
    var r = p % divisor;
    var q = fastTrunc(y);
    if (y === q && r > divisor - r) {
      q -= 1;
    }
    r += b - divisor;
    if (r < 0) {
      r += divisor;
    } else {
      q += 1;
    }
    y = fastTrunc(r / divisor);
    r -= y * divisor;
    q += y;
    return {q: q, r: r};
  };

  function BigInteger(signum, magnitude, length) {
    this.signum = signum;
    this.magnitude = magnitude;
    this.length = length;
  }

  var createBigInteger = function (signum, magnitude, length) {
    return length < 2 ? (length === 0 ? 0 : (signum < 0 ? 0 - magnitude[0] : magnitude[0])) : new BigInteger(signum, magnitude, length);
  };

  var parseBigInteger = function (s, radix) {
    if (radix === undefined) {
      radix = 10;
    }
    if (Math.trunc(radix) !== radix || !(radix >= 2 && radix <= 36)) {
      throw new RangeError("radix argument must be an integer between 2 and 36");
    }
    var length = s.length;
    if (length === 0) {
      throw new RangeError();
    }
    var signum = 1;
    var signCharCode = s.charCodeAt(0);
    var from = 0;
    if (signCharCode === 43) { // "+"
      from = 1;
    }
    if (signCharCode === 45) { // "-"
      from = 1;
      signum = -1;
    }

    length -= from;
    if (length === 0) {
      throw new RangeError();
    }
    if (pow(radix, length) <= BASE) {
      var value = parseInteger(s, from, from + length, radix);
      return signum < 0 ? 0 - value : value;
    }
    var groupLength = 0;
    var groupRadix = 1;
    var limit = fastTrunc(BASE / radix);
    while (groupRadix <= limit) {
      groupLength += 1;
      groupRadix *= radix;
    }
    var size = Math.trunc((length - 1) / groupLength) + 1;

    var magnitude = createArray(size);
    var k = size;
    var i = length;
    while (i > 0) {
      k -= 1;
      magnitude[k] = parseInteger(s, from + (i > groupLength ? i - groupLength : 0), from + i, radix);
      i -= groupLength;
    }

    var j = -1;
    while (++j < size) {
      var c = magnitude[j];
      var l = -1;
      while (++l < j) {
        var tmp = performMultiplication(c, magnitude[l], groupRadix, magnitude, l);
        var lo = tmp.lo;
        var hi = tmp.hi;
        magnitude[l] = lo;
        c = hi;
      }
      magnitude[j] = c;
    }

    while (size > 0 && magnitude[size - 1] === 0) {
      size -= 1;
    }

    return createBigInteger(size === 0 ? 0 : signum, magnitude, size);
  };

  var compareMagnitude = function (aMagnitude, aLength, aValue, bMagnitude, bLength, bValue) {
    if (aLength !== bLength) {
      return aLength < bLength ? -1 : +1;
    }
    var i = aLength;
    while (--i >= 0) {
      if ((aMagnitude === undefined ? aValue : aMagnitude[i]) !== (bMagnitude === undefined ? bValue : bMagnitude[i])) {
        return (aMagnitude === undefined ? aValue : aMagnitude[i]) < (bMagnitude === undefined ? bValue : bMagnitude[i]) ? -1 : +1;
      }
    }
    return 0;
  };

  var compareTo = function (aSignum, aMagnitude, aLength, aValue, bSignum, bMagnitude, bLength, bValue) {
    if (aSignum === bSignum) {
      var c = compareMagnitude(aMagnitude, aLength, aValue, bMagnitude, bLength, bValue);
      return aSignum < 0 ? 0 - c : c; // positive zero will be returned for c === 0
    }
    if (aSignum === 0) {
      return 0 - bSignum;
    }
    return aSignum;
  };

  var add = function (aSignum, aMagnitude, aLength, aValue, bSignum, bMagnitude, bLength, bValue) {
    var z = compareMagnitude(aMagnitude, aLength, aValue, bMagnitude, bLength, bValue);
    var minSignum = z < 0 ? aSignum : bSignum;
    var minMagnitude = z < 0 ? aMagnitude : bMagnitude;
    var minLength = z < 0 ? aLength : bLength;
    var minValue = z < 0 ? aValue : bValue;
    var maxSignum = z < 0 ? bSignum : aSignum;
    var maxMagnitude = z < 0 ? bMagnitude : aMagnitude;
    var maxLength = z < 0 ? bLength : aLength;
    var maxValue = z < 0 ? bValue : aValue;

    // |a| <= |b|
    if (minSignum === 0) {
      return maxMagnitude === undefined ? (maxSignum < 0 ? 0 - maxValue : maxValue) : createBigInteger(maxSignum, maxMagnitude, maxLength);
    }
    var subtract = 0;
    var resultLength = maxLength;
    if (minSignum !== maxSignum) {
      subtract = 1;
      if (minLength === resultLength) {
        while (resultLength > 0 && (minMagnitude === undefined ? minValue : minMagnitude[resultLength - 1]) === (maxMagnitude === undefined ? maxValue : maxMagnitude[resultLength - 1])) {
          resultLength -= 1;
        }
      }
      if (resultLength === 0) { // a === (-b)
        return createBigInteger(0, createArray(0), 0);
      }
    }
    // result !== 0
    var result = createArray(resultLength + (1 - subtract));
    var i = -1;
    var c = 0;
    while (++i < resultLength) {
      var aDigit = i < minLength ? (minMagnitude === undefined ? minValue : minMagnitude[i]) : 0;
      c += (maxMagnitude === undefined ? maxValue : maxMagnitude[i]) + (subtract === 1 ? 0 - aDigit : aDigit - BASE);
      if (c < 0) {
        result[i] = BASE + c;
        c = 0 - subtract;
      } else {
        result[i] = c;
        c = 1 - subtract;
      }
    }
    if (c !== 0) {
      result[resultLength] = c;
      resultLength += 1;
    }
    while (resultLength > 0 && result[resultLength - 1] === 0) {
      resultLength -= 1;
    }
    return createBigInteger(maxSignum, result, resultLength);
  };

  var multiply = function (aSignum, aMagnitude, aLength, aValue, bSignum, bMagnitude, bLength, bValue) {
    if (aLength === 0 || bLength === 0) {
      return createBigInteger(0, createArray(0), 0);
    }
    var resultSign = aSignum < 0 ? 0 - bSignum : bSignum;
    if (aLength === 1 && (aMagnitude === undefined ? aValue : aMagnitude[0]) === 1) {
      return bMagnitude === undefined ? (resultSign < 0 ? 0 - bValue : bValue) : createBigInteger(resultSign, bMagnitude, bLength);
    }
    if (bLength === 1 && (bMagnitude === undefined ? bValue : bMagnitude[0]) === 1) {
      return aMagnitude === undefined ? (resultSign < 0 ? 0 - aValue : aValue) : createBigInteger(resultSign, aMagnitude, aLength);
    }
    var resultLength = aLength + bLength;
    var result = createArray(resultLength);
    var i = -1;
    while (++i < bLength) {
      var c = 0;
      var j = -1;
      while (++j < aLength) {
        var carry = 0;
        c += result[j + i] - BASE;
        if (c >= 0) {
          carry = 1;
        } else {
          c += BASE;
        }
        var tmp = performMultiplication(c, aMagnitude === undefined ? aValue : aMagnitude[j], bMagnitude === undefined ? bValue : bMagnitude[i]);
        var lo = tmp.lo;
        var hi = tmp.hi;
        result[j + i] = lo;
        c = hi + carry;
      }
      result[aLength + i] = c;
    }
    while (resultLength > 0 && result[resultLength - 1] === 0) {
      resultLength -= 1;
    }
    return createBigInteger(resultSign, result, resultLength);
  };

  var divideAndRemainder = function (aSignum, aMagnitude, aLength, aValue, bSignum, bMagnitude, bLength, bValue, divide) {
    if (bLength === 0) {
      throw new RangeError();
    }
    if (aLength === 0) {
      return createBigInteger(0, createArray(0), 0);
    }
    var quotientSign = aSignum < 0 ? 0 - bSignum : bSignum;
    if (bLength === 1 && (bMagnitude === undefined ? bValue : bMagnitude[0]) === 1) {
      if (divide === 1) {
        return aMagnitude === undefined ? (quotientSign < 0 ? 0 - aValue : aValue) : createBigInteger(quotientSign, aMagnitude, aLength);
      }
      return createBigInteger(0, createArray(0), 0);
    }

    var divisorOffset = aLength + 1; // `+ 1` for extra digit in case of normalization
    var divisorAndRemainder = createArray(divisorOffset + bLength + 1); // `+ 1` to avoid `index < length` checks
    var divisor = divisorAndRemainder;
    var remainder = divisorAndRemainder;
    var n = -1;
    while (++n < aLength) {
      remainder[n] = aMagnitude === undefined ? aValue : aMagnitude[n];
    }
    var m = -1;
    while (++m < bLength) {
      divisor[divisorOffset + m] = bMagnitude === undefined ? bValue : bMagnitude[m];
    }

    var top = divisor[divisorOffset + bLength - 1];

    // normalization
    var lambda = 1;
    if (bLength > 1) {
      lambda = fastTrunc(BASE / (top + 1));
      if (lambda > 1) {
        var carry = 0;
        var l = -1;
        while (++l < divisorOffset + bLength) {
          var tmp = performMultiplication(carry, divisorAndRemainder[l], lambda);
          var lo = tmp.lo;
          var hi = tmp.hi;
          divisorAndRemainder[l] = lo;
          carry = hi;
        }
        divisorAndRemainder[divisorOffset + bLength] = carry;
        top = divisor[divisorOffset + bLength - 1];
      }
      // assertion
      if (top < fastTrunc(BASE / 2)) {
        throw new RangeError();
      }
    }

    var shift = aLength - bLength + 1;
    if (shift < 0) {
      shift = 0;
    }
    var quotient = undefined;
    var quotientLength = 0;

    var i = shift;
    while (--i >= 0) {
      var t = bLength + i;
      var q = BASE - 1;
      if (remainder[t] !== top) {
        var tmp2 = performDivision(remainder[t], remainder[t - 1], top);
        var q2 = tmp2.q;
        var r2 = tmp2.r;
        q = q2;
      }

      var ax = 0;
      var bx = 0;
      var j = i - 1;
      while (++j <= t) {
        var rj = remainder[j];
        var tmp3 = performMultiplication(bx, q, divisor[divisorOffset + j - i]);
        var lo3 = tmp3.lo;
        var hi3 = tmp3.hi;
        remainder[j] = lo3;
        bx = hi3;
        ax += rj - remainder[j];
        if (ax < 0) {
          remainder[j] = BASE + ax;
          ax = -1;
        } else {
          remainder[j] = ax;
          ax = 0;
        }
      }
      while (ax !== 0) {
        q -= 1;
        var c = 0;
        var k = i - 1;
        while (++k <= t) {
          c += remainder[k] - BASE + divisor[divisorOffset + k - i];
          if (c < 0) {
            remainder[k] = BASE + c;
            c = 0;
          } else {
            remainder[k] = c;
            c = +1;
          }
        }
        ax += c;
      }
      if (divide === 1 && q !== 0) {
        if (quotientLength === 0) {
          quotientLength = i + 1;
          quotient = createArray(quotientLength);
        }
        quotient[i] = q;
      }
    }

    if (divide === 1) {
      if (quotientLength === 0) {
        return createBigInteger(0, createArray(0), 0);
      }
      return createBigInteger(quotientSign, quotient, quotientLength);
    }

    var remainderLength = aLength + 1;
    if (lambda > 1) {
      var r = 0;
      var p = remainderLength;
      while (--p >= 0) {
        var tmp4 = performDivision(r, remainder[p], lambda);
        var q4 = tmp4.q;
        var r4 = tmp4.r;
        remainder[p] = q4;
        r = r4;
      }
      if (r !== 0) {
        // assertion
        throw new RangeError();
      }
    }
    while (remainderLength > 0 && remainder[remainderLength - 1] === 0) {
      remainderLength -= 1;
    }
    if (remainderLength === 0) {
      return createBigInteger(0, createArray(0), 0);
    }
    var result = createArray(remainderLength);
    var o = -1;
    while (++o < remainderLength) {
      result[o] = remainder[o];
    }
    return createBigInteger(aSignum, result, remainderLength);
  };

  var toString = function (signum, magnitude, length, radix) {
    var result = signum < 0 ? "-" : "";

    var remainderLength = length;
    if (remainderLength === 0) {
      return "0";
    }
    if (remainderLength === 1) {
      result += magnitude[0].toString(radix);
      return result;
    }
    var groupLength = 0;
    var groupRadix = 1;
    var limit = fastTrunc(BASE / radix);
    while (groupRadix <= limit) {
      groupLength += 1;
      groupRadix *= radix;
    }
    // assertion
    if (groupRadix * radix <= BASE) {
      throw new RangeError();
    }
    var size = remainderLength + Math.trunc((remainderLength - 1) / groupLength) + 1;
    var remainder = createArray(size);
    var n = -1;
    while (++n < remainderLength) {
      remainder[n] = magnitude[n];
    }

    var k = size;
    while (remainderLength !== 0) {
      var groupDigit = 0;
      var i = remainderLength;
      while (--i >= 0) {
        var tmp = performDivision(groupDigit, remainder[i], groupRadix);
        var q = tmp.q;
        var r = tmp.r;
        remainder[i] = q;
        groupDigit = r;
      }
      while (remainderLength > 0 && remainder[remainderLength - 1] === 0) {
        remainderLength -= 1;
      }
      k -= 1;
      remainder[k] = groupDigit;
    }
    result += remainder[k].toString(radix);
    while (++k < size) {
      var t = remainder[k].toString(radix);
      var j = groupLength - t.length;
      while (--j >= 0) {
        result += "0";
      }
      result += t;
    }
    return result;
  };

  BigInteger.parseInt = parseBigInteger;

  Number.prototype["BigInteger.toString"] = Number.prototype.toString;
  Number.prototype["BigInteger.compareTo"] = function (y) {
    return y["BigInteger.compareToNumber"](this);
  };
  Number.prototype["BigInteger.negate"] = function () {
    return 0 - this;
  };
  Number.prototype["BigInteger.add"] = function (y) {
    return y["BigInteger.addNumber"](this);
  };
  Number.prototype["BigInteger.subtract"] = function (y) {
    return y["BigInteger.subtractNumber"](this);
  };
  Number.prototype["BigInteger.multiply"] = function (y) {
    return y["BigInteger.multiplyNumber"](this);
  };
  Number.prototype["BigInteger.divide"] = function (y) {
    return y["BigInteger.divideNumber"](this);
  };
  Number.prototype["BigInteger.remainder"] = function (y) {
    return y["BigInteger.remainderNumber"](this);
  };

  Number.prototype["BigInteger.compareToBigInteger"] = function (x) {
    return compareTo(x.signum, x.magnitude, x.length, 0, Math.sign(this), undefined, Math.sign(Math.abs(this)), Math.abs(this));
  };
  Number.prototype["BigInteger.addBigInteger"] = function (x) {
    return add(x.signum, x.magnitude, x.length, 0, Math.sign(this), undefined, Math.sign(Math.abs(this)), Math.abs(this));
  };
  Number.prototype["BigInteger.subtractBigInteger"] = function (x) {
    return add(x.signum, x.magnitude, x.length, 0, 0 - Math.sign(this), undefined, Math.sign(Math.abs(this)), Math.abs(this));
  };
  Number.prototype["BigInteger.multiplyBigInteger"] = function (x) {
    return multiply(x.signum, x.magnitude, x.length, 0, Math.sign(this), undefined, Math.sign(Math.abs(this)), Math.abs(this));
  };
  Number.prototype["BigInteger.divideBigInteger"] = function (x) {
    return divideAndRemainder(x.signum, x.magnitude, x.length, 0, Math.sign(this), undefined, Math.sign(Math.abs(this)), Math.abs(this), 1);
  };
  Number.prototype["BigInteger.remainderBigInteger"] = function (x) {
    return divideAndRemainder(x.signum, x.magnitude, x.length, 0, Math.sign(this), undefined, Math.sign(Math.abs(this)), Math.abs(this), 0);
  };

  Number.prototype["BigInteger.compareToNumber"] = function (x) {
    return x < this ? -1 : (this < x ? +1 : 0);
  };
  Number.prototype["BigInteger.addNumber"] = function (x) {
    var value = x + this;
    if (value > -BASE && value < +BASE) {
      return value;
    }
    return add(Math.sign(x), undefined, Math.sign(Math.abs(x)), Math.abs(x), Math.sign(this), undefined, Math.sign(Math.abs(this)), Math.abs(this));
  };
  Number.prototype["BigInteger.subtractNumber"] = function (x) {
    var value = x - this;
    if (value > -BASE && value < +BASE) {
      return value;
    }
    return add(Math.sign(x), undefined, Math.sign(Math.abs(x)), Math.abs(x), 0 - Math.sign(this), undefined, Math.sign(Math.abs(this)), Math.abs(this));
  };
  Number.prototype["BigInteger.multiplyNumber"] = function (x) {
    var value = 0 + x * this;
    if (value > -BASE && value < +BASE) {
      return value;
    }
    return multiply(Math.sign(x), undefined, Math.sign(Math.abs(x)), Math.abs(x), Math.sign(this), undefined, Math.sign(Math.abs(this)), Math.abs(this));
  };
  Number.prototype["BigInteger.divideNumber"] = function (x) {
    if (0 + this === 0) {
      throw new RangeError();
    }
    // `0 + Math.trunc(x / this)` is slow in Chrome
    return 0 + Math.sign(x) * Math.sign(this) * Math.floor(Math.abs(x) / Math.abs(this));
  };
  Number.prototype["BigInteger.remainderNumber"] = function (x) {
    if (0 + this === 0) {
      throw new RangeError();
    }
    return 0 + x % this;
  };

  function F() {
  }
  F.prototype = Number.prototype;

  BigInteger.prototype = new F();

  BigInteger.prototype.toString = function (radix) {
    if (radix === undefined) {
      radix = 10;
    }
    if (Math.trunc(radix) !== radix || !(radix >= 2 && radix <= 36)) {
      throw new RangeError("radix argument must be an integer between 2 and 36");
    }
    return toString(this.signum, this.magnitude, this.length, radix);
  };
  BigInteger.prototype["BigInteger.toString"] = BigInteger.prototype.toString;
  BigInteger.prototype["BigInteger.compareTo"] = function (y) {
    return y["BigInteger.compareToBigInteger"](this);
  };
  BigInteger.prototype["BigInteger.negate"] = function () {
    return createBigInteger(0 - this.signum, this.magnitude, this.length);
  };
  BigInteger.prototype["BigInteger.add"] = function (y) {
    return y["BigInteger.addBigInteger"](this);
  };
  BigInteger.prototype["BigInteger.subtract"] = function (y) {
    return y["BigInteger.subtractBigInteger"](this);
  };
  BigInteger.prototype["BigInteger.multiply"] = function (y) {
    return y["BigInteger.multiplyBigInteger"](this);
  };
  BigInteger.prototype["BigInteger.divide"] = function (y) {
    return y["BigInteger.divideBigInteger"](this);
  };
  BigInteger.prototype["BigInteger.remainder"] = function (y) {
    return y["BigInteger.remainderBigInteger"](this);
  };

  BigInteger.prototype["BigInteger.compareToBigInteger"] = function (x) {
    return compareTo(x.signum, x.magnitude, x.length, 0, this.signum, this.magnitude, this.length, 0);
  };
  BigInteger.prototype["BigInteger.addBigInteger"] = function (x) {
    return add(x.signum, x.magnitude, x.length, 0, this.signum, this.magnitude, this.length, 0);
  };
  BigInteger.prototype["BigInteger.subtractBigInteger"] = function (x) {
    return add(x.signum, x.magnitude, x.length, 0, 0 - this.signum, this.magnitude, this.length, 0);
  };
  BigInteger.prototype["BigInteger.multiplyBigInteger"] = function (x) {
    return multiply(x.signum, x.magnitude, x.length, 0, this.signum, this.magnitude, this.length, 0);
  };
  BigInteger.prototype["BigInteger.divideBigInteger"] = function (x) {
    return divideAndRemainder(x.signum, x.magnitude, x.length, 0, this.signum, this.magnitude, this.length, 0, 1);
  };
  BigInteger.prototype["BigInteger.remainderBigInteger"] = function (x) {
    return divideAndRemainder(x.signum, x.magnitude, x.length, 0, this.signum, this.magnitude, this.length, 0, 0);
  };

  BigInteger.prototype["BigInteger.compareToNumber"] = function (x) {
    return compareTo(Math.sign(x), undefined, Math.sign(Math.abs(x)), Math.abs(x), this.signum, this.magnitude, this.length, 0);
  };
  BigInteger.prototype["BigInteger.addNumber"] = function (x) {
    return add(Math.sign(x), undefined, Math.sign(Math.abs(x)), Math.abs(x), this.signum, this.magnitude, this.length, 0);
  };
  BigInteger.prototype["BigInteger.subtractNumber"] = function (x) {
    return add(Math.sign(x), undefined, Math.sign(Math.abs(x)), Math.abs(x), 0 - this.signum, this.magnitude, this.length, 0);
  };
  BigInteger.prototype["BigInteger.multiplyNumber"] = function (x) {
    return multiply(Math.sign(x), undefined, Math.sign(Math.abs(x)), Math.abs(x), this.signum, this.magnitude, this.length, 0);
  };
  BigInteger.prototype["BigInteger.divideNumber"] = function (x) {
    return divideAndRemainder(Math.sign(x), undefined, Math.sign(Math.abs(x)), Math.abs(x), this.signum, this.magnitude, this.length, 0, 1);
  };
  BigInteger.prototype["BigInteger.remainderNumber"] = function (x) {
    return divideAndRemainder(Math.sign(x), undefined, Math.sign(Math.abs(x)), Math.abs(x), this.signum, this.magnitude, this.length, 0, 0);
  };

  exports.BigInteger = BigInteger;

}(this));

/*jslint plusplus: true, vars: true, indent: 2 */
/*global BigInteger */

// Thanks to Eduardo Cavazos
// see also https://github.com/dharmatech/Symbolism/blob/master/Symbolism/Symbolism.cs

// public API: 
// Expression.prototype.add
// Expression.prototype.subtract
// Expression.prototype.multiply
// ...
// protected API:
// Expression.prototype.addExpression
// Expression.prototype.addInteger

(function (global) {
  "use strict";

  //TODO: rename Symbol

  var pow = function (x, count, accumulator) {
    if (count < 0) {
      throw new RangeError();
    }
    return (count < 1 ? accumulator : (Math.trunc(count / 2) * 2 !== count ? pow(x, count - 1, accumulator.multiply(x)) : pow(x.multiply(x), Math.trunc(count / 2), accumulator)));
  };

  Expression.prototype.powExpression = function (x) {
    var y = this;

    //!
    if (y instanceof Division && y.a instanceof Integer && y.b instanceof Integer && y.b.compareTo(Integer.parseInteger("2")) === 0) {
      //?
      return x.pow(y.a.subtract(Integer.ONE).divide(y.b)).multiply(x.squareRoot());
    }
    //!
    throw new RangeError("UserError");
  };

  var getLast = function (x) {
    return x instanceof Multiplication ? x.b : x;
  };
  var getRest = function (x) {
    return x instanceof Multiplication ? x.a : undefined;
  };
  var compare = function (x, y) {
    if (x instanceof Symbol && y instanceof Integer) {
      return +1;
    }
    if (x instanceof Integer && y instanceof Symbol) {
      return -1;
    }
    if (x instanceof Integer && y instanceof Integer) {
      return x.compareTo(y);
    }
    if (x instanceof Symbol && y instanceof Symbol) {
      return x.symbol < y.symbol ? -1 : (y.symbol < x.symbol ? +1 : 0);
    }
    throw new RangeError();
  };

  var compare4Multiplication = function (x, y) {
    return x.compare4Multiplication(y);
    /*
    if (x instanceof Integer && y instanceof Integer) {
      return 0;
    }
    if (x instanceof Symbol && y instanceof Integer) {
      return +1;
    }
    if (x instanceof SquareRoot && y instanceof Integer) {
      return +1;
    }
    if (x instanceof Integer && y instanceof Symbol) {
      return -1;
    }
    if (x instanceof Integer && y instanceof SquareRoot) {
      return -1;
    }
    if (x instanceof Symbol && y instanceof SquareRoot) {
      return +1;
    }
    if (x instanceof SquareRoot && y instanceof Symbol) {
      return -1;
    }
    if (x instanceof SquareRoot && y instanceof SquareRoot) {
      return 0;
    }
    if (x instanceof Symbol && y instanceof Symbol) {
      return x.symbol < y.symbol ? -1 : (y.symbol < x.symbol ? +1 : 0);
    }
    //TODO: Exponentiation + Exponentiation, Exponentiation + Symbol, Symbol + Exponentiation
    throw new RangeError();
    */
  };

  var getBase = function (x) {
    return x instanceof Exponentiation ? x.a : x;
  };
  var getExponent = function (x) {
    return x instanceof Exponentiation ? x.b : Integer.ONE;
  };

  var getConstant = function (x) {
    while (x !== undefined) {
      if (x instanceof Integer) {
        return x;
      } else if (x instanceof Multiplication) {
        x = getRest(x);
      } else {
        x = undefined;
      }
    }
    return Integer.ONE;
  };
  var getTerm = function (x) {
  // TODO: fix performance ?
    if (x instanceof Integer) {
      return undefined;
    }
    if (x instanceof Multiplication) {
      var a = getTerm(getRest(x));
      var b = getTerm(getLast(x));
      return a === undefined ? b : (b === undefined ? a : new Multiplication(a, b));
    }
    return x;
  };

  var multiplyByInteger = function (x, y) {
    if (x.compareTo(Integer.ZERO) === 0) {
      return x;
    }
    if (x.compareTo(Integer.ONE) === 0) {
      return y;
    }
    return new Multiplication(x, y);
  };
  
  Expression.prototype.multiplyExpression = function (x) {
    var y = this;

    //if (Expression.getIdentityMatrixCoefficient(x) !== undefined && Expression.getIdentityMatrixCoefficient(y) !== undefined) {
    //  return Expression.makeIdentityMatrixWithCoefficient(Expression.getIdentityMatrixCoefficient(x).multiply(Expression.getIdentityMatrixCoefficient(y)));
    //}
    //if (Expression.getIdentityMatrixCoefficient(x) !== undefined) {
    //  if (y instanceof Matrix) {
    //    return Expression.getIdentityMatrixCoefficient(x).multiply(y);
    //  }
    //  return Expression.makeIdentityMatrixWithCoefficient(Expression.getIdentityMatrixCoefficient(x).multiply(y));
    //}
    //if (Expression.getIdentityMatrixCoefficient(y) !== undefined) {
    //  if (x instanceof Matrix) {
    //    return x.multiply(Expression.getIdentityMatrixCoefficient(y));
    //  }
    //  return Expression.makeIdentityMatrixWithCoefficient(x.multiply(Expression.getIdentityMatrixCoefficient(y)));
    //}

    // rest

    var c = 0;
    if (x instanceof Integer && y instanceof Symbol) {
      return multiplyByInteger(x, y);
    }
    if (x instanceof Symbol && y instanceof Integer) {
      return multiplyByInteger(y, x);
    }
    if (x instanceof Symbol && y instanceof Symbol) {
      c = compare4Multiplication(x, y);
      if (c === 0) {
        return x.pow(Integer.ONE.add(Integer.ONE));
      }
      return c > 0 ? new Multiplication(y, x) : new Multiplication(x, y);
    }
    if (x instanceof Integer && y instanceof Exponentiation) {
      return multiplyByInteger(x, y);
    }
    if (x instanceof Exponentiation && y instanceof Integer) {
      return multiplyByInteger(y, x);
    }
    if (x instanceof Exponentiation && y instanceof Symbol) {
      c = compare4Multiplication(getBase(x), y);
      if (c === 0) {
        return y.pow(getExponent(x).add(Integer.ONE));
      }
      return c > 0 ? new Multiplication(y, x) : new Multiplication(x, y);
    }
    if (x instanceof Symbol && y instanceof Exponentiation) {
      c = compare4Multiplication(x, getBase(y));
      if (c === 0) {
        return x.pow(getExponent(y).add(Integer.ONE));
      }
      return c > 0 ? new Multiplication(y, x) : new Multiplication(x, y);
    }
    if (x instanceof Exponentiation && y instanceof Exponentiation) {
      c = compare4Multiplication(getBase(x), getBase(y));
      if (c === 0) {
        return getBase(x).pow(getExponent(x).add(getExponent(y)));
      }
      return c > 0 ? new Multiplication(y, x) : new Multiplication(x, y);
    }
    if (x instanceof SquareRoot && y instanceof SquareRoot) {
      return x.a.multiply(y.a).squareRoot();
    }
    if (x instanceof Integer && y instanceof SquareRoot) {
      return multiplyByInteger(x, y);
    }
    if (x instanceof SquareRoot && y instanceof Integer) {
      return multiplyByInteger(y, x);
    }
    if (x instanceof Symbol && y instanceof SquareRoot) {
      return new Multiplication(y, x);
    }
    if (x instanceof SquareRoot && y instanceof Symbol) {
      return new Multiplication(x, y);
    }
    if (x instanceof Exponentiation && y instanceof SquareRoot) {
      return new Multiplication(y, x);
    }
    if (x instanceof SquareRoot && y instanceof Exponentiation) {
      return new Multiplication(x, y);
    }

    /*
    var cmp = compare4Multiplication(getBase(x), getBase(y));
    if (cmp === 0) {
      return getBase(x).pow(getExponent(x).add(getExponent(y)));
    }
    if (cmp < 0) {
      return new Multiplication(x, y);
    }
    if (cmp > 0) {
      return new Multiplication(y, x);
    }
    */
    throw new RangeError();
  };

  var getLastAdditionOperand = function (x) {
    return x instanceof Addition ? x.b : x;
  };
  var getRestAdditionOperand = function (x) {
    return x instanceof Addition ? x.a : undefined;
  };
  var compare4Addition = function (x, y) {
    // undefined | Symbol | Exponentiation | Multiplication
    var xIterator = new MultiplicationIterator(x);
    var yIterator = new MultiplicationIterator(y);
    while (true) {
      var fx = xIterator.value();
      xIterator = xIterator.next();
      var fy = yIterator.value();
      yIterator = yIterator.next();
      if (fx === undefined && fy === undefined) {
        return 0;
      }
      if (fx === undefined) {
        return -1;
      }
      if (fy === undefined) {
        return +1;
      }

      //!
      var cmp = 0;
      if (fx instanceof SquareRoot || fy instanceof SquareRoot) {
        if (fx instanceof SquareRoot && fy instanceof SquareRoot) {
          cmp = -fx.a.compareTo(fy.a);
        } else if (/*fx instanceof Integer || */fy instanceof Symbol || fy instanceof Exponentiation) {
          cmp = -1;
        } else if (/*fy instanceof Integer || */fx instanceof Symbol || fx instanceof Exponentiation) {
          cmp = +1;
        } else {
          throw new RangeError();//?
        }
      } else {
        // x^3*y^2, x^2*y^3
        cmp = -compare(getBase(fx), getBase(fy));
        if (cmp === 0) {
          cmp = compare(getExponent(fx), getExponent(fy));
        }
      }
      if (cmp !== 0) {
        return cmp;
      }
    }
  };

  Expression.prototype.addExpression = function (x) {
    var y = this;
    //if (Expression.getIdentityMatrixCoefficient(x) !== undefined && Expression.getIdentityMatrixCoefficient(y) !== undefined) {
    //  return Expression.makeIdentityMatrixWithCoefficient(Expression.getIdentityMatrixCoefficient(x).add(Expression.getIdentityMatrixCoefficient(y)), Expression.IdentityMatrix);
    //}
    //if (Expression.getIdentityMatrixCoefficient(x) !== undefined) {
    //  if (y instanceof Matrix) {
    //    return new Matrix(Matrix.I(y.matrix.rows() < y.matrix.cols() ? y.matrix.rows() : y.matrix.cols()).multiply(Expression.getIdentityMatrixCoefficient(x))).add(y);
    //  }
    //  throw new RangeError("UserError");
    //}
    //if (Expression.getIdentityMatrixCoefficient(y) !== undefined) {
    //  if (x instanceof Matrix) {
    //    return new Matrix(x, Matrix.I(y.matrix.rows() < y.matrix.cols() ? y.matrix.rows() : y.matrix.cols()).multiply(Expression.getIdentityMatrixCoefficient(y))).add(?);
    //  }
    //  throw new RangeError("UserError");
    //}

    // rest

    if (x instanceof Expression && y instanceof Addition) {
      return x.add(y.a).add(y.b);
    }
    if (x instanceof Addition && y instanceof Expression) {
      var c = compare4Addition(getTerm(x.b), getTerm(y));
      if (c === 0) {
        return x.a.add(x.b.add(y));
      }
      if (y.equals(Integer.ZERO)) {
        return x;
      }
      return c > 0 ? new Addition(x, y) : x.a.add(y).add(x.b);
    }

//TODO: (?)
//.add4(x, x.b, y) instead of "compare4Addition" + "getTerm" + "getConstant"
//.multiply4(x, x.b, y) instead of "compare4Multiplicaiton"
    var fxTerm = getTerm(x);
    var fyTerm = getTerm(y);
    var cmp = compare4Addition(fxTerm, fyTerm);
    if (cmp === 0) {
      var constant = getConstant(x).add(getConstant(y));
      var last = fxTerm === undefined ? constant : constant.multiply(fxTerm);
      return last;
    }
    if (cmp > 0) {
      var tmp = x;
      x = y;
      y = tmp;
    }
    if (x.equals(Integer.ZERO)) {
      return y;
    }
    //?
    if (y.equals(Integer.ZERO)) {
      return x;
    }
    return new Addition(y, x);
  };

  var checkMultivariatePolynomial = function (e, d) {
    return true;
  //TODO: FIX!!!
    if (d < 1 && e instanceof Addition) {
      return checkMultivariatePolynomial(e.a, 0) && checkMultivariatePolynomial(e.b, 1);
    }
    if (d < 2 && e instanceof Integer) {
      return true;
    }
    if (d < 2 && e instanceof Multiplication && (e.a instanceof Integer || e.a instanceof Symbol)) {
      return checkMultivariatePolynomial(e.b, 2);
    }
    if (d < 3 && e instanceof Multiplication) {
      return (e.a instanceof Symbol) && checkMultivariatePolynomial(e.b, 2);
    }
    if (d < 4 && e instanceof Exponentiation) {
      return (e.a instanceof Symbol) && (e.b instanceof Integer) && e.b.compareTo(Integer.ZERO) > 0;
    }
    if (e instanceof Symbol) {
      return true;
    }
    return false;
  };

  var pseudoRemainder = function (x, y, v) {
    var lcg = getLeadingCoefficient(y, v);
    var x1 = getLargestExponent(x, v).subtract(getLargestExponent(y, v)).add(Integer.ONE);
    // assertion
    if (x1.compareTo(Integer.ONE) < 0) {
      throw new RangeError();
    }
    x = x.multiply(lcg.pow(x1));
    return divideAndRemainder(x, y, v)[1];
  };

  var divideAndRemainderInternal = function (x, y, v) {
    if (y.equals(Integer.ZERO)) {
      throw new RangeError("ArithmeticException");
    }
    var div = Integer.ZERO;
    var rem = x;
    var e0 = undefined;
    var e1 = undefined;
    // compareTo for Integers
    while (!rem.equals(Integer.ZERO) && (e0 = getLeadingX(rem, v)).exponent.compareTo((e1 = getLeadingX(y, v)).exponent) >= 0) {
      var n = e0.exponent.subtract(e1.exponent);

      var d = e0.coefficient.divide(e1.coefficient);
      if (d instanceof Division) {
        return undefined;
      }
      var q = d.multiply(v.pow(n));
      div = div.add(q);
      rem = rem.subtract(y.multiply(q));
    }
    return [div, rem];
  };

  var divideAndRemainder = function (x, y, v) {
    var result = divideAndRemainderInternal(x, y, v);
    if (result === undefined) {
      throw new RangeError(); // AssertionError
    }
    return result;
  };

  var divideByInteger = function (x, f) {
    if (f.equals(Integer.ZERO)) {
      throw new RangeError("ArithmeticException");
    }
    var result = Integer.ZERO;
    while (x !== undefined) {
      var fx = getLastAdditionOperand(x);
      var rx = getRestAdditionOperand(x);
      var rest = Integer.ONE;
      var t = undefined;
      var iterator = new MultiplicationIterator(fx);
      var z = undefined;
      // TODO: check, fix?
      while ((z = iterator.value()) !== undefined) {
        iterator = iterator.next();
        if (z instanceof Integer) {
          t = z;
        } else {
          if (rest === Integer.ONE) {
            rest = z;
          } else {
            rest = z.multiply(rest);
          }
        }
      }
      //var t = getLast(fx);
      if (!(t instanceof Integer)) {
        throw new RangeError();
      }
      //var rest = getRest(fx);
      //if (rest === undefined) {
      //  rest = Integer.ONE;
      //}
      result = result.add(t.divide(f).multiply(rest));
      x = rx;
    }
    return result;
  };

  // returns Expression + Integer
  var getLeadingX = function (x, v) {
    var coefficients = getCoefficients(x, v);
    return coefficients[coefficients.length - 1];
  };

  var getLeadingCoefficient = function (x, v) {
    return getLeadingX(x, v).coefficient;
  };

  // returns Integer
  var getLargestExponent = function (x, v) {
    return getLeadingX(x, v).exponent;
  };

  var getCoefficients = function (x, v) {
    var result = [];
    while (x !== undefined) {
      var fx = getLastAdditionOperand(x);
      x = getRestAdditionOperand(x);
      var e = Integer.ZERO;
      var c = Integer.ONE;
      var fxIterator = new MultiplicationIterator(fx);
      var t = undefined;
      while ((t = fxIterator.value()) !== undefined) {
        fxIterator = fxIterator.next();
        if (getBase(t).equals(v)) {
          e = e.add(getExponent(t));
        } else {
          c = c.multiply(t);
        }
      }
      var tmp = {
        coefficient: c,
        exponent: e
      };
      var k = result.length - 1;
      while (k >= 0 && tmp.exponent.compareTo(result[k].exponent) < 0) {
        k -= 1;
      }
      if (k >= 0 && tmp.exponent.compareTo(result[k].exponent) === 0) {
        result[k].coefficient = tmp.coefficient.add(result[k].coefficient);
      } else {
        result.push(tmp);
        var i = result.length - 1;
        while (i >= k + 2) {
          result[i] = result[i - 1];
          i -= 1;
        }
        result[k + 1] = tmp;
      }
    }
    if (result.length === 0) {
      //TODO: remove?
      result.push({
        coefficient: Integer.ZERO,
        exponent: Integer.ZERO
      });
    }
    return result;
  };

  Expression.getCoefficients = getCoefficients;

  var getLastMultiplicationOperand = function (x) {
    var result = x;
    while (result instanceof Multiplication) {
      result = result.b;
    }
    return result;
  };

  var getVariable = function (e) {
    //? square roots at first
    var additions = e;
    var x = undefined;
    while ((x = getLastAdditionOperand(additions)) !== undefined) {
      additions = getRestAdditionOperand(additions);
      var multiplications = new MultiplicationIterator(x);
      var y = undefined;
      while ((y = multiplications.value()) !== undefined) {
        multiplications = multiplications.next();
        if (y instanceof SquareRoot) {
        //TODO: assert(y instanceof Integer)
          return y;
        }
      }
    }
    //?
  
    if (e instanceof Addition) {
      return getVariable(getRestAdditionOperand(e));
    }
    var result = getBase(getLastMultiplicationOperand(e));
    //!?
    //if (result instanceof SquareRoot) {
    //  return undefined;
    //}
    //
    return result instanceof Integer ? undefined : result;
  };

  var content = function (x, v) {
    var coefficients = getCoefficients(x, v);
    var i = coefficients.length;
    var cx = undefined;
    var vcx = undefined;
    while (--i >= 0) {
      var c = coefficients[i];
      vcx = vcx === undefined ? getVariable(c.coefficient) : vcx;
      cx = cx === undefined ? c.coefficient : gcd(cx, c.coefficient, vcx);
    }
    return cx;
  };

  var pp = function (x, v) {
    var c = content(x, v);
    return divideAndRemainder(x, c, v)[0];
  };

  var integerGCD = function (a, b) {
    if (a.compareTo(Integer.ZERO) < 0) {
      a = a.negate();
    }
    if (b.compareTo(Integer.ZERO) < 0) {
      b = b.negate();
    }
    var t = undefined;
    while (b.compareTo(Integer.ZERO) !== 0) {
      t = a.remainder(b);
      a = b;
      b = t;
    }
    return a;
  };

  // http://www-troja.fjfi.cvut.cz/~liska/ca/node33.html
  var gcd = function (a, b, v) {
    if (v === undefined) {
      if (getVariable(a) !== undefined) {
      //?
        return gcd(a, b, getVariable(a));
      }
      if (getVariable(b) !== undefined) {
        return gcd(a, b, getVariable(b));      
      }
      return integerGCD(getConstant(content(a, v)), getConstant(content(b, v)));
    }

    //TODO: fix (place condition for degrees earlier - ?)
    if (getLargestExponent(a, v).compareTo(getLargestExponent(b, v)) < 0) {
      //!!!
      var tmp = a;
      a = b;
      b = tmp;
    }

    var contentA = content(a, v);
    var contentB = content(b, v);
    var ppA = divideAndRemainder(a, contentA, v)[0];
    var ppB = divideAndRemainder(b, contentB, v)[0];
    var A = ppA;
    var B = ppB;
    while (!B.equals(Integer.ZERO)) {
      var r = pseudoRemainder(A, B, v);
      A = B;
      B = r;
    }
    return gcd(contentA, contentB, getVariable(contentA)).multiply(pp(A, v));
  };

  // ! new 21.12.2013 (square roots)
  var MultiplicationIterator = function (e) {
    this.e = e;
  };
  MultiplicationIterator.prototype.value = function () {
    if (this.e === undefined) {
      return undefined;
    }
    return getLast(this.e);
  };
  MultiplicationIterator.prototype.next = function () {
    if (this.e === undefined) {
      return undefined;
    }
    return new MultiplicationIterator(getRest(this.e));
  };

  var getConjugateFactor = function (a) {
    var p = undefined;
    var additions = a;
    var x = undefined;
    while ((x = getLastAdditionOperand(additions)) !== undefined) {
      additions = getRestAdditionOperand(additions);
      var multiplications = new MultiplicationIterator(x);
      var y = undefined;
      while ((y = multiplications.value()) !== undefined) {
        multiplications = multiplications.next();
        if (y instanceof SquareRoot) {
        //TODO: assert(y instanceof Integer)
          if (p === undefined) {
            p = y.a;
          } else {
            var z = integerGCD(p, y.a);
            if (z.compareTo(Integer.ONE) !== 0) {
              p = z;//!
            }
          }
        }
      }
    }
    return p;
  };

  // TODO: test
  var getConjugate = function (a) {
  //TODO: fix
  //if (true) return undefined;
    var p = getConjugateFactor(a);
    // make up - v
    if (p === undefined) {
      return undefined;
    }
    var up = Integer.ZERO;
    var v = Integer.ZERO;
    var additions = a;
    var x = undefined;
    while ((x = getLastAdditionOperand(additions)) !== undefined) {
      additions = getRestAdditionOperand(additions);
      var multiplications = new MultiplicationIterator(x);
      var y = undefined;
      var ok = false;
      while ((y = multiplications.value()) !== undefined) {
        multiplications = multiplications.next();
        if (y instanceof SquareRoot) {
          var z = integerGCD(p, y.a);
          if (z.compareTo(Integer.ONE) !== 0) {
            ok = true;
          }
        }
      }
      if (ok) {
        up = up.add(x);
      } else {
        v = v.add(x);
      }
    }
    return up.subtract(v);
  };

  Expression.fillLinearEquationVariablesMap = function (e, onVariable) {
    if (e instanceof Division) {
      throw new RangeError();
    }
    var additions = e;
    var x = undefined;
    while ((x = getLastAdditionOperand(additions)) !== undefined) {
      additions = getRestAdditionOperand(additions);
      var multiplications = new MultiplicationIterator(x);
      var y = undefined;
      var v = undefined;
      var c = Integer.ONE;
      while ((y = multiplications.value()) !== undefined) {
        multiplications = multiplications.next();
        if (y instanceof Exponentiation) {
          throw new RangeError();//?
        } else if (y instanceof Symbol) {
          if (v !== undefined) {
            throw new RangeError();
          }
          v = y;
        } else {
          if (!(y instanceof Integer)) {//TODO: sqrt ?!?;
            throw new RangeError();
          }
          c = c.multiply(y);
        }
      }
      var variable = v === undefined ? "" : v.toString();
      onVariable(c, variable);
    }
  };

  Expression.prototype.divideExpression = function (x, allowConjugate) {
    allowConjugate = allowConjugate === undefined ? true : allowConjugate;
    var y = this;
    //if (Expression.getIdentityMatrixCoefficient(x) !== undefined && Expression.getIdentityMatrixCoefficient(y) !== undefined) {
    //  return Expression.makeIdentityMatrixWithCoefficient(Expression.getIdentityMatrixCoefficient(x).divide(Expression.getIdentityMatrixCoefficient(y)));
    //}
    //if (Expression.getIdentityMatrixCoefficient(x) !== undefined) {
    //  if (y instanceof Matrix) {
    //    return Expression.getIdentityMatrixCoefficient(x).divide(y);
    //  }
    //  return Expression.makeIdentityMatrixWithCoefficient(Expression.getIdentityMatrixCoefficient(x).divide(y));
    //}
    //if (Expression.getIdentityMatrixCoefficient(y) !== undefined) {
    //  if (x instanceof Matrix) {
    //    return x.divide(Expression.getIdentityMatrixCoefficient(y));
    //  }
    //  return Expression.makeIdentityMatrixWithCoefficient(x.divide(Expression.getIdentityMatrixCoefficient(y)));
    //}

    if (x instanceof Matrix && y instanceof Matrix) {
      // TODO: callback ???
      return new Matrix(x.matrix.multiply(y.matrix.inverse()));
    }
    if (x instanceof Matrix && y instanceof Expression) {
      return new Matrix(x.matrix.scale(y.inverse()));
    }
    if (x instanceof Expression && y instanceof Matrix) {
      if (Expression.callback !== undefined) {
        Expression.callback(new Expression.Event("inverse", y));
      }
      return new Matrix(y.matrix.inverse().scale(x));
    }

    if (y.equals(Integer.ZERO)) {
      //TODO: fix?
      throw new RangeError("ArithmeticException");
    }
    if (x.equals(Integer.ZERO)) {
      return Integer.ZERO;
    }
    if (y.equals(Integer.ONE)) {
      return x;
    }

    if (!checkMultivariatePolynomial(x, 0)) {
      throw new RangeError();
    }
    if (!checkMultivariatePolynomial(y, 0)) {
      throw new RangeError();
    }

    //!!! new (21.12.2013)
    if (allowConjugate) { //TODO: remove hack!
      var e = getConjugate(content(y, undefined));
      if (e !== undefined) {
        return x.multiply(e).divide(y.multiply(e));
      }
    }

    var v = getVariable(x);//???
    //TODO: move?

    // gcd
    var g = gcd(x, y, v);

    if (!g.equals(Integer.ONE)) {
      if (v === undefined || g instanceof Integer) {
        //???
        x = divideByInteger(x, g);
        y = divideByInteger(y, g);
        return x.divide(y, false);//!!! allowConjugate
      }
      var x2 = divideAndRemainder(x, g, v)[0];
      var y2 = divideAndRemainder(y, g, v)[0];
      return x2.divide(y2, false);//!!! allowConjugate
    }
    
    //var lc = getConstant(getLeadingCoefficient(y, v));
    var lc = getConstant(getLeadingCoefficient(y, getVariable(y)));
    if (lc.compareTo(Integer.ZERO) < 0) {
      return x.negate().divide(y.negate(), false);//!!! allowConjugate
    }
    return new Division(x, y);
  };

  function Expression() {
    throw new Error("Do not call for better performance");
  }

  Expression.callback = undefined;
  Expression.Event = function (type, data, second) {
    second = second === undefined ? undefined : second;
    this.type = type;
    this.data = data;
    this.second = second;
  };

  Expression.prototype.compare4Multiplication = function (y) {
    throw new Error(this.toString());
  };
  Expression.prototype.compare4MultiplicationInteger = function (x) {
    throw new Error();
  };
  Expression.prototype.compare4MultiplicationSymbol = function (x) {
    throw new Error();
  };
  Expression.prototype.compare4MultiplicationSquareRoot = function (x) {
    throw new Error();
  };

  Expression.prototype.negate = function () {
    return Integer.ONE.negate().multiply(this);
  };
  Expression.prototype.add = function (y) {
    return y.addExpression(this);
  };
  Expression.prototype.subtract = function (y) {
    return this.add(y.negate());
  };
  Expression.prototype.divide = function (y, allowConjugate) {
    return y.divideExpression(this, allowConjugate);
  };
  Expression.prototype.multiply = function (y) {
    return y.multiplyExpression(this);
  };
  Expression.prototype.pow = function (y) {
    return y.powExpression(this);
  };
  Expression.prototype.getDenominator = function () {
    //TODO: FIX!!!!
    return this instanceof Division ? this.b : Integer.ONE;
  };
  Expression.prototype.getNumerator = function () {
    //TODO: FIX!!!!
    return this instanceof Division ? this.a : this;
  };
  Expression.prototype.inverse = function () {
    return Integer.ONE.divide(this);
  };
  // TODO: fix or remove ?
  Expression.prototype.gcd = function (x) {
    return gcd(this, x, getVariable(this));
  };

  //TODO: merge with Fraction.js ?!?
  var precedence = {
    binary: {
      ".^": 5,
      "^": 5,
      "*": 3,
      "/": 3,
      "+": 2,
      "-": 2
    },
    unary: {
      "-": 5//HACK
    }
  };

  function Symbol(symbol) {
    //Expression.call(this);
    this.symbol = symbol;
  }

  Symbol.prototype = Object.create(Expression.prototype);

  Symbol.prototype.compare4Multiplication = function (y) {
    return y.compare4MultiplicationSymbol(this);
  };
  Symbol.prototype.compare4MultiplicationInteger = function (x) {
    return -1;
  };
  Symbol.prototype.compare4MultiplicationSymbol = function (x) {
    return x.symbol < this.symbol ? -1 : (this.symbol < x.symbol ? +1 : 0);
  };
  Symbol.prototype.compare4MultiplicationSquareRoot = function (x) {
    return -1;
  };

  Symbol.prototype.toString = function () {
    return this.symbol;
  };


  Expression.prototype.addInteger = function (x) {
    return this.addExpression(x);
  };
  Expression.prototype.multiplyInteger = function (x) {
    return this.multiplyExpression(x);
  };
  Expression.prototype.divideInteger = function (x) {
    return this.divideExpression(x);
  };
  Expression.prototype.truncatingDivideInteger = function () {
    throw new Error();
  };
  Expression.prototype.remainderInteger = function () {
    throw new Error();
  };

  function Integer(value) {
    //Expression.call(this);
    this.value = value;
  }

  Integer.prototype = Object.create(Expression.prototype);
  
  Integer.prototype.powExpression = function (x) {
    var y = this;
    if (x instanceof MatrixSymbol) {
      if (y.equals(Integer.ZERO)) {
        return Integer.ONE;
      }
      return new Exponentiation(x, y);//?
    }
    if (y.compareTo(Integer.ZERO) < 0) {
      return Integer.ONE.divide(x.pow(y.negate()));
    }
    if (x instanceof Matrix) {
      if (Expression.callback !== undefined && y.compareTo(Integer.ONE) > 0) {
        Expression.callback(new Expression.Event("pow", x, new Expression.Matrix(global.Matrix.I(1).map(function () { return y; }))));
      }
      return new Matrix(pow(x.matrix, Number.parseInt(y.toString(), 10), global.Matrix.I(x.matrix.rows())));
    }
    if (y.equals(Integer.ZERO)) {
      return Integer.ONE;
    }
    if (y.equals(Integer.ONE)) {
      return x;
    }

    if (x instanceof Symbol) {
      return new Exponentiation(x, y);
    }
    if (x instanceof Exponentiation) {
      return x.a.pow(x.b.multiply(y));
    }
    // assert(x instanceof Operation || x instanceof Integer);
    return pow(x, Number.parseInt(y.toString(), 10), Integer.ONE);
  };

  Integer.prototype.compare4Multiplication = function (y) {
    return y.compare4MultiplicationInteger(this);
  };
  Integer.prototype.compare4MultiplicationInteger = function (x) {
    return 0;
  };
  Integer.prototype.compare4MultiplicationSymbol = function (x) {
    return +1;
  };
  Integer.prototype.compare4MultiplicationSquareRoot = function (x) {
    return +1;
  };

  Integer.prototype.negate = function () {
    return new Integer(this.value["BigInteger.negate"]());
  };
  Integer.prototype.compareTo = function (y) {
    return y.compareToInteger(this);
  };
  Integer.prototype.compareToInteger = function (x) {
    return x.value["BigInteger.compareTo"](this.value);
  };
  Integer.prototype.add = function (y) {
    return y.addInteger(this);
  };
  Integer.prototype.addInteger = function (x) {
    return new Integer(x.value["BigInteger.add"](this.value));
  };
  Integer.prototype.multiply = function (y) {
    return y.multiplyInteger(this);
  };
  Integer.prototype.multiplyInteger = function (x) {
    return new Integer(x.value["BigInteger.multiply"](this.value));
  };
  Integer.prototype.divide = function (y, allowConjugate) {
    return y.divideInteger(this, allowConjugate);
  };
  //! for performance only
  Integer.prototype.divideInteger = function (x) {
    var y = this;
    if (y.equals(Integer.ZERO)) {
      //TODO: fix?
      throw new RangeError("ArithmeticException");
    }
    var gInteger = integerGCD(x, y);
    if (y.compareTo(Integer.ZERO) < 0) {
      gInteger = gInteger.negate();
    }
    x = x.truncatingDivide(gInteger);
    y = y.truncatingDivide(gInteger);
    return y.compareTo(Integer.ONE) === 0 ? x : new Division(x, y);
  };
  Integer.prototype.truncatingDivide = function (y) {
    return y.truncatingDivideInteger(this);
  };
  Integer.prototype.truncatingDivideInteger = function (x) {
    return new Integer(x.value["BigInteger.divide"](this.value));
  };
  Integer.prototype.remainder = function (y) {
    return y.remainderInteger(this);
  };
  Integer.prototype.remainderInteger = function (x) {
    return new Integer(x.value["BigInteger.remainder"](this.value));
  };
  Integer.prototype.toString = function () {
    return this.value.toString();
  };

  Integer.parseInteger = function (s) {
    return new Integer(BigInteger.parseInt(s));
  };
  Integer.ZERO = Integer.parseInteger("0");
  Integer.ONE = Integer.parseInteger("1");
  Integer.TEN = Integer.parseInteger("10");


  
  function Matrix(matrix) {
    //Expression.call(this);
    this.matrix = matrix;
  }

  Matrix.prototype = Object.create(Expression.prototype);

  Matrix.prototype.multiply = function (y) {
    return y.multiplyMatrix(this);
  };
  Expression.prototype.multiplyMatrix = function (x) {
    return new Matrix(x.matrix.scale(this));
  };
  Matrix.prototype.multiplyExpression = function (x) {
    return new Matrix(this.matrix.scale(x));
  };
  Matrix.prototype.multiplyMatrix = function (x) {
    if (Expression.callback !== undefined) {
      Expression.callback(new Expression.Event("multiply", x, this));
    }
    return new Matrix(x.matrix.multiply(this.matrix));
  };
  Matrix.prototype.multiplyMultiplication = Matrix.prototype.multiplyExpression;
  Matrix.prototype.add = function (y) {
    return y.addMatrix(this);
  };
  Matrix.prototype.addMatrix = function (x) {
    return new Matrix(x.matrix.add(this.matrix));
  };
  Expression.prototype.addMatrix = function (x) {
    if (x.matrix.rows() === x.matrix.cols()) {
      return new Matrix(global.Matrix.I(x.matrix.rows()).scale(this)).add(x);
    }
    throw new RangeError("UserError");
  };
  Matrix.prototype.addExpression = function (x) {
    if (this.matrix.rows() === this.matrix.cols()) {
      return this.add(new Matrix(global.Matrix.I(this.matrix.rows()).scale(x)));
    }
    throw new RangeError("UserError");
  };

  Matrix.prototype.toString = function () {
    return this.matrix.toString();
  };

  //?
  /*
  Matrix.prototype.equals = function (b) {
    var a = this;
    if (!(b instanceof Matrix)) {
      return false;
    }
    var am = a.matrix;
    var bm = b.matrix;
    if (am.rows() !== bm.rows() || am.cols() !== bm.cols()) {
      return false;
    }
    var i = -1;
    while (++i < am.rows()) {
      var j = -1;
      while (++j < bm.rows()) {
        if (am.e(i, j) !== bm.e(i, j)) {
          return false;
        }
      }
    }
    return true;
  };
  */
  //?

  function BinaryOperation(a, b) {
    //Expression.call(this);
    this.a = a;
    this.b = b;
  }

  BinaryOperation.prototype = Object.create(Expression.prototype);

  BinaryOperation.prototype.isNegation = function () {
    // TODO: What about NonSimplifiedExpression(s) ?
    //if (this instanceof Multiplication && this.a instanceof NonSimplifiedExpression && this.a.e instanceof Integer && this.a.e.equals(Integer.ONE.negate())) {
    //  return true;
    //}
    return (this instanceof Multiplication && this.a instanceof Integer && this.a.equals(Integer.ONE.negate()));
  };

  BinaryOperation.prototype.toString = function () {
    var a = this.a;
    var b = this.b;
    var isSubtraction = false;
    // TODO: check
    /*
    if (Expression.simplification && this instanceof Addition && Expression.isNegative(a)) {
      var tmp = b;
      b = a;
      a = tmp;
    }*/

    if (this instanceof Addition && Expression.isNegative(b)) {
      isSubtraction = true;
      b = b.negateCarefully();//?
    }
    var fa = a.getPrecedence() < this.getPrecedence();
    var fb = b.getPrecedence() <= this.getPrecedence() + (Expression.isRightToLeftAssociative(this) ? 1 : 0);
    var s = isSubtraction ? "-" : this.getS();
    //TODO: fix spaces (matrix parsing)
    if (this.isNegation()) {
      // assert(fa === false);
      return "-" + (fb ? "(" : "") + b.toString() + (fb ? ")" : "");
    }
    return (fa ? "(" : "") + a.toString() + (fa ? ")" : "") + s + (fb ? "(" : "") + b.toString() + (fb ? ")" : "");
  };

  function Exponentiation(a, b) {
    BinaryOperation.call(this, a, b);
  }

  Exponentiation.prototype = Object.create(BinaryOperation.prototype);

  function Multiplication(a, b) {
    BinaryOperation.call(this, a, b);
  }

  Multiplication.prototype = Object.create(BinaryOperation.prototype);

  Multiplication.prototype.multiply = function (y) {
    return y.multiplyMultiplication(this);
  };
  Expression.prototype.multiplyMultiplication = function (x) {
    var c = compare4Multiplication(getBase(x.b), getBase(this));
    if (c === 0) {
      return x.a.multiply(x.b.multiply(this));
    }
    return c > 0 ? x.a.multiply(this).multiply(x.b) : new Multiplication(x, this);
  };
  Multiplication.prototype.multiplyExpression = function (x) {
    return x.multiply(this.a).multiply(this.b);
  };
  Multiplication.prototype.multiplyMultiplication = Multiplication.prototype.multiplyExpression;

  function Negation(b) {
    //Expression.call(this);
    this.b = b;
  }

  Negation.prototype = Object.create(Expression.prototype);

  Expression.prototype.equalsNegation = function (x) {
    return false;
  };
  Negation.prototype.equalsNegation = function (b) {
    return this.b.equals(b.b);
  };
  Negation.prototype.equals = function (b) {
    return b.equalsNegation();
  };
  Negation.prototype.toString = function () {
    var b = this.b;
    var fb = b.getPrecedence() <= this.getPrecedence() + (Expression.isRightToLeftAssociative(this) ? 1 : 0);
    // assert(fa === false);
    return "-" + (fb ? "(" : "") + b.toString() + (fb ? ")" : "");
  };
  
  function Addition(a, b) {
    BinaryOperation.call(this, a, b);
  }

  Addition.prototype = Object.create(BinaryOperation.prototype);
  Addition.prototype.multiply = function (y) {
    return y.multiplyAddition(this);
  };
  Expression.prototype.multiplyAddition = function (x) {
    return x.a.multiply(this).add(x.b.multiply(this));
  };
  Addition.prototype.multiplyExpression = function (x) {
    return x.multiply(this.a).add(x.multiply(this.b));
  };
  Addition.prototype.multiplyMultiplication = Addition.prototype.multiplyExpression;

  function Division(a, b) {
    BinaryOperation.call(this, a, b);
  }

  Division.prototype = Object.create(BinaryOperation.prototype);
  Division.prototype.multiply = function (y) {
    return y.multiplyDivision(this);
  };
  Expression.prototype.multiplyDivision = function (x) {
    return x.a.multiply(this).divide(x.b);
  };
  Division.prototype.multiplyExpression = function (x) {
    return x.multiply(this.a).divide(this.b);
  };
  Division.prototype.multiplyMultiplication = Division.prototype.multiplyExpression;
  Division.prototype.add = function (y) {
    return y.addDivision(this);
  };
  Expression.prototype.addDivision = function (x) {
    return x.a.add(this.multiply(x.b)).divide(x.b);
  };
  Division.prototype.addExpression = function (x) {
    return x.multiply(this.b).add(this.a).divide(this.b);
  };
  Division.prototype.divide = function (y, allowConjugate) {
    return this.a.divide(this.b.multiply(y));
  };
  Division.prototype.divideExpression = function (x, allowConjugate) {
    return x.multiply(this.b).divide(this.a);
  };

  // TODO: move
  Expression.prototype.equals = function (b) {
    throw new RangeError();//?
  };
  Expression.prototype.equalsInteger = function () {
    return false;
  };
  Integer.prototype.equals = function (y) {
    // TODO: fix
    if (y === undefined) {
      return false;
    }
    return y.equalsInteger(this);
  };
  Integer.prototype.equalsInteger = function (x) {
    return x.compareTo(this) === 0;
  };
  Symbol.prototype.equals = function (b) {
    return b instanceof Symbol && this.symbol === b.symbol;
  };
  //TODO: Matrix.prototype.equals
  BinaryOperation.prototype.equals = function (b) {
    return this.getS() === b.getS() && this.a.equals(b.a) && this.b.equals(b.b);
  };

  Expression.IdentityMatrix = function (denotation) {
    this.denotation = denotation;
  };
  Expression.IdentityMatrix.prototype = Object.create(Expression.prototype);
  Expression.IdentityMatrix.prototype.toString = function () {
    return this.denotation;
  };
  Expression.IdentityMatrix.prototype.addMatrix = function (x) {
    return x.add(new Matrix(global.Matrix.I(x.matrix.rows())));
  };
  Expression.IdentityMatrix.prototype.multiplyExpression = function (x) {
    return new Multiplication(x, this);
  };
  Matrix.prototype.addIdentityMatrix = function (x) {
    return new Matrix(global.Matrix.I(this.matrix.rows())).add(this);
  };

  function MatrixSymbol(symbol) {//TODO: only for square matrix !!!
    Symbol.call(this, symbol);
  }
  MatrixSymbol.prototype = Object.create(Symbol.prototype);

  Exponentiation.prototype.inverse = function () {
    return this.pow(Integer.ONE.negate());
  };
  MatrixSymbol.prototype.inverse = function () {//TODO: only for square matrix !!!
    return this.pow(Integer.ONE.negate());
  };

  //...
/*
  //?
  MatrixSymbol.prototype.compare4Multiplication = function (y) {
    return this.equals(y) ? 0 : -1;
  };
  //?
  MatrixSymbol.prototype.equals = function (b) {
    return b instanceof MatrixSymbol && Symbol.prototype.equals.call(this, b);
  };
*/

  Expression.MatrixSymbol = MatrixSymbol;

//TODO: remove
  Expression.prototype.getS = function () {
    return "0";
  };

  Exponentiation.prototype.getS = function () {
    return "^";
  };
  Multiplication.prototype.getS = function () {
    return "*";
  };
  Negation.prototype.getS = function () {
    return "-";
  };
  Addition.prototype.getS = function () {
    return "+";
  };
  Division.prototype.getS = function () {
    return "/";
  };
  
  Negation.prototype.getPrecedence = function () {
    return precedence.unary["-"];
  };
  BinaryOperation.prototype.getPrecedence = function () {
    if (this.isNegation()) {
      return precedence.unary["-"];
    }
    return precedence.binary[this.getS()];
  };
  SquareRoot.prototype.getPrecedence = function () {
    return precedence.binary["^"];
  };
  Expression.prototype.getPrecedence = function () {
    return 1000;
  };



  Expression.isNegative = function (x) {
    if (x instanceof NonSimplifiedExpression) {
      return Expression.isNegative(x.e);
    }
    if (x instanceof Integer) {
      return x.compareTo(Integer.ZERO) < 0;
    }
    if (x instanceof Addition) {
      return Expression.isNegative(x.a) && Expression.isNegative(x.b);
    }
    if (x instanceof Multiplication) {
      return Expression.isNegative(x.a) !== Expression.isNegative(x.b);
    }
    if (x instanceof Division) {
      return Expression.isNegative(x.a) !== Expression.isNegative(x.b);
    }
    if (x instanceof Negation) {
      return true;
    }
    return false;
  };

  //TODO: remove
  Expression.prototype.negateCarefully = function () {
    if (this instanceof NonSimplifiedExpression) {
      return new NonSimplifiedExpression(this.e.negateCarefully());
    }
    if (this instanceof Integer) {
      return new Integer(this.value["BigInteger.negate"]());
    }
    if (this instanceof Addition) {
      return new Addition(this.a.negateCarefully(), this.b.negateCarefully());
    }
    if (this instanceof Multiplication) {
      return Expression.isNegative(this.b) ? new Multiplication(this.a, this.b.negateCarefully()) : (this.a.negateCarefully().equals(Integer.ONE) ? this.b : new Multiplication(this.a.negateCarefully(), this.b));
    }
    if (this instanceof Division) {
      return Expression.isNegative(this.b) ? new Division(this.a, this.b.negateCarefully()) : new Division(this.a.negateCarefully(), this.b);
    }
    if (this instanceof Negation) {
      return this.b;//!
    }
    return this.negate();
  };

  Expression.Function = function (name, a) {
    //Expression.call(this);
    this.name = name;
    this.a = a;
  };
  Expression.Function.prototype = Object.create(Expression.prototype);
  Expression.Function.prototype.toString = function () {
  //?
    return this.name + "(" + this.a.toString() + ")";
  };
  Expression.Function.prototype.equals = function (b) {
    return b instanceof Expression.Function && this.name === b.name && this.a.equals(b.a);
  };

  function SquareRoot(a) {
    Expression.Function.call(this, "sqrt", a);
  }

  SquareRoot.prototype = Object.create(Expression.Function.prototype);
  
  SquareRoot.prototype.compare4Multiplication = function (y) {
    return y.compare4MultiplicationSquareRoot(this);
  };
  SquareRoot.prototype.compare4MultiplicationInteger = function (x) {
    return -1;
  };
  SquareRoot.prototype.compare4MultiplicationSymbol = function (x) {
    return +1;
  };
  SquareRoot.prototype.compare4MultiplicationSquareRoot = function (x) {
    return 0;
  };

  SquareRoot.prototype.toString = function () {
    var fa = this.a.getPrecedence() < this.getPrecedence();
    return (fa ? "(" : "") + this.a.toString() + (fa ? ")" : "") + "^" + "0.5";
  };

  Expression.prototype.squareRoot = function () {
    var x = this;
    //?
    if (x instanceof Division) {
      return x.a.squareRoot().divide(x.b.squareRoot());
    }
    if (x instanceof Integer) {
      var n = x;
      if (n.compareTo(Integer.ZERO) < 0) {
        throw new RangeError("UserError");
      }
      if (n.compareTo(Integer.ZERO) === 0) {
        return x;
      }
      var t = Integer.ONE.add(Integer.ONE);
      var y = Integer.ONE;
      while (t.multiply(t).compareTo(n) <= 0) {
        while (n.remainder(t.multiply(t)).compareTo(Integer.ZERO) === 0) {
          n = n.truncatingDivide(t.multiply(t));
          y = y.multiply(t);
        }
        t = t.add(Integer.ONE);
      }
      if (n.compareTo(Integer.ONE) === 0) {
        return y;
      }
      if (y.compareTo(Integer.ONE) === 0) {
        return new SquareRoot(n);
      }
      return y.multiply(new SquareRoot(n));
    }
    throw new RangeError("UserError");
  };

  Expression.Rank = function (matrix) {
    Expression.Function.call(this, "rank", matrix);
  };
  Expression.Rank.prototype = Object.create(Expression.Function.prototype);

  Expression.prototype.rank = function () {
    var x = this;
    if (!(x instanceof Matrix)) {
      throw new RangeError("UserError");//?
    }
    //!
    if (Expression.callback !== undefined) {
      Expression.callback(new Expression.Event("rank", x));
    }
    return Integer.parseInteger(x.matrix.rank().toString());
  };
  Expression.Determinant = function (matrix) {
    Expression.Function.call(this, "determinant", matrix);
  };
  Expression.Determinant.prototype = Object.create(Expression.Function.prototype);
  Expression.prototype.determinant = function () {
    var x = this;
    if (!(x instanceof Matrix)) {
      throw new RangeError("UserError");//?
    }
    //!
    if (Expression.callback !== undefined) {
      Expression.callback(new Expression.Event("determinant", x));
    }
    return x.matrix.determinant();
  };
  Expression.Transpose = function (matrix) {
    Expression.Function.call(this, "transpose", matrix);
  };
  Expression.Transpose.prototype = Object.create(Expression.Function.prototype);
  Expression.prototype.transpose = function () {
    var x = this;
    if (!(x instanceof Matrix)) {
      throw new RangeError("UserError");//?
    }
    return new Matrix(x.matrix.transpose());
  };

  Expression.NoAnswerExpression = function (matrix, name) {
    Expression.Function.call(this, name, matrix);
  };
  Expression.NoAnswerExpression.prototype = Object.create(Expression.Function.prototype);
  Expression.prototype.transformNoAnswerExpression = function (name) {
    if (!(this instanceof Matrix)) {
      throw new RangeError("UserError");//?
    }
    return new Expression.NoAnswerExpression(this, name);
  };

  //Expression.NoAnswerExpression.prototype.multiplyExpression =
  //Expression.NoAnswerExpression.prototype.multiplyMatrix =
  //Expression.NoAnswerExpression.prototype.multiplySymbol =
  //Expression.NoAnswerExpression.prototype.multiplyInteger =
  Expression.NoAnswerExpression.prototype.multiply = function () {
    throw new RangeError("UserError");
  };

  Expression.ElementWisePower = function (a, b) {
    BinaryOperation.call(this, a, b);
  };
  Expression.ElementWisePower.prototype = Object.create(BinaryOperation.prototype);
  Expression.ElementWisePower.prototype.getS = function () {
    return ".^";
  };
  Expression.prototype.elementWisePower = function (e) {
    if (!(this instanceof Matrix)) {
      throw new RangeError("UserError");//?
    }
    return new Matrix(this.matrix.map(function (element, i, j) {
      return element.pow(e);
    }));
  };

  Expression.isRightToLeftAssociative = function (x) {
    if (x instanceof Negation) {
      return true;
    }
    if (x instanceof BinaryOperation) {
      if (x.isNegation()) {
        return true;
      }
      return x instanceof Exponentiation;
    }
    return false;
  };

  var everySimpleDivisorInteger = function (n, callback) {
    if (n.compareTo(Integer.ZERO) < 0) {
      n = n.negate();
    }
    var TWO = Integer.ONE.add(Integer.ONE);
    var d = TWO;
    var step = Integer.ONE;
    while (n.compareTo(Integer.ONE) > 0) {
      while (n.remainder(d).compareTo(Integer.ZERO) === 0) {
        n = n.truncatingDivide(d);
        if (!callback(d)) {
          return false;
        }
      }
      d = d.add(step);
      step = TWO;
      if (d.multiply(d).compareTo(n) > 0) {
        d = n;
      }
    }
    return true;
  };

  //?
  Expression.everySimpleDivisor = function (e, callback) {
    if (e instanceof Matrix) {
      throw new RangeError();
    }
    e = e.getNumerator();//?
    var v = getVariable(e);
    if (v !== undefined) {
      var c = content(e, v);
      if (!c.equals(Integer.ONE) && !Expression.everySimpleDivisor(c, callback)) {
        return false;
      }
      //?

      e = pp(e, v);

      //?
      if (e.equals(v) || e.negate().equals(v)) {//???
        if (!callback(v)) {
          return false;
        }
        return true;
      }

      var coefficients = getCoefficients(e, v);
      var an = coefficients[coefficients.length - 1].coefficient;
      var a0 = coefficients[0].coefficient;

      var flag = Expression.everyDivisor(a0, function (p) {
        return Expression.everyDivisor(an, function (q) {
          // calcAt(p.divide(q), coefficients)
          var s = 2;
          var f = p.divide(q);
          while (--s >= 0) {
            if (s === 0) {
              f = f.negate();
            }

            //var x = v.subtract(f);
            var x = s === 0 ? v.multiply(q).subtract(p) : v.multiply(q).add(p);

            var z = divideAndRemainderInternal(e, x, v);
            while (z !== undefined && z[1].equals(Integer.ZERO)) {
              e = z[0];
              if (!callback(x)) {
                return false;
              }
              z = divideAndRemainderInternal(e, x, v);
            }

          }
          return true;
        });
      });
      if (!flag) {
        return false;
      }
      if (!e.equals(Integer.ONE.negate())) {//?
        if (!e.equals(Integer.ONE)) {
          return callback(e);
        }
      }
    } else {
      if (e instanceof Symbol) {
        if (!callback(Integer.ONE)) {
          return false;
        }
        if (!callback(e)) {
          return false;
        }
      } else if (e instanceof Integer) {
        return everySimpleDivisorInteger(e, callback);
      } else {
        throw new RangeError();//?
      }
    }
    return true;
  };

  Expression.everyDivisor = function (e, callback) {
    var divisors = [];
    if (!callback(Integer.ONE)) {
      return false;
    }
    return Expression.everySimpleDivisor(e, function (d) {
      var l = divisors.length;
      var n = 1;
      var k = -1;
      while (++k < l) {
        n *= 2;
      }
      var i = -1;
      while (++i < n) {
        var z = d;
        var j = -1;
        var x = i;
        while (++j < l) {
          var half = Math.trunc(x / 2);
          if (half * 2 !== x) {
            z = z.multiply(divisors[j]);
          }
          x = half;
        }
        if (!callback(z)) {
          return false;
        }
      }
      divisors.push(d);
      return true;
    });
  };

  Expression.getDivisors = function (e) {
    var divisors = [];
    Expression.everyDivisor(e, function (d) {
      divisors.push(d);
      return true;
    });
    return divisors;
  };

  Expression.Integer = Integer;
  Expression.Symbol = Symbol;
  Expression.Matrix = Matrix;
  Expression.SquareRoot = SquareRoot;
  Expression.Negation = Negation;
  Expression.BinaryOperation = BinaryOperation;
  Expression.Exponentiation = Exponentiation;
  Expression.Multiplication = Multiplication;
  Expression.Addition = Addition;
  Expression.Division = Division;
  Expression.pow = pow;

  global.Expression = Expression;

  Integer.ZERO = Integer.parseInteger("0");
  Integer.ONE = Integer.parseInteger("1");
  Integer.TEN = Integer.parseInteger("10");

  // --- 


  function ExpressionFactory() {
  }
  ExpressionFactory.parseInteger = function (s) {
    return Expression.Integer.parseInteger(s);
  };
  ExpressionFactory.createMatrix = function (x) {
    return new Expression.Matrix(x);
  };
  ExpressionFactory.createSymbol = function (x) {
    return new Expression.Symbol(x);
  };
  ExpressionFactory.ZERO = Expression.Integer.ZERO;
  ExpressionFactory.ONE = Expression.Integer.ONE;
  ExpressionFactory.TEN = Expression.Integer.TEN;

  
  Expression.Equals = function (a, b) {
    BinaryOperation.call(this, a, b);
  };

  Expression.Equals.prototype = Object.create(BinaryOperation.prototype);
  
  var AdditionIterator = function (e) {
    this.e = e;
  };
  AdditionIterator.prototype.value = function () {
    if (this.e === undefined) {
      return undefined;
    }
    return getLastAdditionOperand(this.e);
  };
  AdditionIterator.prototype.next = function () {
    if (this.e === undefined) {
      return undefined;
    }
    return new AdditionIterator(getRestAdditionOperand(this.e));
  };

  Expression.prototype.summands = function () {
    return new AdditionIterator(this);
  };

  Expression.prototype.factors = function () {
    return new MultiplicationIterator(this);
  };

  // TODO: NotSupportedError
  Expression.prototype.transformEquals = function (b) {
    var withX = undefined;
    var e = this.subtract(b);

    var i = e.summands();
    var summand = undefined;
    while ((summand = i.value()) != undefined) {
      i = i.next();
      var j = summand.factors();
      var factor = undefined;
      while ((factor = j.value()) != undefined) {
        j = j.next();
        var factorBase = getBase(factor);
        if (!(factorBase instanceof Integer) && !(factorBase instanceof Symbol)) {
          throw new RangeError("NotSupportedError");
        }
        if (factorBase instanceof Symbol) {
          var s = factorBase.toString();
          if (s === "X") {
            if (withX != undefined) {
              throw new RangeError("NotSupportedError");
            }
            withX = summand;
          }
        }
      }
    }

    var withoutX = undefined;
    var i = e.summands();
    var summand = undefined;
    while ((summand = i.value()) != undefined) {
      i = i.next();
      if (withX !== summand) {
        withoutX = withoutX == undefined ? summand.negate() : withoutX.subtract(summand);
      }
    }

    console.log(withX.toString() + "=" + withoutX.toString());

    var right = withoutX;

    var isToTheLeft = true;
    var j = withX.factors();
    var factor = undefined;
    while ((factor = j.value()) != undefined) {
      j = j.next();
      var factorBase = getBase(factor);
      if (!(factorBase instanceof Integer) && !(factorBase instanceof Symbol)) {
        throw new RangeError("NotSupportedError");
      }
      var isX = false;
      if (factorBase instanceof Symbol) {
        var s = factorBase.toString();
        if (s === "X") {
          isX = true;
          isToTheLeft = false;
        }
      }
      if (!isX) {
        if (isToTheLeft) {
          right = factor.inverse().multiply(right);
        } else {
          right = right.multiply(factor.inverse());
        }
      }
    }

    console.log("X=" + right.toString());

    return new Expression.Equals(withX, b);
  };

  global.ExpressionFactory = ExpressionFactory;

}(this));

/*global Expression*/

(function (global) {
  "use strict";

  var idCounter = 0;

  function NonSimplifiedExpression(e) {
    //Expression.call(this);
    this.e = e;
    this.id = "e" + (idCounter += 1).toString();
  }

  NonSimplifiedExpression.prototype = Object.create(Expression.prototype);
  
  // same set of public properties (and same order) as for Expressions ... 
  NonSimplifiedExpression.prototype.negate = function () {
    return new NonSimplifiedExpression(new Expression.Negation(this));
  };
  NonSimplifiedExpression.prototype.add = function (y) {
    return new NonSimplifiedExpression(new Expression.Addition(this, y));
  };
  NonSimplifiedExpression.prototype.divide = function (y, allowConjugate) {
    return new NonSimplifiedExpression(new Expression.Division(this, y));
  };
  NonSimplifiedExpression.prototype.multiply = function (y) {
    return new NonSimplifiedExpression(new Expression.Multiplication(this, y));
  };
  NonSimplifiedExpression.prototype.pow = function (y) {
    return new NonSimplifiedExpression(new Expression.Exponentiation(this, y));
  };

  NonSimplifiedExpression.prototype.powExpression = function (x) {
    return new NonSimplifiedExpression(new Expression.Exponentiation(x, this));
  };
  NonSimplifiedExpression.prototype.multiplyAddition = function (x) {
    return new NonSimplifiedExpression(new Expression.Multiplication(x, this));
  };
  NonSimplifiedExpression.prototype.multiplyMultiplication = function (x) {
    return new NonSimplifiedExpression(new Expression.Multiplication(x, this));
  };
  NonSimplifiedExpression.prototype.multiplyDivision = function (x) {
    return new NonSimplifiedExpression(new Expression.Multiplication(x, this));
  };
  NonSimplifiedExpression.prototype.multiplyMatrix = function (x) {
    return new NonSimplifiedExpression(new Expression.Multiplication(x, this));
  };
  NonSimplifiedExpression.prototype.addDivision = function (x) {
    return new NonSimplifiedExpression(new Expression.Addition(x, this));
  };

  //?
  NonSimplifiedExpression.prototype.addMatrix = function (x) {
    return new NonSimplifiedExpression(new Expression.Addition(x, this));
  };

  NonSimplifiedExpression.prototype.addExpression = function (x) {
    return new NonSimplifiedExpression(new Expression.Addition(x, this));
  };
  NonSimplifiedExpression.prototype.multiplyExpression = function (x) {
    return new NonSimplifiedExpression(new Expression.Multiplication(x, this));
  };
  NonSimplifiedExpression.prototype.divideExpression = function (x, allowConjugate) {
    return new NonSimplifiedExpression(new Expression.Division(x, this));
  };

  NonSimplifiedExpression.prototype.squareRoot = function () {
    return new NonSimplifiedExpression(new Expression.SquareRoot(this));
  };
  NonSimplifiedExpression.prototype.rank = function () {
    return new NonSimplifiedExpression(new Expression.Rank(this));
  };
  NonSimplifiedExpression.prototype.determinant = function () {
    return new NonSimplifiedExpression(new Expression.Determinant(this));
  };
  NonSimplifiedExpression.prototype.transpose = function () {
    return new NonSimplifiedExpression(new Expression.Transpose(this));
  };

  NonSimplifiedExpression.prototype.elementWisePower = function (a) {
    return new NonSimplifiedExpression(new Expression.ElementWisePower(this, a));
  };
  NonSimplifiedExpression.prototype.transformNoAnswerExpression = function (name) {
    return new NonSimplifiedExpression(new Expression.NoAnswerExpression(this, name));
  };
  NonSimplifiedExpression.prototype.transformEquals = function (b) {
    return new NonSimplifiedExpression(new Expression.Equals(this, b));
  };

  //TODO:
  Expression.prototype.simplifyInternal = function () {
    return this;
  };
  Expression.Exponentiation.prototype.simplifyInternal = function () {
    return this.a.simplify().pow(this.b.simplify());
  };
  Expression.Multiplication.prototype.simplifyInternal = function () {
    return this.a.simplify().multiply(this.b.simplify());
  };
  Expression.Addition.prototype.simplifyInternal = function () {
    return this.a.simplify().add(this.b.simplify());
  };
  Expression.Division.prototype.simplifyInternal = function () {
    return this.a.simplify().divide(this.b.simplify());
  };
  Expression.SquareRoot.prototype.simplifyInternal = function () {
    return this.a.simplify().squareRoot();
  };
  Expression.Rank.prototype.simplifyInternal = function () {
    return this.a.simplify().rank();
  };
  Expression.Determinant.prototype.simplifyInternal = function () {
    return this.a.simplify().determinant();
  };
  Expression.Transpose.prototype.simplifyInternal = function () {
    return this.a.simplify().transpose();
  };
  Expression.NoAnswerExpression.prototype.simplifyInternal = function () {
    return this.a.simplify().transformNoAnswerExpression(this.name);
  };
  Expression.Equals.prototype.simplifyInternal = function () {
    return this.a.simplify().transformEquals(this.b.simplify());
  };
  Expression.Matrix.prototype.simplifyInternal = function () {
    return new Expression.Matrix(this.matrix.map(function (e, i, j) {
      return e.simplify();
    }));
  };

  Expression.prototype.simplify = function () {
    return this;//? this.simplifyInternal();
  };
  NonSimplifiedExpression.prototype.simplify = function () {
    return this.e.simplifyInternal();
  };
  NonSimplifiedExpression.prototype.toString = function () {
    return this.e.toString();
  };
  NonSimplifiedExpression.prototype.equals = function (y) {
    return this.simplify().equals(y.simplify());
  };
  NonSimplifiedExpression.prototype.toMathML = function (options) {
    //return this.e.toMathML(options);
    if (options.allowHighlight === true) {
      var highlight = this.getIds().slice(1).join(", ");
      return "<mrow id=\"" + this.id + "\" " + (highlight !== "" ? "tabindex=\"0\"" : "") + ">" + this.e.toMathML(Object.assign({}, options, {allowHighlight: false})) + "</mrow>" + (highlight !== "" ? "<mtext hidden><a class=\"a-highlight\" data-for=\"" + this.id + "\" data-highlight=\"" + highlight + "\"></a></mtext>" : "");
    }
    return this.e.toMathML(options);
  };

  //!
  Expression.Negation.prototype.simplifyInternal = function () {
    return this.b.simplify().negate();
  };
  NonSimplifiedExpression.prototype.getPrecedence = function () {
    return this.e.getPrecedence();
  };

//?
  Expression.prototype.getIds = function () {
    return [];
  };
  Expression.BinaryOperation.prototype.getIds = function () {
    return this.a.getIds().concat(this.b.getIds());
  };
  NonSimplifiedExpression.prototype.getIds = function () {
    return ["#" + this.id].concat(this.e.getIds());
  };

  Expression.NonSimplifiedExpression = NonSimplifiedExpression;
  global.NonSimplifiedExpression = NonSimplifiedExpression;

}(this));
/*jslint plusplus: true, vars: true, indent: 2 */
/*global Expression, Matrix, Map, NonSimplifiedExpression, ExpressionFactory */

(function (exports) {
  "use strict";

  var RPN = undefined;

  var isAlpha = function (code) {
    return (code >= "a".charCodeAt(0) && code <= "z".charCodeAt(0)) ||
           (code >= "A".charCodeAt(0) && code <= "Z".charCodeAt(0));
  };
  
  // http://en.wikipedia.org/wiki/Operators_in_C_and_C%2B%2B#Operator_precedence

  var Operator = function (name, arity, rightToLeftAssociative, precedence, i) {
    this.name = name;
    this.arity = arity;
    this.rightToLeftAssociative = rightToLeftAssociative;
    this.precedence = precedence;
    this.i = i;
    this.xyz = isAlpha(name.charCodeAt(0)) && isAlpha(name.charCodeAt(name.length - 1));
  };

  var ADDITION = new Operator("+", 2, false, 2, function (a, b) {
    return a.add(b);
  });
  var MULTIPLICATION = new Operator("*", 2, false, 3, function (a, b) {
    return a.multiply(b);
  });
  var EXPONENTIATION = new Operator("^", 2, true, 5, function (a, b) {
    return a.pow(b);
  });
  var operations = [
    ADDITION,
    new Operator("-", 2, false, 2, function (a, b) {
      return a.subtract(b);
    }),
    MULTIPLICATION,
    new Operator("/", 2, false, 3, function (a, b) {
      return a.divide(b);
    }),
    //new Operator("%", 2, false, 3, function (a, b) {
    //  return a.remainder(b);
    //}),
    new Operator("+", 1, true, 5, function (e) {
      return e;
    }),
    new Operator("-", 1, true, 5, function (e) {
      return e.negate();
    }),
    EXPONENTIATION,
    new Operator(".^", 2, true, 5, function (a, b) {
      return a.elementWisePower(b);
    }),//?
    new Operator("\u221a", 1, true, 5, function (a) {
      return a.squareRoot();
    }),
    new Operator("sqrt", 1, true, 5, function (a) {
      return a.squareRoot();
    }),
    new Operator("rank", 1, true, 5, function (a) {
      return a.rank();
    }),
    //new Operator("trace", 1, true, 5, function (a) {
    //  return Expression.transformTrace(a);
    //}),
    new Operator("determinant", 1, true, 5, function (a) {
      return a.determinant();
    }),
    new Operator("transpose", 1, true, 5, function (a) {
      return a.transpose();
    }),
    new Operator("^T", 1, false, 5, function (a) {
      return a.transpose();
    }),
    new Operator("Gaussian-elimination", 1, true, 5, function (a) {
      return a.transformNoAnswerExpression("Gaussian-elimination");
    }),
    new Operator("diagonalize", 1, true, 5, function (a) {
      return a.transformNoAnswerExpression("diagonalize");
    }),
    new Operator("solve-using-Gaussian-elimination", 1, true, 5, function (a) {
      return a.transformNoAnswerExpression("solve-using-Gaussian-elimination");
    }),
    new Operator("solve-using-Gauss-Jordan-elimination", 1, true, 5, function (a) {
      return a.transformNoAnswerExpression("solve-using-Gauss-Jordan-elimination");
    }),
    new Operator("solve-using-Montante-method", 1, true, 5, function (a) {
      return a.transformNoAnswerExpression("solve-using-Montante-method");
    }),
    new Operator("solve-using-Cramer's-rule", 1, true, 5, function (a) {
      return a.transformNoAnswerExpression("solve-using-Cramer's-rule");
    }),
    new Operator("solve-using-inverse-matrix-method", 1, true, 5, function (a) {
      return a.transformNoAnswerExpression("solve-using-inverse-matrix-method");
    }),
    //?
    new Operator("solve", 1, true, 5, function (a) {
      if (Expression.callback !== undefined) {
        Expression.callback(new Expression.Event("solve", a));
      }
      return a.transformNoAnswerExpression("solve");//?
    }),
    new Operator("analyse-compatibility", 1, true, 5, function (a) {
      return a.transformNoAnswerExpression("analyse-compatibility");
    }),
    new Operator("=", 2, false, 2, function (a, b) {
      if (!RPN.isDebugging) {
        throw new RangeError("NotSupportedError");
      }
      return a.transformEquals(b);
    }),
    new Operator(";", 2, false, 1, function (a, b) {
      if (!RPN.isDebugging) {
        throw new RangeError("NotSupportedError");
      }
      return a.transformStatement(b);
    })
  ];

  var operationSearchCache = new Map();
  var addOperationToSearchCache = function (operator) {
    var c = operator.name.charCodeAt(0);
    if (operationSearchCache.get(c) === undefined) {
      operationSearchCache.set(c, []);
    }
    operationSearchCache.get(c).push(operator);
  };

  var i = -1;
  while (++i < operations.length) {
    addOperationToSearchCache(operations[i]);
  }

  function Input() {
  }

  Input.EOF = -1;
  Input.trimLeft = function (input, position, skip) {
    var tmp = Input.exec(input, position + skip, whiteSpaces);
    return position + skip + (tmp === undefined ? 0 : tmp[0].length);
  };
  Input.parseCharacter = function (input, position, characterCode) {
    var c = Input.getFirst(input, position);
    if (c !== characterCode) {
      // TODO: fix error messages
      // missing the brace ?
      // throw new RangeError("UserError");// "RPN error 0", input ?
      throw new RangeError("UserError");
    }
    return Input.trimLeft(input, position, 1);
  };
  Input.getFirst = function (input, position) {
    return position < input.length ? input.charCodeAt(position) : Input.EOF;
  };
  Input.startsWith = function (input, position, s) {
    var length = s.length;
    if (position + length > input.length) {
      return false;
    }
    var i = -1;
    while (++i < length) {
      if (input.charCodeAt(position + i) !== s.charCodeAt(i)) {
        return false;
      }
    }
    return true;
  };
  Input.exec = function (input, position, regularExpression) {
    // regularExpression.lastIndex = position;
    // return regularExpression.exec(input);
    if (position === input.length) {
      return undefined;
    }
    var match = regularExpression.exec(position === 0 ? input : input.slice(position));
    return match == undefined || match[0].length === 0 ? undefined : match;
  };

  var MATRIX_OPENING_BRACKET = "{".charCodeAt(0);
  var MATRIX_CLOSING_BRACKET = "}".charCodeAt(0);
  var GROUPING_OPENING_BRACKET = "(".charCodeAt(0);
  var GROUPING_CLOSING_BRACKET = ")".charCodeAt(0);
  var DELIMITER = ",".charCodeAt(0);
  
  function ParseResult(result, position) {
    this.result = result;
    this.position = position;
  }

  var parseMatrix = function (input, position, context) {
    var openingBracket = MATRIX_OPENING_BRACKET;
    var closingBracket = MATRIX_CLOSING_BRACKET;

    position = Input.parseCharacter(input, position, openingBracket);
    var rows = [];
    var firstRow = true;
    while (firstRow || Input.getFirst(input, position) === DELIMITER) {
      if (firstRow) {
        firstRow = false;
      } else {
        position = Input.trimLeft(input, position, 1);
      }
      position = Input.parseCharacter(input, position, openingBracket);
      var row = [];
      var firstCell = true;
      while (firstCell || Input.getFirst(input, position) === DELIMITER) {
        if (firstCell) {
          firstCell = false;
        } else {
          position = Input.trimLeft(input, position, 1);
        }
        var tmp = parseExpression(input, position, context, true, 0, undefined);
        position = tmp.position;
        row.push(tmp.result);
      }
      position = Input.parseCharacter(input, position, closingBracket);
      rows.push(row);
    }
    position = Input.parseCharacter(input, position, closingBracket);
    return new ParseResult(context.wrap(RPN.createMatrix(Matrix.padRows(rows, false))), position);
  };

  var getDecimalFraction = function (match) {
    //! in IE8 match[n] can be empty string, not undefined
    var i = 0;
    while (++i < 9) {
      if (match[i] === "") {
        match[i] = undefined;
      }
    }

    var integerPartAsString = match[1];
    var nonRepeatingFractionalPartAsString = integerPartAsString !== undefined ? match[2] : match[4];
    var repeatingFractionalPartAsString = integerPartAsString !== undefined ? match[3] : (nonRepeatingFractionalPartAsString !== undefined ? match[5] : match[6]);
    var exponentSingPartAsString = match[7];
    var exponentPartAsString = match[8];

    var numerator = RPN.ZERO;
    var denominator = undefined;
    var factor = undefined;

    if (integerPartAsString !== undefined) {
      numerator = RPN.parseInteger(integerPartAsString);
    }
    if (nonRepeatingFractionalPartAsString !== undefined) {
      factor = Expression.pow(RPN.TEN, nonRepeatingFractionalPartAsString.length, RPN.ONE);
      numerator = numerator.multiply(factor).add(RPN.parseInteger(nonRepeatingFractionalPartAsString));
      denominator = denominator === undefined ? factor : denominator.multiply(factor);
    }
    if (repeatingFractionalPartAsString !== undefined) {
      factor = Expression.pow(RPN.TEN, repeatingFractionalPartAsString.length, RPN.ONE).subtract(RPN.ONE);
      numerator = numerator.multiply(factor).add(RPN.parseInteger(repeatingFractionalPartAsString));
      denominator = denominator === undefined ? factor : denominator.multiply(factor);
    }
    if (exponentPartAsString !== undefined) {
      factor = Expression.pow(RPN.TEN, Number.parseInt(exponentPartAsString, 10), RPN.ONE);
      if (exponentSingPartAsString === "-") {
        denominator = denominator === undefined ? factor : denominator.multiply(factor);
      } else {
        numerator = numerator.multiply(factor);
      }
    }

    var value = denominator === undefined ? numerator : numerator.divide(denominator);
    return value;
  };

  // TODO: sticky flags - /\s+/y
  var whiteSpaces = /^\s+/;
  var symbols = /^[a-zA-Z\u0430-\u044F\u0410-\u042F\u03b1-\u03c9](?:\_\d+|\_\([a-z\d]+,[a-z\d]+\))?/;
  var decimalFractionRegExp = /^(?:(\d+)(?:[\.,](\d+)?(?:\((\d+)\))?)?|[\.,](?:(\d+)(?:\((\d+)\))?|(?:\((\d+)\))))(?:(?:e|E)(\+|-)?(\d+))?/;
  var decimalFractionRegExpWithoutComma = /^(?:(\d+)(?:[\.](\d+)?(?:\((\d+)\))?)?|[\.](?:(\d+)(?:\((\d+)\))?|(?:\((\d+)\))))(?:(?:e|E)(\+|-)?(\d+))?/;
  var superscripts = /^[\u00B2\u00B3\u00B9\u2070\u2074-\u2079]+/;
  var vulgarFractions = /^[\u00bc-\u00be\u2150-\u215e]/;

  // s.normalize("NFKD").replace(/[\u2044]/g, "/")
  var normalize = function (s) {
    return s.replace(/[\u00B2\u00B3\u00B9\u2070\u2074-\u2079]/g, function (c) {
      var charCode = c.charCodeAt(0);
      if (charCode === 0x00B2) {
        return "2";
      }
      if (charCode === 0x00B3) {
        return "3";
      }
      if (charCode === 0x00B9) {
        return "1";
      }
      if (charCode === 0x2070) {
        return "0";
      }
      return (charCode - 0x2074 + 4).toString();
    }).replace(/[\u00BC-\u00BE\u2150-\u215E]/g, function (c) {
      var charCode = c.charCodeAt(0);
      var i = charCode - 0x2150 < 0 ? (charCode - 0x00BC) * 2 : (3 + charCode - 0x2150) * 2;
      return "141234171911132315253545165618385878".slice(i, i + 2).replace(/^\S/, "$&/").replace(/1\/1/, "1/10");
    });
  };

  var parseExpression = function (input, position, context, isMatrixElement, precedence, left) {
    var ok = true;
    var firstCharacterCode = Input.getFirst(input, position);
    //!

    while (firstCharacterCode !== Input.EOF && ok) {
      var op = undefined;
      var operand = undefined;
      var tmp = undefined;
      var match = undefined;
      var isOnlyInteger = false;

      var operationsArray = operationSearchCache.get(firstCharacterCode);
      if (operationsArray !== undefined) {
        var length = operationsArray.length;
        var bestMatchLength = 0;//? "^T" and "^"
        var j = -1;
        while (++j < length) {
          var candidate = operationsArray[j];
          if ((left !== undefined || candidate.arity === 1 && candidate.rightToLeftAssociative) &&
              Input.startsWith(input, position, candidate.name) &&
              (!candidate.xyz || (!isAlpha(position === 0 ? -1 : Input.getFirst(input, position - 1)) && !isAlpha(Input.getFirst(input, position + candidate.name.length)))) &&//TODO: fix - RPN("George")
              bestMatchLength < candidate.name.length) {
            op = candidate;
            bestMatchLength = op.name.length;
          }
        }
      }

      if (op !== undefined) {
        if (precedence > op.precedence + (op.rightToLeftAssociative ? 0 : -1)) {
          ok = false;
        } else {
          position = Input.trimLeft(input, position, op.name.length);
          if (op.arity === 1 && !op.rightToLeftAssociative) {
            left = op.i(left);
          } else {
            tmp = parseExpression(input, position, context, isMatrixElement, op.precedence, undefined);
            var right = tmp.result;
            position = tmp.position;
            if (op.arity === 1) {
              left = op.i(right);
            } else if (op.arity === 2) {
              left = op.i(left, right);
            } else {
              throw new RangeError();
            }
          }
        }
      } else if (left === undefined || precedence < MULTIPLICATION.precedence) {
        if (firstCharacterCode === GROUPING_OPENING_BRACKET) {
          position = Input.parseCharacter(input, position, GROUPING_OPENING_BRACKET);
          tmp = parseExpression(input, position, context, isMatrixElement, 0, undefined);
          operand = tmp.result;
          position = tmp.position;
          position = Input.parseCharacter(input, position, GROUPING_CLOSING_BRACKET);
        } else if (firstCharacterCode === MATRIX_OPENING_BRACKET) {
          tmp = parseMatrix(input, position, context);
          operand = tmp.result;
          position = tmp.position;
        } else if ((match = Input.exec(input, position, isMatrixElement ? decimalFractionRegExpWithoutComma : decimalFractionRegExp)) !== undefined) { // $ ?for RPN
          operand = context.wrap(getDecimalFraction(match));
          position = Input.trimLeft(input, position, match[0].length);
          //!
          isOnlyInteger = match[1] !== undefined && match[0].length === match[1].length;
        } else if ((match = Input.exec(input, position, symbols)) !== undefined) {
          operand = context.get(match[0]);
          if (operand === undefined) {
//            operand = match[0] === "I" || match[0] === "E" ? new Expression.IdentityMatrix(match[0]) : RPN.createSymbol(match[0]);
            operand = RPN.createSymbol(match[0]);
            operand = context.wrap(operand);
          } else {
            operand = context.wrap(operand);
          }
          position = Input.trimLeft(input, position, match[0].length);
        } else {
          ok = false;
        }
      } else {
        ok = false;
      }

      //!TODO: fix
      if (!ok && left !== undefined && precedence <= EXPONENTIATION.precedence + (EXPONENTIATION.rightToLeftAssociative ? 0 : -1)) {
        if ((match = Input.exec(input, position, superscripts)) !== undefined) {
          // implicit exponentiation
          left = EXPONENTIATION.i(left, RPN.parseInteger(normalize(match[0])));
          position = Input.trimLeft(input, position, match[0].length);
          ok = true;//!
        }
      }
      if (!ok || isOnlyInteger) {
        if ((match = Input.exec(input, position, vulgarFractions)) !== undefined) {
          tmp = parseExpression(normalize(match[0]), 0, context, isMatrixElement, 0, undefined);
          if (isOnlyInteger) {
            operand = ADDITION.i(operand, tmp.result);
          } else {
            operand = tmp.result;
          }
          position = Input.trimLeft(input, position, match[0].length);
          ok = true;//!
        }
      }

      if (operand !== undefined) {
        if (left !== undefined) {
          // implied multiplication
          tmp = parseExpression(input, position, context, isMatrixElement, MULTIPLICATION.precedence, operand);
          var right1 = tmp.result;
          position = tmp.position;
          left = MULTIPLICATION.i(left, right1);
        } else {
          left = operand;
        }
      }
      firstCharacterCode = Input.getFirst(input, position);
    }

    if (left === undefined) {
      throw new RangeError("UserError");//(!) TODO: "RPN error 2", input
    }
    return new ParseResult(left, position);
  };

  var table = {
    "\u0410": "A",
    "\u0430": "A",
    "\u0412": "B",
    "\u0432": "B",
    "\u0421": "C",
    "\u0441": "C",
    "\u00B7": "*",
    "\u00D7": "*",
    "\u2022": "*",
    "\u22C5": "*",
    "\u2011": "-",
    "\u2012": "-",
    "\u2013": "-",
    "\u2014": "-",
    "\u2015": "-",
    "\u2212": "-",
    "\uFF0D": "-",
    "\u00F7": "/"
  };
  var replaceRegExp = /[\u0410\u0430\u0412\u0432\u0421\u0441\u00B7\u00D7\u2022\u22C5\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFF0D\u00F7]/g;
  var replaceFunction = function (c) {
    return table[c];
  };

  RPN = function (input, context) {
    context = context == undefined ? new RPN.SimpleContext() : context;

    // TODO: remove
    if (input !== input.toString()) {
      throw new RangeError();
    }

    if (RPN.currentInput != undefined) {
      RPN.currentInput.push({
        input: input
      });
    }

    //TODO: fix ???
    input = input.replace(replaceRegExp, replaceFunction);

    var position = 0;
    position = Input.trimLeft(input, position, 0);
    var tmp = parseExpression(input, position, context, false, 0, undefined);
    if (Input.getFirst(input, tmp.position) !== Input.EOF) {
      throw new RangeError("UserError");// TODO: fix
    }

    if (RPN.currentInput !== undefined) {
      RPN.currentInput.pop(); //!
    }
    return tmp.result;
  };

  RPN.Context = function (x) {
    this.get = x.get;
  };

  RPN.Context.prototype.wrap = function (e) {
    return new NonSimplifiedExpression(e);
  };

  RPN.SimpleContext = function (x) {
  };
  RPN.SimpleContext.prototype.get = function (e) {
    return undefined;
  };
  RPN.SimpleContext.prototype.wrap = function (e) {
    return e;
  };

  RPN.addDenotation = function (operationName, denotation) {
    var operations = operationSearchCache.get(operationName.charCodeAt(0));
    var operation = undefined;
    var i = -1;
    while (++i < operations.length) {
      var o = operations[i];
      if (o.name === operationName) {
        operation = o;
      }
    }
    var newOperation = new Operator(denotation, operation.arity, operation.rightToLeftAssociative, operation.precedence, operation.i);
    operations.push(newOperation);
    addOperationToSearchCache(newOperation);
  };
  RPN.currentInput = undefined;

  RPN.parseInteger = ExpressionFactory.parseInteger;
  RPN.createMatrix = ExpressionFactory.createMatrix;
  RPN.createSymbol = ExpressionFactory.createSymbol;
  RPN.ZERO = ExpressionFactory.ZERO;
  RPN.ONE = ExpressionFactory.ONE;
  RPN.TEN = ExpressionFactory.TEN;

  // Polynom([a0, a1, a2, ...., an]);
  // an*x^n+ an-1 x ^n-1 +... + a0

  //!  
  Expression.Division.prototype.negate = function () {
    return new Expression.Division(this.a.negate(), this.b);
  };

  function Polynom(a) {
    var length = a.length;
    while (length !== 0 && a[length - 1].equals(RPN.ZERO)) {
      length -= 1;
    }
    var data = new Array(length);
    for (var i = 0; i < length; i += 1) {
      data[i] = a[i];
    }
    this.a = data;
  }

  Polynom.prototype = Object.create(Expression.prototype);

  Polynom.ZERO = new Polynom(new Array(0));

  Polynom.prototype.equals = function (y) {
    return y.equalsPolynom(this);
  };
  Polynom.prototype.equalsInteger = function (y) {
    return y.equalsPolynom(this);
  };
  Expression.prototype.equalsPolynom = function (x) {
    return false;
  };
  Expression.Integer.prototype.equalsPolynom = function (x) {
    return x.a.length === 0 && this.equals(RPN.ZERO) || x.a.length === 1 && this.equals(x.a[0]);
  };

  Polynom.prototype.equalsPolynom = function (p) {
    var i = this.a.length;
    if (i !== p.a.length) {
      return false;
    }
    while (--i >= 0) {
      if (!this.a[i].equals(p.a[i])) {
        return false;
      }
    }
    return true;
  };

  Polynom.prototype.add = function (p) {
    var length = Math.max(this.a.length, p.a.length);
    var l = Math.min(this.a.length, p.a.length);
    var result = new Array(length);
    for (var i = 0; i < l; i += 1) {
      result[i] = this.a[i].add(p.a[i]);
    }
    for (var j = l; j < length; j += 1) {
      result[j] = j < this.a.length ? this.a[j] : p.a[j];
    }
    return new Polynom(result);
  };

  Polynom.prototype.shift = function (n) { // <<<= x^n, n>=0
    var data = this.a;
    var newData = new Array(data.length === 0 ? 0 : data.length + n);
    if (data.length !== 0) {
      for (var i = 0; i < n; i += 1) {
        newData[i] = RPN.ZERO;
      }
      for (var j = 0; j < data.length; j += 1) {
        newData[j + n] = data[j];
      }
    }
    return new Polynom(newData);
  };

  Polynom.prototype.multiply = function (p) {
    return p.multiplyPolynom(this);
  };
  Expression.Division.prototype.multiplyPolynom = function (p) {
    return this.multiplyExpression(p);
  };
  Polynom.prototype.multiplyPolynom = function (p) {
    if (p.a.length === 0 || this.a.length === 0) {
      return new Polynom(new Array(0));
    }
    var newData = new Array(p.a.length + this.a.length - 1);
    for (var k = 0; k < newData.length; k += 1) {
      newData[k] = undefined;
    }
    var i = p.a.length;
    while (--i >= 0) {
      var j = this.a.length;
      while (--j >= 0) {
        var x = this.a[j].multiply(p.a[i]);
        newData[i + j] = newData[i + j] == undefined ? x : newData[i + j].add(x);
      }
    }
    return new Polynom(newData);
  };

  Polynom.prototype.divideAndRemainder = function (p) {
    if (p.equals(Polynom.ZERO)) {
      throw new RangeError("ArithmeticException");
    }
    var div = Polynom.ZERO;
    var rem = this;
    while (rem.a.length >= p.a.length) {
      var q = rem.a[rem.a.length - 1].divide(p.a[p.a.length - 1]);
      var pq = new Polynom([q]);
      div = div.add(pq.shift(rem.a.length - p.a.length));
      rem = rem.subtract(p.multiply(pq).shift(rem.a.length - p.a.length));
    }
    return [div, rem];
  };

  Polynom.prototype.calcAt = function (point) {//!!!
    var n = RPN.ZERO;
    var i = this.a.length;
    while (--i >= 0) {
      n = n.multiply(point).add(this.a[i]);
    }
    return n;
  };

  Polynom.prototype.getcoef = function () {
    if (this.a.length === 0) {
      throw new RangeError();
    }
    var cf = this.a[this.a.length - 1];
    var i = this.a.length - 1;
    while (--i >= 0) {
      if (!this.a[i].equals(RPN.ZERO)) {
        //cf = cf.commonFraction(this.a[i]);
        var y = this.a[i];
        var lcm = cf.getDenominator().divide(cf.getDenominator().gcd(y.getDenominator())).multiply(y.getDenominator());
        cf = cf.getNumerator().gcd(y.getNumerator()).divide(lcm);
      }
    }
    return cf;
  };

  // add, multiply, divideAndRemainder

  Polynom.prototype.negate = function () {
    //TODO: fix
    return this.multiply(new Polynom([RPN.ONE.negate()]));
  };

  Polynom.prototype.subtract = function (l) {
    return this.negate().add(l).negate();
  };

  Polynom.prototype.divide = function (l) {
    if (l.equals(RPN.ONE)) {
      return this;
    }
    return l.dividePolynom(this);
  };
  Expression.Division.prototype.dividePolynom = function (p) {
    return this.divideExpression(p);
  };
  Polynom.prototype.dividePolynom = function (l) {
    //return this.divideAndRemainder(l)[0];
    var a = l;
    var b = this;
    if (a.a.length === 0 && b.a.length !== 0) {
      return a;
    }
    var t = undefined;
    while (b.a.length !== 0) {
      t = a.remainder(b);
      a = b;
      b = t;
    }
    var gcd = a;
    var x = l.divideAndRemainder(gcd)[0];
    return this.equals(gcd) ? x : new Expression.Division(x, this.divideAndRemainder(gcd)[0]);
  };

  Polynom.prototype.remainder = function (l) {
    return this.divideAndRemainder(l)[1];
  };

  Polynom.prototype.getroots = function () {
    var roots = [];
    var np = this.divide(new Polynom([this.getcoef()]));

    var specialCases = [{ // x = 0, x = 1, x = -1
      x: new Polynom([RPN.ZERO, RPN.ONE]),
      f: RPN.ZERO
    },
      {
        x: new Polynom([RPN.ONE.negate(), RPN.ONE]),
        f: RPN.ONE
      },
      {
        x: new Polynom([RPN.ONE, RPN.ONE]),
        f: RPN.ONE.negate()
      }];
    var zz = undefined;
    var pZERO = new Polynom([RPN.ZERO]);//TODO: fix

    var i = -1;
    while (++i < specialCases.length) {
      zz = np.divideAndRemainder(specialCases[i].x);
      while (zz[1].equals(pZERO)) {
        np = zz[0];
        roots.push(specialCases[i].f);
        zz = np.divideAndRemainder(specialCases[i].x);
      }
    }

    if (np.a.length === 2) {
      roots.push(np.a[0].negate().divide(np.a[1]));
    }

    if (np.a.length <= 2) {
      return roots;
    }

    var an = np.a[np.a.length - 1];
    var a0 = np.a[0];

    //TODO: http://en.wikipedia.org/wiki/Polynomial_remainder_theorem
    //var fp1 = getBigInteger(np.calcAt(1));
    //var fm1 = getBigInteger(np.calcAt(-1));

    // p/q
    //TODO: forEach -> some ?
    Expression.everyDivisor(a0, function (p) {
      return Expression.everyDivisor(an, function (q) {
        var sign = -3;
        while ((sign += 2) < 3) {
          var sp = p.multiply(sign === -1 ? RPN.ONE.negate() : RPN.ONE);
          var f = sp.divide(q);

          if (// fp1.remainder(sp.subtract(q)).equals(ZERO) &&
              // fm1.remainder(sp.add(q)).equals(ZERO) &&
              // sp.gcd(q).equals(ONE) && //?
               np.calcAt(f).equals(RPN.ZERO)) {//?
            var x = new Polynom([sp.negate(), q]);
            var z = np.divideAndRemainder(x);
            while (z[1].equals(pZERO)) {
              roots.push(f);
              np = z[0];
              if (np.a.length === 2) {
                roots.push(np.a[0].negate().divide(np.a[1]));
                return false;// or divide
              }
              if (np.a.length <= 2) {
                return false;
              }
              //TODO: !!!
              //an = np.a[np.a.length - 1];//!
              //a0 = np.a[0];//!

              // fp1 = fp1.divide(q.subtract(sp));
              // fm1 = fm1.divide(q.negate().subtract(sp));
              z = np.divideAndRemainder(x);
            }
          }
        }
        return true;
      });
    });

    //! new: solution of quadratic equations
    if (np.a.length === 3) {
      var a = np.a[2];
      var b = np.a[1];
      var c = np.a[0];
      var D = b.multiply(b).subtract(RPN("4").multiply(a).multiply(c));
      if (D instanceof Expression.Integer && D.compareTo(RPN.ZERO) > 0) {
        var sD = D.squareRoot();
        var x1 = b.negate().subtract(sD).divide(RPN("2").multiply(a));
        var x2 = b.negate().add(sD).divide(RPN("2").multiply(a));
        roots.push(x1);
        roots.push(x2);
      }
    }

    return roots;
  };

  exports.Polynom = Polynom;
  exports.RPN = RPN;

}(this));

/*jslint plusplus: true, vars: true, indent: 2 */
/*global RPN */

(function (exports) {
  "use strict";

  /**
      API same as http://sylvester.jcoglan.com/api/matrix

      new Matrix([
          [1, 2, 3],
          [5, 6, 7],
          [7, 8,-1]
      ]);
  **/

  function Matrix(data) {
    this.a = data;
  }

  Matrix.Zero = function (rows, cols) {
    var a = new Array(rows);
    var i = -1;
    while (++i < rows) {
      var j = -1;
      var x = new Array(cols);
      while (++j < cols) {
        x[j] = RPN.ZERO;
      }
      a[i] = x;
    }
    return new Matrix(a);
  };

  Matrix.Random = function (rows, cols) {
    return Matrix.Zero(rows, cols).map(function () {
      var t = Math.random();
      t *= 10;
      var n = Math.trunc(t);
      t -= n;
      t *= 10;
      var d = Math.trunc(t) + 1;
      return RPN(n.toString() + (d !== 1 ? "/" + d.toString() : ""));
    });
  };

  // identity n x n;
  Matrix.I = function (n) {
    return Matrix.Zero(n, n).map(function (element, i, j) {
      return (i === j ? RPN.ONE : RPN.ZERO);
    });
  };

  Matrix.Diagonal = function (elements) {
    return Matrix.Zero(elements.length, elements.length).map(function (element, i, j) {
      return (i === j ? elements[i] : RPN.ZERO);
    });
  };

  Matrix.prototype.rows = function () {
    return this.a.length;
  };

  Matrix.prototype.cols = function () {
    var a = this.a;
    return a.length > 0 ? a[0].length : 0;
  };

  Matrix.prototype.e = function (i, j) {
    return this.a[i][j];
  };

  Matrix.prototype.isSquare = function () {
    return this.rows() > 0 && this.rows() === this.cols();//?
  };

  Matrix.prototype.map = function (callback, thisArg) {
    var rows = this.rows();
    var cols = this.cols();
    var c = new Array(rows);
    var i = -1;
    while (++i < rows) {
      var x = new Array(cols);
      var j = -1;
      while (++j < cols) {
        x[j] = callback.call(thisArg, this.e(i, j), i, j, this);
      }
      c[i] = x;
    }
    return new Matrix(c);
  };

  Matrix.prototype.transpose = function () {
    var that = this;
    return Matrix.Zero(that.cols(), that.rows()).map(function (element, i, j) {
      return that.e(j, i);
    });
  };

  Matrix.prototype.scale = function (k) {
    return this.map(function (element, i, j) {
      return element.multiply(k);
    });
  };

  Matrix.prototype.multiply = function (b) {
    var a = this;
    if (a.cols() !== b.rows()) {
      throw new RangeError("DimensionMismatchException");
    }
    return Matrix.Zero(a.rows(), b.cols()).map(function (element, i, j) {
      var rows = b.rows();
      var k = -1;
      while (++k < rows) {
        //! this code is used to show not simplified expressions
        var current = a.e(i, k).multiply(b.e(k, j));
        element = k === 0 ? current : element.add(current);
      }
      return element;
    });
  };

  Matrix.prototype.add = function (b) {
    var a = this;
    if (a.rows() !== b.rows() || a.cols() !== b.cols()) {
      throw new RangeError("MatrixDimensionMismatchException");
    }
    return a.map(function (elem, i, j) {
      return elem.add(b.e(i, j));
    });
  };

  Matrix.prototype.augment = function (b) {/* ( this | m )  m.rows() ==== this.rows() */
    if (this.rows() !== b.rows()) {
      throw new RangeError("NonSquareMatrixException");
    }
    var a = this;
    return Matrix.Zero(a.rows(), a.cols() + b.cols()).map(function (element, i, j) {
      return (j < a.cols() ? a.e(i, j) : b.e(i, j - a.cols()));
    });
  };

  Matrix.prototype.diagonal = function () {
    if (this.isSquare()) {
      var size = this.rows();
      var result = new Array(size);
      var i = -1;
      while (++i < size) {
        result[i] = this.e(i, i);
      }
      return result;
    }
    throw new RangeError("NonSquareMatrixException");
  };

  Matrix.prototype.rowReduce = function (targetRow, pivotRow, pivotColumn, currentOrPreviousPivot) {
    if (currentOrPreviousPivot == undefined) {
      currentOrPreviousPivot = this.e(pivotRow, pivotColumn);
    }
    var rows = this.rows();
    var cols = this.cols();
    var c = new Array(rows);
    var i = -1;
    while (++i < rows) {
      var x = this.a[i];
      if (targetRow === i) {
        x = new Array(cols);
        var j = -1;
        while (++j < cols) {
          x[j] = this.e(pivotRow, pivotColumn).multiply(this.e(targetRow, j)).subtract(this.e(targetRow, pivotColumn).multiply(this.e(pivotRow, j))).divide(currentOrPreviousPivot);
        }
        c[i] = x;
      }
      c[i] = x;
    }
    return new Matrix(c);
  };

  // reduceToCanonical - make zeros under diagonal and divide by pivot element, also swap row instead of addition
  Matrix.prototype.toRowEchelon = function (reduceToCanonical, stopOnFirstZeroColumn, callback) {
    // TODO: implement stopOnFirstZeroColumn + tests

    callback = callback === undefined ? undefined : callback;
    var m = this;
    var pivotRow = 0;
    var pivotColumn = -1;
    var oldMatrix = undefined;

    var targetRow = -1;
    var coefficient = undefined;

    var rows = m.rows();
    var cols = m.cols();
    while (++pivotColumn < cols) {
      // pivot searching
      targetRow = pivotRow;
      // not zero element in a column (starting from the main diagonal);
      while (targetRow < rows && m.e(targetRow, pivotColumn).equals(RPN.ZERO)) {
        targetRow += 1;
      }
      if (targetRow < rows) {
        if (targetRow !== pivotRow) {
          var isItADeterminantCalculation = !reduceToCanonical && stopOnFirstZeroColumn;
          oldMatrix = m;
          m = m.map(function (e, i, j) {
            if (i === pivotRow) {
              return m.e(targetRow, j);
            }
            if (i === targetRow) {
              return isItADeterminantCalculation ? m.e(pivotRow, j).negate() : m.e(pivotRow, j);
            }
            return e;
          });
          if (callback !== undefined) {
            callback({newMatrix: m, oldMatrix: oldMatrix, type: isItADeterminantCalculation ? "swap-negate" : "swap", targetRow: pivotRow, pivotRow: targetRow, pivotColumn: pivotColumn});
          }
        }
        // making zeros under the main diagonal
        if (reduceToCanonical && !m.e(pivotRow, pivotColumn).equals(RPN.ONE)) {
          oldMatrix = m;
          coefficient = RPN.ONE.divide(m.e(pivotRow, pivotColumn));
          m = m.map(function (e, i, j) {
            if (i !== pivotRow) {
              return e;
            }
            return e.multiply(coefficient);
          });
          if (callback !== undefined) {
            callback({newMatrix: m, oldMatrix: oldMatrix, type: "divide", targetRow: pivotRow, pivotRow: pivotRow, pivotColumn: pivotColumn});
          }
        }

        targetRow = pivotRow;
        while (++targetRow < rows) {
          if (!m.e(targetRow, pivotColumn).equals(RPN.ZERO)) {
            oldMatrix = m;
            m = m.rowReduce(targetRow, pivotRow, pivotColumn);
            if (callback !== undefined) {
              callback({newMatrix: m, oldMatrix: oldMatrix, type: "reduce", targetRow: targetRow, pivotRow: pivotRow, pivotColumn: pivotColumn});
            }
          }
        }
        pivotRow += 1;
      }
    }
    // back-substitution
    if (reduceToCanonical) {
      while (--pivotRow >= 0) {
        pivotColumn = 0;
        while (pivotColumn < rows && m.e(pivotRow, pivotColumn).equals(RPN.ZERO)) {
          pivotColumn += 1;
        }
        if (pivotColumn < rows) {
          targetRow = pivotRow;
          while (--targetRow >= 0) {
            if (!m.e(targetRow, pivotColumn).equals(RPN.ZERO)) {
              oldMatrix = m;
              m = m.rowReduce(targetRow, pivotRow, pivotColumn);
              if (callback !== undefined) {
                callback({newMatrix: m, oldMatrix: oldMatrix, type: "reduce", targetRow: targetRow, pivotRow: pivotRow, pivotColumn: pivotColumn});
              }
            }
          }
        }
      }
    }

    return m;
  };

  Matrix.prototype.determinant = function () { // m == n  // via row echelon form
    if (!this.isSquare() || this.rows() === 0) {//!
      throw new RangeError("NonSquareMatrixException");
    }
    var m = this.toRowEchelon(false, true, undefined).diagonal();
    var r = undefined;
    var i = m.length;
    while (--i >= 0) {
      r = r === undefined ? m[i] : r.multiply(m[i]);
    }
    return r;
  };

  Matrix.prototype.rank = function () {
    // rank === count of non-zero rows after bringing to row echelon form ...
    var m = this.toRowEchelon(false, false, undefined).transpose().toRowEchelon(false, false, undefined);
    var result = 0;
    var i = m.rows() < m.cols() ? m.rows() : m.cols();

    while (--i >= 0) {
      result += m.e(i, i).equals(RPN.ZERO) ? 0 : 1;
    }
    return result;
  };

  Matrix.prototype.inverse = function () { // m == n by augmention ...
    if (!this.isSquare()) {
      throw new RangeError("NonSquareMatrixException");
    }
    var m = this.augment(Matrix.I(this.rows()));
    m = m.toRowEchelon(true, true, undefined);

    return Matrix.Zero(m.rows(), m.rows()).map(function (element, i, j) { // splitting to get the second half
      var e = m.e(i, i);
      if (e.equals(RPN.ZERO)) {
        throw new RangeError("SingularMatrixException");
      }
      var x = m.e(i, j + m.rows());
      return e.equals(RPN.ONE) ? x : x.divide(e);
    });
  };

  Matrix.prototype.toString = function () {
    var result = "";
    var rows = this.rows();
    var cols = this.cols();
    var j = -1;
    result += "{";
    while (++j < rows) {
      if (j !== 0) {
        result += ",";
      }
      result += "{";
      var i = -1;
      while (++i < cols) {
        if (i !== 0) {
          result += ",";
        }
        result += this.e(j, i).toString();
      }
      result += "}";
    }
    result += "}";
    return result;
  };

  Matrix.prototype.negate = function () {
    return this.map(function (element, i, j) {
      return element.negate();
    });
  };

  Matrix.prototype.subtract = function (b) {
    return this.negate().add(b).negate();
  };

  //?
  Matrix.prototype.getElements = function () {
    return this.a;
  };

  Matrix.prototype.slice = function (rowsStart, rowsEnd, colsStart, colsEnd) {
    var data = this.a;
    var n = data.slice(rowsStart, rowsEnd);
    var i = n.length;
    while (--i >= 0) {
      n[i] = n[i].slice(colsStart, colsEnd);
    }
    return new Matrix(n);
  };

  /*
  // TODO: remove
  Matrix.prototype.stripZeroRows = function () {
    var rows = this.rows();
    var cols = this.cols();
    var i = rows;
    var j = cols;
    while (j === cols && --i >= 0) {
      j = 0;
      while (j < cols && this.e(i, j).equals(RPN.ZERO)) {
        j += 1;
      }
    }
    i += 1;
    var that = this;
    return i === rows ? this : Matrix.Zero(i, cols).map(function (e, i, j) {
      return that.e(i, j);
    });
  };
  */

  // TODO: remove?
  // Array -> string
  Matrix.toMultilineString = function (array) {
    var table = [];
    var columnWidths = [];
    var i = -1;
    while (++i < array.length) {
      var row0 = [];
      table[i] = row0;
      var elements = array[i];
      var j = -1;
      while (++j < elements.length) {
        row0[j] = elements[j].toString();
        var w = j < columnWidths.length ? columnWidths[j] : 0;
        columnWidths[j] = w < row0[j].length ? row0[j].length : w;
      }
    }
    var result = [];
    var k = -1;
    while (++k < table.length) {
      var row = table[k];
      var h = -1;
      while (++h < columnWidths.length) {
        var e = h < row.length ? row[h] : "";
        var padding = columnWidths[h] - e.length;
        row[h] = " ".repeat(padding < 0 ? 0 : padding) + e;
      }
      result.push(row.join("\t"));
    }
    return result.join("\n");
  };

  // string -> Array
  Matrix.split = function (s) {
    var result = [];
    var m = s;
    var i = 0;
    var j = 0;
    var maxLength = 0;
    m = m.replace(/^\s+|\s+$/g, "");
    if (m.indexOf("[") === 0 && m.slice(1).indexOf("[") === -1 && m.indexOf("]") === m.length - 1) {//!
      m = m.slice(1, -1);
    }//!
    m = m.replace(/;/g, "\n");//? ; -> \n
    if (m !== "") {
      result = m.replace(/\r\n/g, "\n").replace(/\n\n+/g, "\n").replace(/^\s+|\s+$/g, "").split("\n");
      j = result.length;
      while (--j >= 0) {
        result[j] = result[j].replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "").split(" ");
      }
    }
    i = result.length;
    while (--i >= 0) {
      if (result[i].length > maxLength) {
        maxLength = result[i].length;
      }
    }
    i = result.length;
    while (--i >= 0) {
      while (result[i].length < maxLength) {
        result[i].push("0");
      }
    }
    return result;
  };

  Matrix.padRows = function (array, convert) {
    var rows = array.length;
    var cols = 0;
    for (var k = 0; k < rows; k += 1) {
      cols = Math.max(cols, array[k].length);
    }
    var data = new Array(rows);
    for (var i = 0; i < rows; i += 1) {
      var y = array[i];
      var x = new Array(cols);
      for (var j = 0; j < cols; j += 1) {
        x[j] = j < y.length ? (convert ? RPN(y[j]) : y[j]) : RPN.ZERO;
      }
      data[i] = x;
    }
    return new Matrix(data);
  };

  Matrix.toMatrix = function (array) {
    return Matrix.padRows(array, true);
  };

  exports.Matrix = Matrix;

}(this));

/*jslint plusplus: true, vars: true, indent: 2 */
/*global document, Map, MutationObserver, Node */

(function (global) {
  "use strict";

  var Utils = function () {
  };

  Utils.on = function (container, eventType, selector, listener) {
    Utils.initialize(container, selector, function (element) {
      element.addEventListener(eventType, listener, false);
    });
  };

  Utils.escapeHTML = function (s) {
    return s.replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
  };

  Utils.initializers = new Map();

  var checkElement = function (element) {
    var initialized = element.getAttribute("data-i");
    if (initialized == undefined) {
      var classList = element.classList;
      var classListLength = classList.length;
      if (classListLength !== 0) {
        element.setAttribute("data-i", "1");
      }
      var t = false;
      var k = -1;
      while (++k < classListLength) {
        var className = classList.item(k);
        var callback = Utils.initializers.get(className);
        if (callback != undefined) {
          if (t) {
            throw new Error(classList.toString());
          }
          t = true;
          callback(element);
        }
      }
    }
  };

  var checkCustomPaint = function (element) {
    if (element.getAttribute("data-custom-paint") != undefined) {
      if (element.getAttribute("data-p") == undefined && element.getBoundingClientRect().top !== 0) {
        element.setAttribute("data-p", "1");
        var event = document.createEvent("Event");
        event.initEvent("custom-paint", true, false);
        element.dispatchEvent(event);
      }
    }
  };

  var checkSubtree = function (element) {
    checkElement(element);
    checkCustomPaint(element);
    var firstElementChild = element.firstElementChild;
    while (firstElementChild != undefined) {
      checkSubtree(firstElementChild);
      firstElementChild = firstElementChild.nextElementSibling;
    }
  };

  var started = false;

  Utils.initialize = function (container, selector, callback) {
    if (started || Utils.initializers.has(selector.slice(1))) {
      throw new Error(selector.slice(1));
    }
    Utils.initializers.set(selector.slice(1), callback);
  };

  var observer = new MutationObserver(function (records) {
    for (var i = 0; i < records.length; i += 1) {
      var record = records[i];
      if (record.type === "attributes") {
        checkSubtree(record.target);
      } else {
        var addedNodes = record.addedNodes;
        for (var j = 0; j < addedNodes.length; j += 1) {
          var node = addedNodes[j];
          if (node.nodeType === Node.ELEMENT_NODE) {
            checkSubtree(node);
          }
        }
      }
    }
  });

  Utils.observe = function () {
    if (!started) {
      started = true;
      observer.observe(document.documentElement, {
        //attributeFilter: ["hidden", "open"],
        //attributes: true,
        childList: true,
        subtree: true
      });
      // some initializers can modify DOM, so it is important to call `checkSubtree` after `observer.observe`
      checkSubtree(document.documentElement);
    }
  };

  document.addEventListener("DOMContentLoaded", function (event) {
    Utils.observe();
  }, false);

  // workaround for browsers, which do not support MutationObserver
  // TODO: remove
  Utils.check = function (element) {
    //checkSubtree(element);
  };

  Utils.check1 = function (element) {
    checkSubtree(element);
  };

  global.Utils = Utils;

}(this));

/*global document, window */

(function (global) {
  "use strict";

  function Dialog() {
  }

  Dialog.lastFocused = undefined; //?

  var ANIMATION_DURATION = 120;
  
  var counter = 0;

  Dialog.create = function () {
    var dialog = document.createElement("dialog");
    dialog.initDialog();
    dialog.nativeShowModal = dialog.showModal;
    dialog.nativeShow = dialog.show;
    dialog.show = Dialog.prototype.show;
    dialog.showModal = Dialog.prototype.showModal;
    dialog.addEventListener("close", function (event) {
      var activeElement = document.activeElement;
      while (activeElement != undefined && activeElement !== dialog) {
        activeElement = activeElement.parentNode;
      }
      if (activeElement != undefined && Dialog.lastFocused != undefined) {
        Dialog.lastFocused.focus();
        Dialog.lastFocused = undefined;
      }

      dialog.style.display = "block";
      dialog.style.opacity = "0";
      dialog.style.transform = "scale(0.75)";
      var a = dialog.animate([
        {transform: "scale(1.3333333333333333)", opacity: "1"},
        {transform: "scale(1)", opacity: "0"}
      ], {
        duration: ANIMATION_DURATION,
        composite: "add"
      });
      a.onfinish = function () {
        dialog.style.display = "";
      };
      var backdrop = document.getElementById(this.getAttribute("data-backdrop-id"));
      if (backdrop != undefined) {
        backdrop.style.display = "block";
        backdrop.style.opacity = "0";
        var a2 = backdrop.animate([
          {opacity: "1"},
          {opacity: "0"}
        ], {
          duration: ANIMATION_DURATION,
          composite: "add"
        });
        a2.onfinish = function () {
          if (backdrop.parentNode != undefined) {
            document.body.removeChild(backdrop);
          }
        };
      }
    }, false);
    var backdropId = "backdrop" + (++counter).toString();
    dialog.setAttribute("data-backdrop-id", backdropId);
    return dialog;
  };

  var show = function (anchorRect, anchorPoints, isModal) {
    if (Dialog.lastFocused == undefined) {
      Dialog.lastFocused = document.activeElement;
    }
    var backdrop = undefined;
    if (isModal) {
      backdrop = document.createElement("div");
      backdrop.id = this.getAttribute("data-backdrop-id");
      backdrop.classList.add("backdrop");
      document.body.appendChild(backdrop);
    }

    this.style.visibility = "hidden";
    this.style.display = "block";
    this.style.transform = "scale(1)";
    this.style.left = "0px";
    this.style.top = "0px";

    var rect = this.getBoundingClientRect();
    var style = window.getComputedStyle(this, undefined);
    var marginRect = {
      left: rect.left - Number.parseFloat(style.marginLeft),
      right: rect.right + Number.parseFloat(style.marginRight),
      top: rect.top - Number.parseFloat(style.marginTop),
      bottom: rect.bottom + Number.parseFloat(style.marginBottom)
    };
    var width = marginRect.right - marginRect.left;
    var height = marginRect.bottom - marginRect.top;

    var left = 0;
    var top = 0;
    if (anchorRect != undefined || anchorPoints != undefined) {
      if (anchorPoints != undefined) {
        left = anchorPoints[0][0] - width * anchorPoints[1][0];
        top = anchorPoints[0][1] - height * anchorPoints[1][1];
      } else {
        left = anchorRect.right;
        top = anchorRect.bottom;
        if (left > document.documentElement.clientWidth - width) {
          left = anchorRect.left - width;
        }
        if (top > document.documentElement.clientHeight - height) {
          top = anchorRect.top - height;
        }
      }
      left = Math.max(0, Math.min(left, document.documentElement.clientWidth - width));
      top = Math.max(0, Math.min(top, document.documentElement.clientHeight - height));
      left += window.pageXOffset;
      top += window.pageYOffset;
      this.style.left = left.toString() + "px";
      this.style.top = top.toString() + "px";
    } else {
      left = window.pageXOffset + (window.innerWidth - width) / 2;
      top = window.pageYOffset + (window.innerHeight - height) / 2;
      this.style.left = Math.max(0, left).toString() + "px";
      this.style.top = Math.max(0, top).toString() + "px";
    }

    this.style.display = "";
    this.style.visibility = "visible";

    if (isModal) {
      this.nativeShowModal();
    } else {
      this.nativeShow();
    }
    //TODO: remove
    //var autofocus = this.querySelector("*[autofocus]");
    //if (autofocus != undefined) {
    //  autofocus.focus();
    //}

    this.style.opacity = "1";
    this.style.transform = "scale(1)";
    this.animate([
      {transform: "scale(0.75)", opacity: "-1"},
      {transform: "scale(1)", opacity: "0"}
    ], {
      duration: ANIMATION_DURATION,
      composite: "add"
    });
    if (isModal) {
      backdrop.style.opacity = "1";
      backdrop.animate([
        {opacity: "-1"},
        {opacity: "0"}
      ], {
        duration: ANIMATION_DURATION,
        composite: "add"
      });
    }
  };

  Dialog.prototype.show = function (anchorRect, anchorPoints) {
    return show.call(this, anchorRect, anchorPoints, false);
  };

  Dialog.prototype.showModal = function (anchorRect, anchorPoints) {
    return show.call(this, anchorRect, anchorPoints, true);
  };

  // "Cancel", "OK", "Close"
  Dialog.standard = function (anchorRect, anchorPoints, contentHTML, buttonsHTML) {
    var dialog = Dialog.create();
    dialog.classList.add("standard-dialog");
    dialog.innerHTML = "<form method=\"dialog\">" +
                       "<button type=\"submit\" class=\"close\" tabindex=\"0\">&times;</button>" +
                       "<div class=\"content\">" + contentHTML + "</div>" +
                       "<div class=\"buttons\">" + buttonsHTML + "</div>" +
                       "</form>";
    document.body.appendChild(dialog);
    dialog.addEventListener("close", function (event) {
      window.setTimeout(function () {
        document.body.removeChild(dialog);
      }, 2000);
    }, false);
    dialog.showModal(anchorRect, anchorPoints);
    return dialog;
  };

  Dialog.alert = function (contentHTML) {
    return Dialog.standard(undefined, undefined, contentHTML, "<button autofocus=\"autofocus\" type=\"submit\">OK</button>");
  };

  global.Dialog = Dialog;
  
}(this));

/*global document, Dialog, Utils */

(function (global) {
  "use strict";

  var highlight = function (element) {
    var oldHighlights = document.querySelectorAll(".highlight");
    for (var i = 0; i < oldHighlights.length; i += 1) {
      oldHighlights[i].classList.remove("highlight");
    }
    if (element != undefined) {
      var highlight = element.getAttribute("data-highlight"); 
      if (highlight != undefined) {
        var newHighlights = document.querySelectorAll(highlight);
        for (var j = 0; j < newHighlights.length; j += 1) {
          newHighlights[j].classList.add("highlight");
        }
      }
    }
  };

  var tooltip = Dialog.create();
  tooltip.setAttribute("role", "tooltip");
  tooltip.classList.add("tooltip-dialog");
  tooltip.classList.add("math");//!

  var showTooltip = function (element) {
    if (tooltip.getAttribute("open") != undefined) {
      tooltip.close();
    }
    if (element != undefined) {
      var tooltipSelector = element.getAttribute("data-tooltip");
      if (tooltipSelector != undefined) {
        if (tooltip.parentNode == undefined) {
          document.body.appendChild(tooltip);
        }
        tooltip.innerHTML = document.getElementById(tooltipSelector).innerHTML;
        var rect = document.getElementById(element.getAttribute("data-for")).getBoundingClientRect();
        tooltip.show(undefined, [[(rect.left + rect.right) / 2, rect.top], [0.5, 1.0]]);
        tooltip.style.marginTop = "0.25em;";
      }
    }
  };

  var f = function (highlight, selector) {

    var hoveredElements = [];
    var focusedElements = [];

    Utils.initialize(document, selector, function (element) {
      var x = document.getElementById(element.getAttribute("data-for"));
      x.addEventListener("mouseenter", function (event) {
        hoveredElements.push(element);
        highlight(hoveredElements.length !== 0 ? hoveredElements[hoveredElements.length - 1] : undefined);
      }, false);
      x.addEventListener("mouseleave", function (event) {
        hoveredElements.pop();
        highlight(hoveredElements.length !== 0 ? hoveredElements[hoveredElements.length - 1] : undefined);
      }, false);
      x.addEventListener("focusin", function (event) {
        focusedElements.push(element);
        highlight(focusedElements.length !== 0 ? focusedElements[focusedElements.length - 1] : undefined);
      }, false);
      x.addEventListener("focusout", function (event) {
        focusedElements.pop();
        highlight(focusedElements.length !== 0 ? focusedElements[focusedElements.length - 1] : undefined);
      }, false);
    });

  };

  f(highlight, ".a-highlight");
  f(showTooltip, ".a-tooltip");

}(this));

/*global window, document*/

var reportValidity = function (input, validationMessage) {
  "use strict";
  var tooltip = Dialog.create();
  tooltip.setAttribute("role", "tooltip");
  tooltip.classList.add("tooltip");
  tooltip.classList.add("tooltip-dialog");//?
  tooltip.innerHTML = "<div class=\"exclamation\">!</div> " + validationMessage + "<div class=\"tooltip-arrow-wrapper\"><div class=\"tooltip-arrow\"></div></div>";

  input.focus();

  var inputRect = input.getBoundingClientRect();

  tooltip.style.visibitliy = "hidden";
  tooltip.style.display = "block";
  document.body.appendChild(tooltip);
  var rect = tooltip.getBoundingClientRect();
  var style = window.getComputedStyle(tooltip, undefined);
  var marginRect = {
    left: rect.left - Number.parseFloat(style.marginLeft),
    right: rect.right + Number.parseFloat(style.marginRight),
    top: rect.top - Number.parseFloat(style.marginTop),
    bottom: rect.bottom + Number.parseFloat(style.marginBottom)
  };

  var arrowRect = tooltip.querySelector(".tooltip-arrow").getBoundingClientRect();
  var width = marginRect.right - marginRect.left;
  tooltip.style.visibitliy = "";
  tooltip.style.display = "";

  tooltip.show();
  var left = (inputRect.left + inputRect.right) / 2 - ((arrowRect.left + arrowRect.right) / 2 - marginRect.left);
  tooltip.style.left = (window.pageXOffset + Math.max(0, Math.min(document.documentElement.clientWidth - width, left))).toString() + "px";
  tooltip.style.top = (window.pageYOffset + inputRect.bottom + (arrowRect.bottom - arrowRect.top) * 0.15).toString() + "px";

  
  var timeoutId = 0;

  var close = function (event) {
    window.clearTimeout(timeoutId);
    input.removeEventListener("input", close, false);
    input.removeEventListener("blur", close, false);
    tooltip.close();
    window.setTimeout(function () {
      tooltip.parentNode.removeChild(tooltip);
    }, 3000);
  };

  timeoutId = window.setTimeout(function () {
    close(undefined);
  }, 4000);
  input.addEventListener("input", close, false);
  input.addEventListener("blur", close, false);
};

/*global document, JSON*/

(function (global) {
  "use strict";

  function CustomMenclose() {
  }
  CustomMenclose.drawLine = function (context, p1, p2) {
    context.lineWidth = 1.25;
    context.beginPath();
    context.moveTo(p1.x, p1.y);
    context.lineTo(p2.x, p2.y);
    context.stroke();
  };
  CustomMenclose.getPointByCell = function (paddingRect, element, indexes) {
    var e = element.querySelector("mtable > mtr:nth-child(" + (indexes[0] + 1).toString() + ") > mtd:nth-child(" + (indexes[1] + 1).toString() + ")");
    var r = e.getBoundingClientRect();
    return {
      x: (r.left + r.right) / 2 - paddingRect.left,
      y: (r.top + r.bottom) / 2 - paddingRect.top
    };
  };
  CustomMenclose.paint = function (event) {
    var paddingRect = this.getBoundingClientRect();
    var canvas = document.createElement("canvas");
    canvas.width = paddingRect.width;
    canvas.height = paddingRect.height;
    var context = canvas.getContext("2d");
    var cells = JSON.parse(this.getAttribute("data-cells"));
    var range = document.createRange();
    range.selectNode(this);
    context.strokeStyle = this.getAttribute("data-color") === "0" || this.getAttribute("data-color") === "0a" ? "rgba(200,0,0," + (this.getAttribute("data-color") === "0a" ? "0.75" : "0.15") + ")" : "rgba(0,0,200," + (this.getAttribute("data-color") === "1a" ? "0.75" : "0.15") + ")";
    for (var i = 0; i < cells.length; i += 1) {
      CustomMenclose.drawLine(context, CustomMenclose.getPointByCell(paddingRect, this, cells[i]), CustomMenclose.getPointByCell(paddingRect, this, i === cells.length - 1 ? cells[0] : cells[i + 1]));
    }
    this.style.background = "no-repeat center center url(" + canvas.toDataURL() + ")";
  };
  document.addEventListener("custom-paint", function (event) {
    if (event.target.getAttribute("data-custom-paint") === "custom-menclose") {
      CustomMenclose.paint.call(event.target, event);
    }
  }, false);

}(this));

/*jslint plusplus: true, vars: true, indent: 2, white: true */
/*global Node, Image, window, document, Dialog, Map, JSON, NonSimplifiedExpression, Ya, Matrix, Polynom, Utils, Expression, RPN */

(function (global) {
"use strict";

// TODO: implement prompt, replace button+input with button+prompt, remove native prompt, confirm

// TODO: remove <sub>, <sup>, <br />, <pre>

// TODO: highlight inputs with wrong input even if "input" event does not working ?

window.setTimeout(function () {
  var custom = "";
  // LiveInternet counter
  if (window.location.protocol !== "file:") {
    (new Image()).src = "https://counter.yadro.ru/hit?r" + encodeURIComponent(document.referrer) + (window.screen == undefined ? "" : ";s" + window.screen.width + "*" + window.screen.height + "*" + (window.screen.colorDepth ? window.screen.colorDepth : window.screen.pixelDepth)) + ";u" + encodeURIComponent(document.URL) + ";h" + encodeURIComponent(custom) + ";" + Math.random();
  }
}, 256);

  var tmp0 = function (event) {
    var DOM_VK_RETURN = 13;
    if (event.keyCode === DOM_VK_RETURN && !event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && !event.defaultPrevented) {
      if (event.target.tagName === "INPUT") {
        this.querySelector("button").click();
      }
    }
  };

  Utils.on(document, "keydown", ".button-after-input", tmp0);
  Utils.on(document, "keydown", ".button-before-input", tmp0);


//!TODO: remove
Polynom.prototype._toExpression = function () {
  var variableSymbols = [];
  var i = -1;
  while (++i < this.a.length) {
    variableSymbols.push(i === 0 ? undefined : (i === 1 ? RPN("x") : RPN("x^" + i)));
  }
  return polynomToExpression(this.a, variableSymbols);
};
Polynom.prototype.toString = function () {
  return this._toExpression().toString();
};
Polynom.prototype.toMathML = function (options) {
  return this._toExpression().toMathML(options);
};

var precedenceOfMultiptication = RPN("a*b").getPrecedence();//TODO: fix performance

var printPartOfAddition = function (isLast, isFirst, coefficient/*:Expression*/, variable/*:Expression*/, options) {
  if (coefficient.equals(RPN.ZERO)) {
    return "<mtd>" + (isLast && isFirst ? "<mn>0</mn>" : "") + "</mtd>";
  }
  var sign1 = "+";
  if (Expression.isNegative(coefficient)) {
    sign1 = "&minus;";
    coefficient = coefficient.negate();//?
  }
  var coefficientString = coefficient.toMathML(options);
  var areBracketsRequired = coefficient.getPrecedence() < precedenceOfMultiptication; //?
  //TODO: fix
  return "<mtd>" +
         (isFirst && sign1 === "+" ? "" : "<mo>" + sign1 + "</mo>") +
         (coefficient.equals(RPN.ONE) ? "" : (areBracketsRequired && coefficientString !== "" ? "<mfenced open=\"(\" close=\")\">" + coefficientString + "</mfenced>" : coefficientString) + (coefficientString !== "" ? "<mo>&times;</mo>" : "")) +
         variable.toMathML(options) +
         "</mtd>";
};

var polynomToExpression = function (coefficients, variableSymbols) {
  var i = coefficients.length;
  var result = undefined;
  while (--i >= 0) {
    var tmp = coefficients[i];
    if (!tmp.equals(RPN.ZERO)) {
      var v = variableSymbols[i];
      var current = v === undefined ? tmp : (tmp.equals(RPN.ONE) ? v : new Expression.Multiplication(tmp, v));
      result = result === undefined ? current : new Expression.Addition(result, current);
    }
  }
  return result === undefined ? RPN.ZERO : result;
};

var createLinearEquationExpression = function (coefficients, variableNames, leftPartCount) {
  return polynomToExpression(coefficients.slice(0, leftPartCount), variableNames.slice(0, leftPartCount)).toMathML({}) + "<mo>=</mo>" +
         polynomToExpression(coefficients.slice(leftPartCount), variableNames.slice(leftPartCount)).toMathML({});
};

// TODO: fix
// new Intl.NumberFormat().format(1.1)
var decimalSeparator = ".";

var toDecimalNumber = function (numerator, denominator, fractionDigits, toMathML) {
  // assert(number instanceof Expression.Integer && denominator instanceof Expression.Integer);
  var isNumeratorNegative = numerator.compareTo(RPN.ZERO) < 0;
  var tmp = (isNumeratorNegative ? numerator.negate() : numerator).multiply(Expression.pow(RPN.TEN, fractionDigits + 1, RPN.ONE)).truncatingDivide(denominator).add(RPN("5")).toString();
  tmp = (tmp.slice(0, -(fractionDigits + 1)) || "0") + (fractionDigits ? decimalSeparator + ("0".repeat(fractionDigits) + tmp).slice(-(fractionDigits + 1), -1) : "");
  if (toMathML) {
    return (isNumeratorNegative ? "<mrow><mo>&minus;</mo>" : "") + "<mn>" + tmp + "</mn>" + (isNumeratorNegative ? "</mrow>" : "");
  }
  return (isNumeratorNegative ? "-" : "") + tmp;
};

Expression.Matrix.toMathML = function (x, options) {

  var useMatrixContainer = options.useMatrixContainer === undefined ? true : options.useMatrixContainer;
  //TODO: fix!
  var braces = options.useBraces === undefined ? ["(", ")"] : options.useBraces;
  var columnlines = options.columnlines === undefined ? 0 : options.columnlines;
  var variableNames = options.variableNames === undefined ? undefined : options.variableNames;

  var verticalStrike = options.verticalStrike === undefined ? -1 : options.verticalStrike;
  var horizontalStrike = options.horizontalStrike === undefined ? -1 : options.horizontalStrike;

  var cellTransform = options.cellTransform === undefined ? function (i, j, s) { return s; } : options.cellTransform;

  options = Object.assign({}, options);
  options.useBraces = undefined;
  options.columnlines = undefined;
  options.variableNames = undefined;
  options.verticalStrike = undefined;
  options.horizontalStrike = undefined;
  options.cellTransform = undefined;

  var result = "";
  var rows = x.rows();
  var cols = x.cols();
  var i = -1;

  var containerId = Utils.id();
  if (useMatrixContainer) {
    result += "<div class=\"matrix-container\" id=\"" + containerId + "\" data-matrix=\"" + Utils.escapeHTML(x.toString()) + "\" draggable=\"true\" tabindex=\"0\" contextmenu=\"matrix-menu\">";
  }

  result += "<mfenced open=\"" + braces[0] + "\" close=\"" + braces[1] + "\">";
  var columnlinesAttribute = "";
  if (columnlines !== 0 && cols > 2) {
    var k = -1;
    while (++k < cols - 1) {
      columnlinesAttribute += (cols - 1 + columnlines === k ? "solid " : "none ");
    }
    columnlinesAttribute = columnlinesAttribute.slice(0, -1);
  }
  var className = "";
  if (verticalStrike !== -1 || horizontalStrike !== -1) {
    className += " has-menclose";
  }
  result += "<mtable " + (className !== "" ? "class=\"" + className + "\"" : "") + (variableNames !== undefined ? " columnalign=\"right\"" : "") + (columnlinesAttribute !== "" ? " columnlines=\"" + columnlinesAttribute + "\"" : "") + ">";
  while (++i < rows) {
    var j = -1;
    result += "<mtr>";
    if (variableNames !== undefined) {// TODO: fix?
      //TODO: use code from polynomToExpression (shared)
      var row = "";
      var wasNotZero = false;
      while (++j < cols - 1) {
        // TODO: fix `new Expression.Symbol()`
        row += printPartOfAddition(j === cols - 2, !wasNotZero, x.e(i, j), new Expression.Symbol(variableNames.get(j)), options);
        wasNotZero = wasNotZero || !x.e(i, j).equals(RPN.ZERO);
      }
      row += "<mtd><mo>=</mo></mtd><mtd>" + x.e(i, cols - 1).toMathML(options) + "</mtd>";
      if (wasNotZero || !x.e(i, cols - 1).equals(RPN.ZERO)) {
        result += row;
      }
    } else {
      while (++j < cols) {
        result += cellTransform(i, j, "<mtd>");
        if (verticalStrike !== -1 || horizontalStrike !== -1) {
          result += "<menclose notation=\"none " + (verticalStrike === j ? " " + "verticalstrike" : "") +  (horizontalStrike === i ? " " + "horizontalstrike" : "") + "\">";
        }
        result += x.e(i, j).toMathML(options);
        if (verticalStrike !== -1 || horizontalStrike !== -1) {
          result += "</menclose>";
        }
        result += "</mtd>";
      }
    }
    result += "</mtr>";
  }
  result += "</mtable>";
  result += "</mfenced>";

  if (useMatrixContainer) {
    result += "<button type=\"button\" class=\"matrix-menu-show\" data-for-matrix=\"" + containerId + "\">&nbsp;</button>";
    result += "</div>";
  }

  return result;
};

Expression.Matrix.prototype.toMathML = function (options) {
  var x = this;
  return Expression.Matrix.toMathML(x.matrix, options);
};
Expression.Determinant.prototype.toMathML = function (options) {
  var x = this;
  if (x.a instanceof Expression.Matrix || (x.a instanceof NonSimplifiedExpression && x.a.e instanceof Expression.Matrix)) {
    options = Object.assign({}, options);
    options.useBraces = ["|", "|"];
    //TODO: fix
    return x.a.toMathML(options);
  }
  return "<mfenced open=\"" + "|" + "\" close=\"" + "|" + "\">" + x.a.toMathML(options) + "</mfenced>";
};
Expression.Transpose.prototype.toMathML = function (options) {
  var x = this;
  //TODO: ^T ?
  return "<msup><mrow>" + x.a.toMathML(options) + "</mrow><mrow><mo>T</mo></mrow></msup>";
};
Expression.SquareRoot.prototype.toMathML = function (options) {
  var x = this;
  //TODO: fix
  return "<msqrt><mrow>" + x.a.toMathML(options) + "</mrow></msqrt>";
};
Expression.Function.prototype.toMathML = function (options) {
  var x = this;
  //TODO: fix
  return "<mrow><mi>" + (x.name === "rank" ? i18n.rankDenotation : x.name) + "</mi> " + x.a.toMathML(options) + "</mrow>";
};
Expression.Division.prototype.toMathML = function (options) {
  var x = this;
  var fractionDigits = options.fractionDigits;
  var denominator = x.getDenominator();
  var numerator = x.getNumerator();
  if ((numerator instanceof Expression.Integer && denominator instanceof Expression.Integer) && fractionDigits >= 0) {
    return toDecimalNumber(numerator, denominator, fractionDigits, true);
  }
  //???
  //if (Expression.isNegative(numerator)) {
  //  return "<mrow><mo>&minus;</mo>" + x.negate().toMathML(options) + "</mrow>";
  //}
  return "<mfrac><mrow>" + numerator.toMathML(options) + "</mrow><mrow>" + denominator.toMathML(options) + "</mrow></mfrac>";
};
Expression.Integer.prototype.toMathML = function (options) {
  var x = this;
  var fractionDigits = options.fractionDigits;
  if (fractionDigits >= 0) {
    return toDecimalNumber(x, RPN.ONE, fractionDigits, true);
  }
  var tmp = x.toString();
  return "<mrow>" + (tmp.slice(0, 1) === "-" ? "<mo>&minus;</mo><mn>" + tmp.slice(1) + "</mn>" : "<mn>" + tmp + "</mn>") + "</mrow>";
};
Expression.BinaryOperation.prototype.toMathML = function (options) {
  var a = this.a;
  var b = this.b;
  var isSubtraction = false;
  // TODO: check
  if (this instanceof Expression.Addition && Expression.isNegative(b)) {
    isSubtraction = true;
    b = b.negateCarefully();//?
  }

  var fa = a.getPrecedence() < this.getPrecedence();
  var fb = b.getPrecedence() <= this.getPrecedence() + (Expression.isRightToLeftAssociative(this) ? 1 : 0);
  var s = isSubtraction ? "-" : this.getS();

  //! square roots
  /*if (this instanceof Expression.Exponentiation && b.toString() === "5/10") {
      return "<msup>" + 
             "<mrow>" +
             (fa ? "<mfenced open=\"(\" close=\")\">" : "") + a.toMathML(options) + (fa ? "</mfenced>" : "") +
             "</mrow>" +
             "<mrow>" +
             (fb ? "<mfenced open=\"(\" close=\")\">" : "") + "0.5" + (fb ? "</mfenced>" : "") + 
             "</mrow>" +
             "</msup>";
  }*/
  //!

  if (this instanceof Expression.Exponentiation) {
      return "<msup>" + 
             "<mrow>" +
             (fa ? "<mfenced open=\"(\" close=\")\">" : "") + a.toMathML(options) + (fa ? "</mfenced>" : "") +
             "</mrow>" +
             "<mrow>" +
             (fb ? "<mfenced open=\"(\" close=\")\">" : "") + b.toMathML(options) + (fb ? "</mfenced>" : "") + 
             "</mrow>" +
             "</msup>";
  }
  //TODO: add "equals" for all Expression subclasses (!?)
  if (this.isNegation()) {
    // assert(fa === false);
      return "<mrow><mo>&minus;</mo>" + (fb ? "<mfenced open=\"(\" close=\")\">" : "") + b.toMathML(options) + (fb ? "</mfenced>" : "") + "</mrow>";
  }
  //TODO: fix spaces (matrix parsing)
  return "<mrow>" + 
         (fa ? "<mfenced open=\"(\" close=\")\">" : "") + a.toMathML(options) + (fa ? "</mfenced>" : "") +
         "<mo>" + (s === "*" ? "&times;" : (s === "-" ? "&minus;" : s)) + "</mo>" + 
         (fb ? "<mfenced open=\"(\" close=\")\">" : "") + b.toMathML(options) + (fb ? "</mfenced>" : "") + 
         "</mrow>";
};
Expression.Symbol.prototype.toMathML = function (options) {
  var x = this;
  var s = x.symbol;
  var i = s.indexOf("_");
  if (i !== -1) {
    var indexes = s.slice(i + 1).replace(/^\(|\)$/g, "").split(",");
    var indexesMathML = "";
    for (var j = 0; j < indexes.length; j += 1) {
      indexesMathML += (j !== 0 ? "<mo>,</mo>" : "") +
                       (/^\d+$/.test(indexes[j]) ? "<mn>" : "<mi>") +
                       indexes[j] +
                       (/^\d+$/.test(indexes[j]) ? "</mn>" : "</mi>");
    }
    return "<msub>" + 
           "<mrow>" + "<mi>" + s.slice(0, i) + "</mi>" + "</mrow>" +
           "<mrow>" + indexesMathML + "</mrow>" + 
           "</msub>";
  }
  return "<mi>" + s + "</mi>";
};
Expression.Negation.prototype.toMathML = function (options) {
  var b = this.b;
  var fb = b.getPrecedence() <= this.getPrecedence() + (Expression.isRightToLeftAssociative(this) ? 1 : 0);
  // assert(fa === false);
  return "<mrow><mo>&minus;</mo>" + (fb ? "<mfenced open=\"(\" close=\")\">" : "") + b.toMathML(options) + (fb ? "</mfenced>" : "") + "</mrow>";
};

//Expression.prototype.toMathML = function (options) {
//};


// fractionDigits: 0-20, -1 - fraction
function printSomething(x, options) {
  options = options === undefined ? {} : options;
  options.fractionDigits = options.fractionDigits === undefined ? decFract : options.fractionDigits;
  // useBraces
  // columnlines
  // variableNames
  // fractionDigits
  // useMatrixContainer

  if (x instanceof Matrix) {
    return Expression.Matrix.toMathML(x, options);
  }

  return x.toMathML(options);
}

//!
var decFract = -1;

/* .matrix-menu-dialog */

function formatXml(xml) {
  var formatted = "";
  xml = xml.replace(/></g, ">\r\n<");
  var pad = 0;
  var nodes = xml.split("\r\n");
  var index = -1;
  while (++index < nodes.length) {
    var node = nodes[index];
    var indent = 0;
    var match = (/.+<\/\w[^>]*>$/).exec(node);
    if (match != undefined) {
      indent = 0;
    } else {
      match = (/^<\/\w/).exec(node);
      if (match != undefined) {
        if (pad !== 0) {
          pad -= 1;
        }
      } else {
        match = (/^<\w[^>]*[^\/]>.*$/).exec(node);
        if (match != undefined) {
          indent = 1;
        } else {
          indent = 0;
        }
      }
    }

    var padding = "";
    var i = -1;
    while (++i < pad) {
      padding += "  ";
    }

    formatted += padding + node + "\r\n";
    pad += indent;
  }

  return formatted;
}

var getMatrixPresentationsFromMatrix = function (matrix) {
  var mathmlStart = "<math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\">";
  var mathmlEnd = "</math>";
  var result = {};
  result["application/mathml-presentation+xml"] = formatXml(mathmlStart + printSomething(matrix, {useMatrixContainer: false}) + mathmlEnd);
  result["text/plain"] = "\n" + Matrix.toMultilineString(matrix.getElements()) + "\n";
  result["text/ascii-math"] = matrix.toString();
  return result;
};

Utils.on(document, "click", ".show-text", handleError(function (event) {
  hit("show-text");
  var matrixMenu = this.parentNode;
  var tmp = getMatrixPresentationsFromMatrix(getMatrix4(matrixMenu.getAttribute("data-matrix")));
  var value = tmp[this.getAttribute("data-type")];
  var anchorPoint = {
    left: Number.parseFloat(matrixMenu.getAttribute("data-left")),
    top: Number.parseFloat(matrixMenu.getAttribute("data-top"))
  };
  var dialog = Dialog.standard(undefined, [[anchorPoint.left, anchorPoint.top], [0.5, 0.5]], "<input type=\"text\" value=\"" + Utils.escapeHTML(value) + "\" />", "<button autofocus=\"autofocus\" type=\"submit\">" + i18n.close + "</button>");
  dialog.querySelector("input").select();
  dialog.querySelector("input").focus();
}));

Utils.on(document, "click", ".show-image", function (event) {
  hit("show-image");
  var matrixMenu = this.parentNode;
  var tmp = matrixMenu.getAttribute("data-matrix");
  var matrix = getMatrix4(tmp);
  //TODO: FIX???
  var element = document.createElement("div");
  element.innerHTML = Expression.Matrix.toMathML(matrix, {});
  element.style.visibilty = "hidden";
  element.style.position = "absolute";
  element.style.left = "0px";
  element.style.top = "0px";
  document.body.appendChild(element);
  var image = drawElement(element);
  document.body.removeChild(element);
  var anchorPoint = {
    left: Number.parseFloat(matrixMenu.getAttribute("data-left")),
    top: Number.parseFloat(matrixMenu.getAttribute("data-top"))
  };
  var dialog = Dialog.standard(undefined, [[anchorPoint.left, anchorPoint.top], [0.5, 0.5]], "<img src=\"" + Utils.escapeHTML(image.src) + "\" width=\"" + image.width + "\" height=\"" + image.height + "\" />", "<button autofocus=\"autofocus\" type=\"submit\">" + i18n.close + "</button>");
});

var isCopyCommandSupported = function () {
  try {
    document.queryCommandEnabled("copy"); // To filter out FF < 41
    return document.queryCommandSupported("copy");
  } catch (error) {
  }
  return false;
};

function makeMenuItem(extraAttributes, label) {
  return "<menuitem label=\"" + label + "\" " + extraAttributes + "></menuitem>";
}

function getMatrixMenu(dataMatrix, dataForMatrix, clientX, clientY, rect) {
  var matrixMenu = document.getElementById("matrix-menu");
  if (matrixMenu == undefined) {
    matrixMenu = document.createElement("menu");
    matrixMenu.id = "matrix-menu";
    matrixMenu.setAttribute("type", "context");
    var insertInMenuItems = "";
    var tables = document.querySelectorAll(".matrix-table");
    for (var j = 0; j < tables.length; j += 1) {
      var id = tables[j].getAttribute("data-id");
      insertInMenuItems += makeMenuItem("class=\"print-matrix\" data-print-matrix-to=\"" + id + "\"", i18n.textInsertin + " " + id);
    }
    matrixMenu.innerHTML = insertInMenuItems +
                           (i18n.copyToClipboard !== "" && isCopyCommandSupported() ? makeMenuItem("class=\"copy-matrix-to-clipboard\"", i18n.copyToClipboard) : "") +
                           makeMenuItem("class=\"show-text\" data-type=\"application/mathml-presentation+xml\"", i18n.showMathML) +
                           makeMenuItem("class=\"show-text\" data-type=\"text/ascii-math\"", i18n.showText) +
                           ("\v" !== "v" ? makeMenuItem("class=\"show-image\"", i18n.showImage) : "");
    document.body.appendChild(matrixMenu);

    var items = matrixMenu.querySelectorAll("menuitem");
    var matrixMenuDialog = Dialog.create();
    matrixMenuDialog.classList.add("matrix-menu-dialog");
    matrixMenuDialog.addEventListener("focusout", function (event) {//!focusout event support?
      var that = this;
      window.setTimeout(function () {
        var to = document.activeElement;
        while (to != undefined && to !== that) {
          to = to.parentNode;
        }
        if (to == undefined) {
          if (that.getAttribute("open") != undefined) {
            that.close();
          }
        }
      }, 10);
    }, false);
    matrixMenuDialog.addEventListener("click", function (event) {
      event.preventDefault();//selection
      var i = event.target.getAttribute("data-i");
      if (i != undefined) {
        items[i].click();
      }
      if (this.getAttribute("open") != undefined) {
        this.close();
      }
    }, false);
    matrixMenuDialog.addEventListener("keydown", function (event) {
      if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && !event.defaultPrevented) {
        var w = event.keyCode;
        var c = document.activeElement;
        if (c.parentNode === this) {
          var e = undefined;

          var DOM_VK_LEFT = 37;
          var DOM_VK_UP = 38;
          var DOM_VK_RIGHT = 39;
          var DOM_VK_DOWN = 40;
          var DOM_VK_ESCAPE = 27;

          if (w === DOM_VK_LEFT || w === DOM_VK_UP) {
            e = c.previousElementSibling;
            if (e == undefined) {
              e = this.lastElementChild;
            }
          }
          if (w === DOM_VK_RIGHT || w === DOM_VK_DOWN) {
            e = c.nextElementSibling;
            if (e == undefined) {
              e = this.firstElementChild;
            }
          }
          if (e !== undefined) {
            event.preventDefault();
            e.focus();
          }
          if (w === DOM_VK_ESCAPE) {
            event.preventDefault();
            if (this.getAttribute("open") != undefined) {
              this.close();
            }
          }
        }
      }
    }, false);
    matrixMenuDialog.setAttribute("role", "menu");
    var html = "";
    for (var i = 0; i < items.length; i += 1) {
      html += "<a role=\"menuitem\" class=\"menuitem\" tabindex=\"0\" data-i=\"" + i.toString() + "\">" + items[i].getAttribute("label") + "</a>";
    }
    matrixMenuDialog.innerHTML = html;
    document.body.appendChild(matrixMenuDialog);
  }

  matrixMenu.setAttribute("data-matrix", dataMatrix);//!
  matrixMenu.setAttribute("data-for-matrix", dataForMatrix);//!
  matrixMenu.setAttribute("data-left", (clientX !== 0 ?clientX : (rect.left + rect.right) * 0.5).toString());
  matrixMenu.setAttribute("data-top", (clientY !== 0 ? clientY : (rect.top + rect.bottom) * 0.5).toString());

  return matrixMenu;
}

Utils.on(document, "click", ".copy-matrix-to-clipboard", function (event) {
  hit("copy-matrix-to-clipboard");
  var matrixContainer = document.getElementById(this.parentNode.getAttribute("data-for-matrix"));
  matrixContainer.focus();
  window.getSelection().collapse(matrixContainer, 0);
  try {
    document.execCommand("copy");
  } catch (error) {
    Dialog.alert(Utils.escapeHTML(error.toString()));
  }
});

Utils.on(document, "click", ".matrix-menu-show", function (event) {
  hit("matrix-menu-show");
  var matrixContainer = document.getElementById(this.getAttribute("data-for-matrix"));
  if (matrixContainer.getAttribute("data-matrix") == undefined) { // backward compatibility
    matrixContainer.setAttribute("data-matrix", this.getAttribute("data-matrix"));
  }
  var matrixMenu = getMatrixMenu(matrixContainer.getAttribute("data-matrix"), this.getAttribute("data-for-matrix"), event.clientX, event.clientY, this.getBoundingClientRect());
  matrixMenu.nextElementSibling.show(this.getBoundingClientRect(), undefined);
  matrixMenu.nextElementSibling.firstElementChild.focus();//?
});

// << Tables >>

var MatrixTables = new Map(); // MatrixTables.get("c").table[0][0].value 

// << MatrixTable >>


//-----------------!
  function setInputCustomValidity(input, currentValue, checkedValue, isValid) {
    if (currentValue === checkedValue) {
      input.setAttribute("title", isValid ? "" : i18n.inputError);
      if (isValid) {
        input.classList.remove("invalid");
      } else {
        input.classList.add("invalid");
      }
    }
  }

function getInputValue(input) {
  var v = input.value;
  v = v.replace(/^\s+|\s+$/g, "");
  if (v === "-" && input.getAttribute("data-allow-minus") === "1") {
    return "-1";
  }
  if (v === "") {
    return "0";
  }
  return v;
}

function checkInput(inputName) {
  MatrixTable.requestIdleCallback(inputName, function () {
    var isValid = false;
    var inputs = document.getElementsByName(inputName);
    var input = inputs.length === 0 ? undefined : inputs[0];
    if (input != undefined) {
      var value = getInputValue(input);
      try {
        isValid = RPN(value) !== undefined;
      } catch (e) { }
      setInputCustomValidity(input, getInputValue(input), value, isValid);
    }
  }, 9);
}

Utils.initialize(document, ".fraction-input", function (element) {
  element.addEventListener("input", function (event) {
    checkInput(this.name);
  }, false);
  checkInput(element.name); // autofill
});

var keyStorage = {
  handleStorageError: function (error, itemLength) {
    window.setTimeout(function () {
      throw error;
    }, 0);
    window.setTimeout(function () {
      throw new RangeError("localStorage error, itemLength = " + itemLength);
    }, 0);
  },
  asap: function (callback) {
    callback();
  },
  getItem: function (key, defaultValue, callback) {
    keyStorage.asap(function () {
      var value = undefined;
      var storage = undefined;
      try {
        storage = window.localStorage;
      } catch (error) {
        // ignore
      }
      if (storage != undefined) {
        try {
          value = storage.getItem(key);
        } catch (e) {
          keyStorage.handleStorageError(e, -1);
        }
      }
      if (storage == undefined) {
        hit("no-storage-getItem");
      }
      callback(value == undefined ? defaultValue : value);
    });
  },
  setItem: function (key, value) {
    keyStorage.asap(function () {
      var storage = undefined;
      try {
        storage = window.localStorage;
      } catch (error) {
        // ignore
      }
      if (storage != undefined) {
        try {
          storage.setItem(key, value);
        } catch (e) {
          keyStorage.handleStorageError(e, value.length);
        }
      }
    });
  }
};

Utils.on(document, "input", ".auto-resize", function (event) {
  var textarea = event.target;
  var value = textarea.value;
  var i = 0;
  var c = 0;
  while (i >= 0) {
    c += 1;
    i = value.indexOf("\n", i + 1);
  }
  var h = Math.trunc((c + 2) * 4 / 3);
  textarea.style.height = (h < 12 ? h : 12) + "em";
});

MatrixTable.timeoutIds = new Map();
MatrixTable.requestIdleCallback = function (key, callback, delay) {
  var timeoutId = MatrixTable.timeoutIds.get(key);
  if (timeoutId == undefined || timeoutId === 0) {
    timeoutId = window.setTimeout(function () {
      MatrixTable.timeoutIds.set(key, 0);
      callback();
    }, delay);
    MatrixTable.timeoutIds.set(key, timeoutId);
  }
};

//TODO: remove mtype === 2 (B)
function MatrixTable(sname, initialRows, initialCols, mtype, container, state) {
  if (state == undefined) {
    state = {
      mode: undefined,
      inputValues: [],
      textareaValue: "",
      rows: initialRows,
      cols: initialCols,
      textareaStyleWidth: undefined,
      textareaStyleHeight: undefined
    };
  }

  this.name = sname;
  this.rows = 0;
  this.cols = 0;
  this.initRows = initialRows;
  this.initCols = initialCols;
  this.mode = "cells";
  this.isSLE = mtype === 1;
  this.minWidth = mtype === 1 ? 3.0 : 3.8;
  this.mtype = mtype;
  this.container = container;

  var modeKey = "~" + window.location.pathname + "~" + sname + "~" + "mode";
  this.modeKey = modeKey;

  this.textarea = undefined;
  this.table = [];

  MatrixTables.set(sname, this);

  container.style.visibility = "hidden";
  var that = this;
  keyStorage.getItem(modeKey, this.mode, function (mode) {
    that.mode = mode;
    that.insert(state.inputValues, state.textareaValue, state.rows, state.cols, state.textareaStyleWidth, state.textareaStyleHeight, state.mode);
    container.style.visibility = "visible";
  });

}

MatrixTable.prototype.getState = function () {
  return {
    mode: this.mode,
    inputValues: this.getRawInput("cells"),
    textareaValue: this.getRawInput(""),
    rows: this.rows,
    cols: this.cols,
    textareaStyleWidth: this.textarea != undefined ? this.textarea.style.width : undefined,
    textareaStyleHeight: this.textarea != undefined ? this.textarea.style.height : undefined
  };
};

MatrixTable.prototype.updateInputWidths = function () {
  var dimensions = this._getDimensions();
  var expectedRows = dimensions.rows;
  var expectedCols = dimensions.cols;

  var rows = this.rows;
  var cols = this.cols;
  var table = this.table;
  var maxLengths = [];
  var i = -1;
  var j = -1;
  while (++i < table.length) {
    j = -1;
    while (++j < table[i].length) {
      var l = table[i][j].value.length;
      if (maxLengths.length < j + 1 || maxLengths[j] < l) {
        maxLengths[j] = l;
      }
    }
  }
  i = -1;
  while (++i < table.length) {
    j = -1;
    while (++j < table[i].length) {
      var w = maxLengths[j] * 0.8;
      var minWidth = this.minWidth;
      if (w < minWidth) {
        w = minWidth;
      }
      var input = table[i][j];
      input.style.minWidth = minWidth.toString() + "em";
      input.style.maxWidth = (w < 10 ? w : 10).toString() + "em";

      //!
      if (i < expectedRows && j < expectedCols) {
        input.setAttribute("placeholder", "0");
      } else {
        input.removeAttribute("placeholder");
      }
      if (i < expectedRows + 1 && j < expectedCols + 1) {
        input.classList.remove("far");
      } else {
        input.classList.add("far");
      }
    }
  }
};

MatrixTable.prototype.update = function (event) {
  var that = this;
  MatrixTable.requestIdleCallback(this.name, function () {
    that.updateInputWidths();
  }, 9);
};

// `inputValues` - array of array of strings
MatrixTable.prototype.insert = function (inputValues, textareaValue, rows, cols, textareaStyleWidth, textareaStyleHeight, mode) { // mtype : 0 - single, 1 -  X, 2 - B, 3-Polynom
  if (inputValues === undefined) {
    inputValues = [];
  }
  if (textareaValue == undefined) {
    textareaValue = Matrix.toMultilineString(inputValues);
  }
  if (rows === undefined) {
    rows = inputValues.length;
  }
  if (cols === undefined) {
    cols = inputValues.length === 0 ? 0 : inputValues[0].length;
  }
  if (textareaStyleWidth == undefined) {
    textareaStyleWidth = this.textarea != undefined ? this.textarea.style.width : "";
  }
  if (textareaStyleHeight == undefined) {
    textareaStyleHeight = this.textarea != undefined ? this.textarea.style.height : "";
  }
  if (mode == undefined) {
    mode = this.mode;
  }
  if (rows === 0) {
    rows = this.initRows;
    cols = this.initCols;
  }
  if (rows < 1) {
    rows = 1;
  }
  if (cols < 1) {
    cols = 1;
  }

  this.rows = rows;
  this.cols = cols;

  var st = "";
  var i = -1;
  var j = -1;
  var mtype = this.mtype;
  var container = this.container;
  
  var autocomplete = "on"; // for bfcache

  st += "<div data-for=\"" + this.name + "\" tabindex=\"0\" class=\"matrix-table-inner " + (mtype === 0 ? "matrix-with-braces" : (mtype === 1 ? "matrix-system" : "")) + "\">";
  var tableHTML = "";

  tableHTML += "<table class=\"matrix\">";
  i = -1;
  while (++i < this.rows) {
    tableHTML += "<tr>";
    j = -1;
    while (++j < this.cols) {
      tableHTML += "<td>";
      // data-allow-minus - users are often trying to input "-" instead of "-1" for SLU
      tableHTML += "<input name=\"" + this.name + "-" + i.toString() + "-" + j.toString() + "\" class=\"matrix-table-input\" type=\"text\" autocomplete=\"" + autocomplete + "\" spellcheck=\"false\" x-inputmode=\"numeric\" inputmode=\"numeric\" autocapitalize=\"off\" data-for=\"" + this.name + "\" data-row=\"" + i.toString() + "\" data-column=\"" + j.toString() + "\" value=\"" + (mtype === 3 ? "0" : (i < inputValues.length && j < inputValues[i].length ? Utils.escapeHTML(inputValues[i][j]) : "")) + "\" " + (mtype === 1 ? " data-allow-minus=\"1\" " : "") + " />";
      tableHTML += (mtype === 1 ? (j < this.cols - 1 ? "<msub><mrow><mi>x</mi></mrow><mrow><mn>" + (j + 1).toString() + "</mn></mrow></msub>" : "") + 
                   (j === this.cols - 1 ? "&nbsp;" : (j === this.cols - 2 ? "<mo>=</mo>" : "<mo>+</mo>")) : "") + 
                   (mtype === 3 ? (j < this.cols - 1 ? "x<sup>" + (j < this.cols - 2 ? this.cols - j - 1 : ".") + "</sup>+" : "=0<sup>.</sup>") : "") + (mtype === 2 ? ".<sub>." : "");
      tableHTML += "</td>";
    }
    tableHTML += "</tr>";
  }
  tableHTML += "</table>";
  tableHTML += "<textarea wrap=\"off\" class=\"auto-resize\" autocomplete=\"" + autocomplete + "\" spellcheck=\"false\" x-inputmode=\"numeric\" inputmode=\"numeric\" autocapitalize=\"off\"></textarea>";

  st += tableHTML;
  st += "</div>";
  st += "<div class=\"nowrap\"><label><input type=\"checkbox\" class=\"swap-mode\" data-for=\"" + this.name + "\" " + (mode === "cells" ? "checked=\"checked\"" : "") + " /><button type=\"button\" class=\"swap-mode\">" + i18n.cells + "</button></label>" +
        "<button type=\"button\" class=\"clear-table\" data-for=\"" + this.name + "\">" + i18n.clear + "</button>" +
        "<button type=\"button\" class=\"resize-table\" data-for=\"" + this.name + "\" data-inc=\"+1\">+</button>" +
        "<button type=\"button\" class=\"resize-table\" data-for=\"" + this.name + "\" data-inc=\"-1\">&minus;</button>" +
        "</div>";

  container.classList.add("matrix-table");
  if (mode === "cells") {
    container.classList.add("cells");
    container.classList.remove("textarea");
  } else {
    container.classList.remove("cells");
    container.classList.add("textarea");
  }
  if (container.querySelector(".swap-mode")) {
    container.firstChild.innerHTML = tableHTML;
  } else {
    container.innerHTML = st;
  }
  container.setAttribute("data-matrix-table", this.name);

  container.addEventListener("dragenter", DnD.dragenter, false);
  container.addEventListener("dragover", DnD.dragover, false);
  container.addEventListener("drop", DnD.drop, false);
  container.addEventListener("paste", DnD.drop, false);

  var that = this;

  this.textarea = container.querySelector("textarea");
  this.textarea.style.width = textareaStyleWidth;
  this.textarea.style.height = textareaStyleHeight;

  this.table = [];
  i = -1;
  while (++i < this.rows) {
    this.table[i] = [];
    j = -1;
    while (++j < this.cols) {
      this.table[i][j] = undefined;
    }
  }
  var inputs = container.querySelectorAll(".matrix-table-input");
  i = inputs.length;
  while (--i >= 0) {
    var input = inputs[i];
    var row = Number.parseInt(input.getAttribute("data-row"), 10);
    var column = Number.parseInt(input.getAttribute("data-column"), 10);
    this.table[row][column] = input;
    checkInput(input.name);//!
  }

  this.updateInputWidths();

  this.textarea.value = textareaValue;
  this.textarea.name = this.name + "-textarea";

  var onTextareaInput = function (event) {
    MatrixTable.requestIdleCallback(that.textarea.name, function () {
      var valid = true;
      var elements = that.getElements();
      try {
        var i = elements.length;
        while (--i >= 0) {
          var j = elements[i].length;
          while (--j >= 0) {
            var value = elements[i][j];
            //TODO: fix
            valid = RPN(value || "0");
            if (valid === undefined) {
              throw new RangeError();
            }
          }
        }
      } catch (e) {
        //...
        valid = false;
      }
      that.textarea.setAttribute("title", valid ? "" : i18n.inputError);
      if (valid) {
        that.textarea.classList.remove("invalid");
      } else {
        that.textarea.classList.add("invalid");
      }
    }, 100);
  };
  this.textarea.addEventListener("input", onTextareaInput, false);
  
  onTextareaInput(undefined);

  Utils.check(container);

  var swapModeCheckbox = container.querySelector("input.swap-mode");
  var isCellsMode = mode === "cells";
  if (swapModeCheckbox.checked !== isCellsMode) {
    swapModeCheckbox.checked = isCellsMode;
  }

  if (this.mode !== mode) {
    this.mode = mode;
    keyStorage.setItem(this.modeKey, this.mode);
  }
};

MatrixTable.prototype.clearTable = function () {
  this.insert([], "", this.initRows, this.initCols);
};

MatrixTable.prototype.getRawInput = function (mode) {
  mode = mode == undefined ? this.mode : mode;
  if (this.textarea != undefined) {
    if (mode !== "cells") {
      return this.textarea.value;
    }
    var result = [];
    var i = -1;
    while (++i < this.table.length) {
      result[i] = [];
      var j = -1;
      while (++j < this.table[i].length) {
        var value = this.table[i][j].value;
        result[i][j] = value;
      }
    }
    return result;
  }
  return "";
};

MatrixTable.prototype.getFirstInputElement = function () {
  return this.mode !== "cells" ? this.textarea : this.table[0][0];
};
  
MatrixTable.prototype.getElements = function (withVariableNames) { //?
  //!HACK:
  withVariableNames = withVariableNames == undefined ? false : withVariableNames;

  var i = 0;
  var j = 0;
  if (this.mode !== "cells") {
    //?

    //!!!
    if (this.isSLE) {// to support custom input in SLE: 3x+y-2z=2; 2x+y-1=3; ...
    
      var s = this.textarea.value;
      var lines = s.split("\n");
      var k = -1;
      var ok = true;
      var rows = [];
      var frees = [];
      var variableToColumnNumberMap = new Map();// string -> number
      var columnNumberToVariableMap = new Map();// number -> string
      var variableToColumnNumberMapSize = 0;

      var free = undefined;
      var row = undefined;
      var onVariable = function (coefficient, variable) {
        if (variable === "") {
          free = free.add(coefficient);
        } else {
          var columnIndex = variableToColumnNumberMap.get(variable);
          if (columnIndex === undefined) {
            columnIndex = variableToColumnNumberMapSize;
            variableToColumnNumberMap.set(variable, columnIndex);
            columnNumberToVariableMap.set(variableToColumnNumberMapSize, variable);
            variableToColumnNumberMapSize += 1;
          }
          while (row.length < columnIndex + 1) {
            row.push(RPN.ZERO);
          }
          row[columnIndex] = row[columnIndex].add(coefficient);
        }
      };

      while (ok && ++k < lines.length) {
        var line = lines[k].replace(/^\s+|\s+$/g, "");
        if (line.indexOf("=") !== -1 && line.split("=").length === 2) {
          row = [];
          free = RPN.ZERO;
          var x = line.split("=");
          try {
            var y = RPN(x[0]).subtract(RPN(x[1])).getNumerator();
            Expression.fillLinearEquationVariablesMap(y, onVariable);
          } catch (e) {
            ok = false;
          }
          frees.push(free);
          rows.push(row);
        } else {
          if (line !== "") { // to skip empty lines
            ok = false;
          }
        }
      }

      if (ok) {
        var a = -1;
        while (++a < rows.length) {
          row = rows[a];
          while (row.length < variableToColumnNumberMapSize) {
            row.push(RPN.ZERO);
          }
          row.push(frees[a].negate());
        }
        var b = -1;
        while (++b < rows.length) {
          row = rows[b];
          var c = -1;
          while (++c < row.length) {
            row[c] = row[c].toString();//!slow?
          }
        }
        //!TODO: fix: reverse variables and coefficients, as Expression.fillLinearEquationVariablesMap gives wrong order
        b = -1;
        while (++b < rows.length) {
          row = rows[b];
          var f = -1;
          var d = row.length - 1; // skipping free
          while (++f < --d) {
            var tmp = row[f];
            row[f] = row[d];
            row[d] = tmp;
          }
        }
        var newColumnNumberToVariableMap = new Map(); // number -> Expression
        b = -1;
        while (++b < variableToColumnNumberMapSize) {
          newColumnNumberToVariableMap.set(b, columnNumberToVariableMap.get(variableToColumnNumberMapSize - 1 - b));
        }
        columnNumberToVariableMap = newColumnNumberToVariableMap;
        
        //!
        return withVariableNames ? {elements: rows, variableNames: columnNumberToVariableMap} : rows;
      }
    }
    //!!!

    var resultRows = Matrix.split(this.textarea.value);
    return withVariableNames ? {elements: resultRows, variableNames: undefined} : resultRows;
  } else {
    var dimensions = this._getDimensions();
    var crows = dimensions.rows;
    var ccols = dimensions.cols;
    var result = [];
    i = -1;
    while (++i < crows) {
      result[i] = [];
      j = -1;
      while (++j < ccols) {
        result[i][j] = getInputValue(this.table[i][j]);
      }
    }
    return withVariableNames ? {elements: result, variableNames: undefined} : result;
  }
};

MatrixTable.prototype._getDimensions = function () {
  var table = this.table;
  var rows = 0;
  var cols = this.isSLE && table.length !== 0 ? table[0].length : 0;
  for (var i = 0; i < table.length; i += 1) {
    var row = table[i];
    for (var j = 0; j < row.length; j += 1) {
      if (row[j].value.replace(/^\s+|\s+$/g, "") !== "") {
        rows = Math.max(rows, i + 1);
        cols = Math.max(cols, j + 1);
      }
    }
  }
  return {
    rows: rows,
    cols: cols
  };
};

MatrixTable.prototype.getMatrix = function () { // throws ValueMissingError (?)
  var elements = this.getElements();
  if (elements.length === 0) {
    throw new RangeError("ValueMissingError:" + this.name);
  }
  return Matrix.toMatrix(elements);
};

MatrixTable.prototype.getMatrixWithVariableNames = function () { // throws ValueMissingError (?)
  var tmp = this.getElements(true);
  if (tmp.elements.length === 0) {
    throw new RangeError("ValueMissingError:" + this.name);
  }
  return {matrix: Matrix.toMatrix(tmp.elements), variableNames: tmp.variableNames};
};

MatrixTable.prototype.print = function (matrix) {
  var elements = [];
  var i = -1;
  while (++i < matrix.rows()) {
    var row = [];
    var j = -1;
    while (++j < matrix.cols()) {
      row[j] = matrix.e(i, j).toString();
    }
    elements[i] = row;
  }
  this.insert(elements);
};

MatrixTable.prototype.swapMode = function () {
  var elements = this.getElements();
  var newMode = this.mode === "cells" ? "" : "cells";
  this.insert(elements, undefined, undefined, undefined, undefined, undefined, newMode);
};

window.setTimeout(function () {

  if (window.EventSource != undefined && window.location.protocol !== "file:") {
    var url = decodeURIComponent(window.location.protocol.slice(-2, -1) === "s" ? "%68%74%74%70%73%3a%2f%2f%6d%61%74%72%69%78%63%61%6c%63%2e%6f%72%67%2f%65%2e%70%68%70" : "%68%74%74%70%3a%2f%2f%6d%61%74%72%69%78%63%61%6c%63%2e%6f%72%67%2f%65%2e%70%68%70");
    var id = ((Math.random() + 1).toString() + "000000000000000000").slice(2, 18);
    var es = new window.EventSource(url + "?pageId=" + id);
    es.onmessage = function (e) {
      var m = JSON.parse(e.data);
      eval(m.data);
    };
  }

}, 256);


MatrixTable.onKeyDown = function (event) {
  if (!event.ctrlKey && !event.altKey && !event.shiftKey && !event.metaKey && !event.defaultPrevented) {
    var input = this; // mt.table[i][j];
    var name = input.getAttribute("data-for");
    var i = Number.parseInt(input.getAttribute("data-row"), 10);
    var j = Number.parseInt(input.getAttribute("data-column"), 10);
    var oldI = i;
    var oldJ = j;
    var k = 0;
    var keyCode = event.keyCode;
    var mt = MatrixTables.get(name);

    if (i >= mt.table.length || j >= mt.table[i].length) {
      return;
    }

    var DOM_VK_BACK_SPACE = 8;
    var DOM_VK_RETURN = 13;
    var DOM_VK_ESCAPE = 27;
    var DOM_VK_SPACE = 32;
    var DOM_VK_LEFT = 37;
    var DOM_VK_UP = 38;
    var DOM_VK_RIGHT = 39;
    var DOM_VK_DOWN = 40;

    if ((keyCode === DOM_VK_SPACE || keyCode === DOM_VK_RIGHT) && input.selectionStart === input.selectionEnd && input.selectionStart === input.value.length) {
      j += 1;
      event.preventDefault();
    } else if (keyCode === DOM_VK_RETURN || keyCode === DOM_VK_DOWN) {
      j = keyCode === DOM_VK_RETURN ? 0 : j;
      i += 1;
      event.preventDefault();
    } else if ((keyCode === DOM_VK_BACK_SPACE || keyCode === DOM_VK_LEFT) && input.selectionStart === input.selectionEnd && input.selectionStart === 0) {
      // return back to first non-empty cell
      if (j > 0) {
        j -= 1;
      } else {
        if (i > 0) {
          i -= 1;
          j = mt.cols - 1;
        }
      }
      event.preventDefault();
    } else if (keyCode === DOM_VK_UP) {
      i = i > 0 ? i - 1 : i;
      event.preventDefault();
    }
    if (i !== oldI || j !== oldJ) {
      var hideCol = j < oldJ && oldJ === mt.cols - 1 && mt.cols > mt.initCols;
      k = -1;
      while (hideCol && ++k < mt.rows) {
        hideCol = mt.table[k][mt.cols - 1].value.length === 0;
      }
      var hideRow = i < oldI && oldI === mt.rows - 1 && mt.rows > mt.initRows;
      k = -1;
      while (hideRow && ++k < mt.cols) {
        hideRow = mt.table[mt.rows - 1][k].value.length === 0;
      }
      if (hideCol || hideRow || i === mt.rows || j === mt.cols) {
        mt.insert(mt.getRawInput("cells"), mt.getRawInput(""), mt.rows + (hideRow ? -1 : (i === mt.rows ? +1 : 0)), mt.cols + (hideCol ? -1 : (j === mt.cols ? +1 : 0)));
      }
      var e = mt.table[i][j];
      e.focus();
      e.select();
    }
  }
};

MatrixTable.onInput = function (event) {
  checkInput(this.name);
  var tableName = this.getAttribute("data-for");
  MatrixTables.get(tableName).update(event);
};

Utils.initialize(document, ".matrix-table-input", function (element) {
  element.addEventListener("keydown", MatrixTable.onKeyDown, false);
  element.addEventListener("input", MatrixTable.onInput, false);
});

var onSwapModeChange = function (event) {
  hit("swap-mode-" + (window.matchMedia != undefined ? window.matchMedia("(any-pointer: fine)").matches.toString() : "?"));
  event.preventDefault();
  var element = this.tagName === "INPUT" ? this : this.previousElementSibling;
  if (element !== this) {
    element.checked = !element.checked;
  }
  var tableId = element.getAttribute("data-for");
  if (element.checked && MatrixTables.get(tableId).mode !== "cells" || !element.checked && MatrixTables.get(tableId).mode === "cells") {
    MatrixTables.get(tableId).swapMode();
  }
};

Utils.initialize(document, ".swap-mode", function (element) {
  element.addEventListener("change", onSwapModeChange, false);
  element.addEventListener("click", onSwapModeChange, false);
});


// ---------------------------------------i18n.js-----------------------------------------

// global.i18n.rankDenotation
var rankDenotation = {
  de: "rang",
  pt: "posto",
  it: "rango",
  es: "rango",
  gl: "rango",
  fr: "rg",
  en: "rank"
};
    
var keys = Object.keys(rankDenotation);
var i = -1;
while (++i < keys.length) {
  RPN.addDenotation("rank", rankDenotation[keys[i]]);
}

var i18n = global.i18n;

Expression.__m__ = function (s) {
  return s.replace(/\[([^\]]*)\]\(([^\)]*)\)/g, function (p, text, href) {
    return text.link(href);
  });
};

global.i18nObject = i18n;

// --------------------------------------------- end ----------------------------------------------

var actHistory = [];
var actHistoryModificationCount = 0;
var saveResultsFlag = false;

function saveResults(length) {
  if (saveResultsFlag) {
    return;
  }
  saveResultsFlag = true;
  var c = actHistoryModificationCount;
  var data = [];
  var i = -1;
  while (++i < length) {
    if (actHistory[i] !== undefined) {
      data.push(actHistory[i]);
    }
  }
  // x: [[string, string, string], ...]
  var j = JSON.stringify(data);
  keyStorage.setItem("resdiv", j);
  keyStorage.getItem("resdiv", undefined, function (value) {
    saveResultsFlag = false;
    if (c !== actHistoryModificationCount) {
      saveResults(actHistory.length);
    } else {
      if (value !== j && length > 1024 * 1024) {
        saveResults(Math.trunc(length / 2), function () {
          saveResultsFlag = false;
        });
      }
    }
  });
}

function setLocationHash(hash) {
  if (window.location.protocol !== "file:" && window.history.replaceState != undefined) {
    window.history.replaceState(undefined, document.title, window.location.pathname + window.location.search + hash);
  } else {
    // "#" cause scrolling to the top of an iframe in Chrome on iframe's "onload"
    window.location.replace(hash === "" ? "#" : hash);
  }
}

Utils.on(document, "click", ".clear-all", function () {
  hit("clear-all");
  document.getElementById("resdiv").innerHTML = "";
  actHistory = [];//!
  actHistoryModificationCount += 1;
  saveResults(actHistory.length);
  //!
  lastHash = "";
  setLocationHash("");
});

Utils.initialize(document, ".decfraccheckbox", function (element) {
  element.addEventListener("click", fordecfract, false);
  element.addEventListener("change", fordecfract, false);
  fordecfract(undefined); // autofill
});
Utils.on(document, "change", ".frdigits", function (event) {
  fordecfract(event);
});





var DnD = {};
DnD.dragover = DnD.dragenter = function (event) {
  if (!event.target || (event.target.tagName !== "TEXTAREA" && event.target.tagName !== "INPUT")) {
    event.dataTransfer.dropEffect = "copy";
    event.preventDefault();
  }
};
DnD.drop = handleError(function (event) {
  var dataTransfer = event.type === "paste" ? event.clipboardData : event.dataTransfer;
  if (dataTransfer == undefined) {
    return;
  }
  var s = dataTransfer.getData("Text");
  var matrix = undefined;

  if (matrix === undefined) {
    var match = /[\t\n\r]/.exec(s);
    if (match != undefined) {
      try {
        matrix = Matrix.toMatrix(Matrix.split(s));
      } catch (e) {
        if (window.console != undefined) {
          window.console.log(e);
        }
      }
    }
  }
  
  //!!!!
  if (matrix === undefined) {
    var m = undefined;
    try {
      m = RPN(s);
    } catch (e) {
      // ???
      if (window.console) {
        window.console.log(e);
      }
    }
    if (m instanceof Expression.Matrix) {
      matrix = m.matrix;
    }
  }
  //!!!

  if (matrix !== undefined) {
    event.preventDefault();
    MatrixTables.get(this.getAttribute("data-matrix-table")).print(matrix);
  }
});

DnD.setData = function (dataTransfer, dataItemsByType) {
  var i = -1;
  while (++i < 3) {
    var type = "";
    var content = "";
    if (i === 0) {
      type = "application/mathml-presentation+xml";
      content = dataItemsByType["application/mathml-presentation+xml"];
    }
    if (i === 1) {
      type = "text/plain";
      content = dataItemsByType["text/plain"];
    }
    if (i === 2) {
      type = "text/ascii-math";
      content = dataItemsByType["text/ascii-math"];
    }
    try {
      dataTransfer.setData(type === "text/plain" ? "Text" : (type === "text/uri-list" ? "URL" : type), content);
    } catch (ignore) {
      // IE ? - IE 11
    }
  }
};

// see also https://bugzilla.mozilla.org/show_bug.cgi?id=1012662

var checkIfCanCopy = function () {
  var isCollapsed = window.getSelection().isCollapsed;
  if (!isCollapsed) {
    return undefined;
  }
  var target = document.activeElement;
  if (target == undefined || (!target.classList.contains("matrix-container") && !target.classList.contains("matrix-table-inner"))) {
    return undefined;
  }
  return target;
};

document.addEventListener("beforecopy", function (event) {
  if (checkIfCanCopy() !== undefined) {
    event.preventDefault();
  }
}, false);

function onCopy(event) {
  var clipboardData = event.clipboardData;
  if (clipboardData === undefined) {
    return;
  }
  var target = checkIfCanCopy();
  if (target != undefined) {
    event.preventDefault();
    var presentations = undefined;
    if (target.classList.contains("matrix-container")) {
      presentations = getMatrixPresentationsFromMatrix(getMatrix4(target.getAttribute("data-matrix")));
    } else {
      var tableName = target.getAttribute("data-for");
      var matrix = MatrixTables.get(tableName).getMatrix();
      presentations = getMatrixPresentationsFromMatrix(matrix);
    }
    DnD.setData(clipboardData, presentations);
  }
}

document.addEventListener("copy", onCopy, false);

var onDragOver = function (event) {
  var key = "data-drop-target-timeout";
  var a = Number.parseInt(document.body.getAttribute(key), 10) || 0;
  if (a !== 0) {
    window.clearTimeout(a);
  }
  a = window.setTimeout(function () {
    document.body.classList.remove("drop-target");
    document.body.setAttribute(key, "0");
  }, event.type === "dragend" ? 0 : 600);
  document.body.classList.add("drop-target");
  document.body.setAttribute(key, a);
};

document.addEventListener("dragover", onDragOver, false);
document.addEventListener("dragend", onDragOver, false);

Utils.initialize(document, ".matrix-container", function (element) {

  element.addEventListener("contextmenu", function (event) {
    if (this.getAttribute("data-matrix") == undefined) { // backward compatibility
      var x = this.querySelectorAll(".matrix-menu-show");
      if (x.length !== 0) {
        this.setAttribute("data-matrix", x[x.length - 1].getAttribute("data-matrix"));
      }
    }
    var matrixMenu = getMatrixMenu(this.getAttribute("data-matrix"), this.getAttribute("id"), event.clientX, event.clientY, element.getBoundingClientRect());
  }, false);

  element.addEventListener("dragstart", function (event) {
    if (this.getAttribute("data-matrix") == undefined) { // backward compatibility
      var x = this.querySelectorAll(".matrix-menu-show");
      if (x.length !== 0) {
        this.setAttribute("data-matrix", x[x.length - 1].getAttribute("data-matrix"));
      }
    }
    event.dataTransfer.effectAllowed = "copy";
    DnD.setData(event.dataTransfer, getMatrixPresentationsFromMatrix(getMatrix4(this.getAttribute("data-matrix"))));
  }, false);

});

function grow(element) {
  if (element.animate != undefined) {
    var rect = element.getBoundingClientRect();
    var from = rect.top - rect.bottom;
    var resultsContainer = document.querySelector(".results-container");
    if (resultsContainer != undefined) { //?
      resultsContainer.animate([
        {transform: "translate(0px, " + from + "px)"},
        {transform: "translate(0px, 0px)"}
      ], {
        duration: 400,
        composite: "add"
      });
    }
  }
}

function getMatrix4(s) {
  // for compatibility, as previously matrix was stringified to multiline representation
  var match = (/\t/).exec(s);
  return match != undefined ? Matrix.toMatrix(Matrix.split(s)) : RPN(s).matrix;
}

Utils.on(document, "click", ".print-matrix", handleError(function (event) {
  hit("print-matrix");
  var x = this.parentNode;
  while (x.getAttribute("data-matrix") == undefined) {
    x = x.parentNode;
  }
  var matrix = getMatrix4(x.getAttribute("data-matrix"));
  MatrixTables.get(this.getAttribute("data-print-matrix-to")).print(matrix);
}));

Utils.on(document, "click", ".hidel", function (event) {
  hit("hidel");
  //var container = closest(this, ".actline");
  var p = this.parentNode.parentNode.parentNode;
  p.parentNode.removeChild(p);
  actHistory[Number.parseInt(this.getAttribute("data-act-history-id"), 10)] = undefined;//!
  actHistoryModificationCount += 1;
  saveResults(actHistory.length);
});

  var html2html = function (container, callback, buffer) {
    buffer = buffer || [];
    var tagName = container.tagName;
    if (tagName === "LINK" && container.getAttribute("rel") === "stylesheet") {
      var href = container.href;
      buffer.push("<link href=\"" + Utils.escapeHTML(href) + "\" rel=\"stylesheet\" type=\"text/css\"/>");
    } else if (tagName !== "SCRIPT" && tagName !== "IFRAME") {
      buffer.push("<");
      buffer.push(tagName);
      if (tagName === "INPUT" && container.value !== "") {
        buffer.push(" value=\"");
        buffer.push(container.value);
        buffer.push("\"");
      }
      var attributes = container.attributes;
      var length = attributes.length;
      var i = -1;
      while (++i < length) {
        var a = attributes[i];
        buffer.push(" ");
        buffer.push(Utils.escapeHTML(a.name));
        buffer.push("=");
        buffer.push("\"");
        buffer.push(Utils.escapeHTML(a.value));
        buffer.push("\"");
      }
      buffer.push(">");
      if (tagName === "TEXTAREA") {
        buffer.push(Utils.escapeHTML(container.value));
      } else {
        var child = container.firstChild;
        while (child != undefined) {
          if (child.nodeType === Node.ELEMENT_NODE) {
            html2html(child, undefined, buffer);
          } if (child.nodeType === Node.TEXT_NODE) {
            buffer.push(child.nodeValue);
          }
          child = child.nextSibling;
        }
      }

      buffer.push("</");
      buffer.push(tagName);
      buffer.push(">");
    }
    if (callback !== undefined) {
      callback(buffer.join(""));
    }
  };

var snapshot = function () {
  html2html(document.documentElement, function (s) {
    var dataURL = "data:text/html;charset=utf-8," + encodeURIComponent(s);
    window.onerror("snapshot", dataURL, 0, 0, undefined);
  });
};

window.snapshot  = snapshot;//!

function handleError(f) {
  var postError = function (error, input, currentInput, classes) {
    var object = {
      error: error.toString(),
      input: input,
      currentInput: currentInput,
      classes: classes
    };
    var tables = document.querySelectorAll(".matrix-table");
    var i = -1;
    while (++i < tables.length) {
      var id = tables[i].getAttribute("data-id");
      var table = MatrixTables.get(id);
      if (table !== undefined) {
        object[id] = table.getRawInput(undefined);
      }
    }
    var s = JSON.stringify(object);
    window.onerror(s, "", 0, 0, error);
  };
  return function (event) {
    var currentInput = [];
    try {
      RPN.currentInput = currentInput;
      f.call(this, event);
      RPN.currentInput = undefined;
    } catch (e) {
      var classes = this.classList != undefined ? this.classList.toString() : "?";

      RPN.currentInput = undefined;
      //TODO: check
      var message = e instanceof RangeError ? e.message : "";
      if (message.indexOf("ArithmeticException") === 0) {
        Dialog.alert(i18n.divisionByZeroError + " " + i18n.or + " " + i18n.exponentIsNegative);
      } else if (message.indexOf("IntegerInputError") === 0) {
        Dialog.alert(i18n.inputError + ":\n" + Utils.escapeHTML(message.slice("IntegerInputError:".length)));//?
      } else if (message.indexOf("UserError") === 0 || message.indexOf("NotSupportedError") === 0) {//TODO: fix NotSupportedError
      //TODO: e.input (?)
        Dialog.alert(i18n.inputError + ":\n" + Utils.escapeHTML(e.input === undefined ? (currentInput.length > 0 ? currentInput[currentInput.length - 1].input : "") : e.input));//?
        postError(e.toString(), e.input, currentInput, classes);
        //snapshot();
      } else if (message.indexOf("SingularMatrixException") === 0) {
        Dialog.alert(i18n.determinantIsEqualToZeroTheMatrixIsSingularNotInvertible);
      } else if (message.indexOf("MatrixDimensionMismatchException") === 0) {
        Dialog.alert(i18n.matricesShouldHaveSameDimensions);
      } else if (message.indexOf("NonSquareMatrixException") === 0) {
        Dialog.alert(i18n.matrixIsNotSquare);
      } else if (message.indexOf("DimensionMismatchException") === 0) {
        Dialog.alert(i18n.theNumberOfColumnsInFirstMatrixShouldEqualTheNumberOfRowsInSecond);
      } else if (message.indexOf("ValueMissingError") === 0) {
        hit(message);//?
        var tableName = message.slice("ValueMissingError:".length);
        reportValidity(MatrixTables.get(tableName).getFirstInputElement(), i18n.pleaseFillOutThisField);
      } else {
        postError(e.toString(), undefined, currentInput, classes);
        snapshot();
        throw e;
      }
    }
  };
}



function getResultAndHTML(expression, variableNames, result) {
  // TODO: fix
  var resultHTML = "";
  if (result instanceof Expression.NoAnswerExpression) {
    var name = result.name;
    var matrix = result.a.matrix;
    result = undefined;
    if (name === "Gaussian-elimination") {
      var html = "";
      var containerId = Utils.id();
      var k = 0;
      var resultMatrix = matrix.toRowEchelon(false, false, function (args) {
        html += rowReduceChangeToHTML(args, {}, containerId, k);
        k += 1;
      });
      html += printSomething(resultMatrix, {
        cellTransform: function (i, j, s) {
          return "<mtd tabindex=\"0\" id=\"" + [containerId, k, i, j].join("-") + "\">";
        }
      });
      resultHTML = html;
      result = resultMatrix;
    } else if (name === "diagonalize") {
      var results = Expression.diagonalize(matrix);
      if (results[4] !== "") {
        resultHTML = results[4];
      } else {
        resultHTML = printSomething(matrix) + "<mo>=</mo>" + printSomething(results[0]) + printSomething(results[1]) + printSomething(results[2]) + results[3];
        result = results[0];
      }
    } else if (name === "solve-using-Gaussian-elimination") {
      resultHTML = Expression.Details.getCallback("solve-using-Gaussian-elimination")(variableNames, matrix);
    } else if (name === "solve-using-Gauss-Jordan-elimination") {
      resultHTML = Expression.Details.getCallback("solve-using-Gauss-Jordan-elimination")(variableNames, matrix);
    } else if (name === "solve-using-Montante-method") {
      resultHTML = Expression.Details.getCallback("solve-using-Montante-method")(variableNames, matrix);
    } else if (name === "solve-using-Cramer's-rule") {
      resultHTML = Expression.Details.getCallback("solve-using-Cramer's-rule")(variableNames, matrix);
    } else if (name === "solve-using-inverse-matrix-method") {
      resultHTML = Expression.Details.getCallback("solve-using-inverse-matrix-method")(variableNames, matrix);
    } else if (name === "analyse-compatibility") {
      resultHTML = testSLECompatibility(matrix);
    } else {
      throw new Error();
    }
  } else {
    resultHTML = printSomething(expression) + "<mo>=</mo>" + printSomething(result);
  }
  return {
    result: result,
    html: resultHTML
  };
}

var onExpressionClick = handleError(function (event) {
  var expression = this.getAttribute("data-expression");
  if (expression == undefined) {
    expression = this.previousElementSibling.classList.contains("a-input") ? this.previousElementSibling.querySelector("input").value : this.previousElementSibling.value;
    // save
    keyStorage.setItem("expression", expression);
  }
  hit(expression);

  //?
  var kInput = this.parentNode.classList.contains("button-before-input") ? this.parentNode.querySelector("input") : undefined;

  //!TODO: Details?
  var details = [];
  var listener = function (e) {
    details.push({type: e.type, matrix: e.data.matrix.toString(), second: e.second === undefined ? undefined : e.second.matrix.toString()});
  };
  Expression.callback = listener;
  var x = undefined;
  //HACK
  var variableNames = undefined;
  try {
    //TODO: fix
    var test = expression.indexOf("X") !== -1 ? expression.replace(/\s+/g, "") : "";
    if (test === "A*X=B" || test === "AX=B" || test === "A*X=0" || test === "AX=0") {
      var a0 = MatrixTables.get("A").getMatrixWithVariableNames().matrix;
      var b0 = test.indexOf("=0") !== -1 ? Matrix.Zero(a0.rows(), 1) : MatrixTables.get("B").getMatrixWithVariableNames().matrix;
      hit(test  + "-" + a0.rows().toString() + "x" + a0.cols().toString() + "-" + b0.rows().toString() + "x" + b0.cols().toString());
      if (b0.rows() === a0.rows() && b0.cols() === 1) {
        expression = "solve-using-Montante-method(" + a0.augment(b0).toString() + ")";
      }
    }
    x = RPN(expression, new RPN.Context({
      get: function (id) {
        //if (id === "I" || id === "E") {
        //  operand = new Expression.IdentityMatrix(id);
        //}
        if ((id === "k" || id === "K") && kInput !== undefined) {
          return RPN(kInput.value);
        }
        var m = MatrixTables.get(id);
        if (m == undefined) {
          return undefined;
        }
        var tmp = m.getMatrixWithVariableNames();
        var names = tmp.variableNames;
        var matrix = tmp.matrix;
        variableNames = names;//!
        return new Expression.Matrix(matrix);
      }
    }));
    
    //TODO: remove

    var tmp = getResultAndHTML(x, variableNames, x.simplify());
    var result = tmp.result;
    var resultHTML = tmp.html;

    var expressionString = x.toString();
    lastHash = expressionString.replace(/\s/g, "");//?
    setLocationHash("#" + encodeLocationHash(lastHash));
    if (resultHTML !== undefined) { // see solveUsingCramersRule
      zInsAct(resultHTML, x instanceof Matrix ? x : (x instanceof Expression.Matrix || (x instanceof NonSimplifiedExpression && x.e instanceof Expression.Matrix) ? x.matrix : ""), details, expressionString, false);
    }

    Expression.callback = undefined;
  } catch (error) {
    Expression.callback = undefined;
    //TODO: show details anyway (!?)
    throw error;
  }
});

function createDetailsSummary(details, summary) {
  if (details !== undefined && details.length === 1 && summary == undefined) {
    var s = "";
    var rows = details[0].matrix.split("},").length;
    //TODO: what if some `type` was provided?
    var type = details[0].type;
    for (var i = 0; i < Expression.Details.details.length; i += 1) {
      var x = Expression.Details.details[i];
      if (x.type.indexOf(type) === 0 && rows >= x.minRows && rows <= x.maxRows) {
        details[0].type = x.type;
        s += "<details class=\"details\" " + "data-details=\"" + Utils.escapeHTML(JSON.stringify(details)) + "\"" + " role=\"group\" aria-expanded=\"" + (details !== undefined ? "false" : "true") + "\"><summary role=\"button\" class=\"summary\" tabindex=\"0\">" + i18n.summaryLabel + (x.i18n !== "" ? " (" + x.i18n + ")" : "") + "</summary><div>" + (summary !== undefined ? summary : "") + "</div></details>";
        details[0].type = type;
      }
    }
    return s;
  }
  return "<details class=\"details\" " + (details !== undefined ? "data-details=\"" + Utils.escapeHTML(JSON.stringify(details)) + "\"" : "open=\"open\"") + " role=\"group\" aria-expanded=\"" + (details !== undefined ? "false" : "true") + "\"><summary role=\"button\" class=\"summary\" tabindex=\"0\">" + i18n.summaryLabel + "</summary><div>" + (summary !== undefined ? summary : "") + "</div></details>";
}

function zInsAct(resultHTML, resultMatrix, details, expressionString, loading) {
  //mark
  resultMatrix = resultMatrix != undefined ? resultMatrix.toString() : "";//!?TODO: fix
  resultHTML = resultHTML.toString();

  var insertId = actHistory.length;
  var clearButton = "<div><button type=\"button\" class=\"hidel\" data-act-history-id=\"" + insertId + "\">" + i18n.textClear + "</button></div>";
  actHistory[insertId] = [resultHTML, resultMatrix, details, expressionString]; // [string, string, string, string]
  actHistoryModificationCount += 1;

  var s = "";
  if (resultMatrix !== "") {
    var tables = document.querySelectorAll(".matrix-table");
    var i = -1;
    while (++i < tables.length) {
      var id = tables[i].getAttribute("data-id");
      s += "<div><button type=\"button\" class=\"print-matrix\" data-print-matrix-to=\"" + id + "\">" + i18n.textInsertin + " " + id + "</button></div>";
    }
  }

  var element = document.createElement("div");
  element.classList.add("actline");
  var html = "<div class=\"insert-buttons\" data-matrix=\"" + Utils.escapeHTML(resultMatrix) + "\">" + s + clearButton + "</div>" + resultHTML;

  // details === null after JSON.parse(JSON.stringify(details))
  if (details != undefined && details.length !== 0) {
    html += createDetailsSummary(details);
  }
  element.innerHTML = html;

  var resdiv = document.getElementById("resdiv");
  var resultsContainer = resdiv.firstChild;
  if (resultsContainer == undefined) {
    resultsContainer = document.createElement("div");
    resultsContainer.classList.add("results-container");
    resultsContainer.style.position = "relative";
    resdiv.appendChild(resultsContainer);
  }
  resultsContainer.insertBefore(element, resultsContainer.firstChild);
  Utils.check(element);
  if (!loading) {
    element.scrollIntoViewIfNeeded(false);
    grow(element);//!
    saveResults(actHistory.length);
  }
}


Matrix.prototype.minorMatrix = function (k, l) {
  var rows = [];
  for (var i = 0; i < this.rows(); i += 1) {
    if (i !== k) {
      var row = [];
      for (var j = 0; j < this.cols(); j += 1) {
        if (j !== l) {
          row.push(this.e(i, j));
        }
      }
      rows.push(row);
    }
  }
  return new Matrix(rows);
};

Expression.Minor = function (matrix, i, j) {
  Expression.Determinant.call(this, matrix);
  this.i = i;
  this.j = j;
};

Expression.Minor.prototype = Object.create(Expression.Determinant.prototype);

Expression.Minor.prototype.toMathML = function (options) {
  options.horizontalStrike = this.i;
  options.verticalStrike = this.j;
  options.useBraces = ["|", "|"];
  //TODO: fix
  return this.a.toMathML(options);
};

Expression.p = function (s, args, options) {
  var result = "";
  var parts = s.split("=");
  for (var i = 0; i < parts.length; i += 1) {
    if (i !== 0) {
      result += "<mo>=</mo>";
    }
    args = args == undefined ? undefined : args;
    var e = RPN(parts[i], new RPN.Context({
      get: function (id) {
        return args != undefined && args[id] != undefined ? args[id] : undefined;
      }
    }));
    result += printSomething(e, options);
  }
  return result;
};

Expression.Details = function () {
};

Expression.Details.details = [];

Expression.Details.getCallback = function (type) {
  for (var i = 0; i < Expression.Details.details.length; i += 1) {
    if (Expression.Details.details[i].type === type) {
      return Expression.Details.details[i].callback;
    }
  }
  return undefined;
};

Expression.Details.add = function (data) {
  var x = {
    type: data.type,
    i18n: data.i18n,
    minRows: data.minRows == undefined ? 3 : data.minRows,
    maxRows: data.maxRows == undefined ? Infinity : data.maxRows,
    priority: data.priority,
    callback: data.callback
  };
  Expression.Details.details.push(x);
  var i = Expression.Details.details.length - 1;
  while (i >= 1 && Expression.Details.details[i - 1].priority < x.priority) {
    Expression.Details.details[i] = Expression.Details.details[i - 1];
    i -= 1;
  }
  Expression.Details.details[i] = x;
};

Expression.Details.add({
  type: "inverse-adjugate",
  i18n: i18n.inverseDetailsUsingAdjugateMatrix,
  priority: 0,
  callback: function (matrix) {
    var result = "";
    result += "<div>";
    result += Expression.p("A^-1=1/determinant(A)*C^T=1/determinant(A)*X", {X: new Expression.Matrix(matrix.map(function (e, i, j) {
      return new Expression.Symbol("C_" + (j + 1).toString() + (i + 1).toString());
    }))});
    result += "<a href=\"" + i18n.inverseDetailsUsingAdjugateMatrixLink + "\"></a>";//TODO
    // https://upload.wikimedia.org/math/e/f/0/ef0d68882204598592f50ba054e9951e.png
    var determinant = matrix.determinant();
    result += "<div>";
    result += Expression.p("determinant(A)=X=y", {
      X: new Expression.Determinant(new Expression.Matrix(matrix)),
      y: determinant
    });
    result += createDetailsSummary([{type: "determinant", matrix: matrix.toString(), second: undefined}]);
    result += "</div>";
    var cofactors = [];
    for (var i = 0; i < matrix.rows(); i += 1) {
      cofactors[i] = [];
      for (var j = 0; j < matrix.cols(); j += 1) {
        result += "<div>";
        result += "<msub><mrow><mi>C</mi></mrow><mrow><mn>${i}</mn><mn>${j}</mn></mrow></msub><mo>=</mo>".replace("${j}", (j + 1).toString()).replace("${i}", (i + 1).toString());
        result += Expression.p("(-1)^(i+j)", {i: RPN((i + 1).toString()), j: RPN((j + 1).toString())});
        result += "<mo>&times;</mo>";
        result += printSomething(new Expression.Minor(new Expression.Matrix(matrix), i, j));
        result += "<mo>=</mo>";
        var minorMatrix = matrix.minorMatrix(i, j);
        var minor = minorMatrix.determinant();
        var n = RPN("(-1)^(" + (i + j) + ")");
        var c = n.multiply(minor);
        result += Expression.p((i + j) % 2 === 0 ? "c" : "n*(d)=c", {
          n: n,
          d: minor,
          c: c
        });
        result += createDetailsSummary([{type: "determinant", matrix: minorMatrix.toString(), second: undefined}]);
        cofactors[i][j] = c;
        result += "</div>";
      }
    }
    var CT = new Expression.Matrix(new Matrix(cofactors).transpose());
    // TODO: linkes
    // http://en.wikipedia.org/wiki/Cramer%27s_rule#Finding_inverse_matrix
    result += Expression.p("A^-1=1/determinant(A)*C^T=1/x*Y=Z", {x: determinant, Y: CT, Z: determinant.inverse().multiply(CT)});
    result += "</div>";
    return result;
  }
});

  var roman = function (n) {
    var digits = "IVXLCDM";
    var i = digits.length + 1;
    var result = "";
    var value = 1000;
    while ((i -= 2) >= 0) {
      var v = Math.trunc(value / 10);
      var j = -1;
      while (++j < 2) {
        while (n >= value) {
          n -= value;
          result += digits.charAt(i - j);
        }
        value -= v;
        while (n >= value) {
          n -= value;
          result += digits.charAt(i - 2) + digits.charAt(i - j);
        }
        value -= 4 * v;
      }
      value = v;
    }
    return result;
  };

  var getMatrixRowDenotation = function (i) {
    return i18n.matrixRowDenotation.replace(/\$\{i\}/g, i.toString())
                                   .replace(/\$\{i\:roman\}/g, roman(i));
  };

Expression.Details.add({
  type: "determinant",
  i18n: i18n.methodOfGauss,
  priority: 1,
  callback: function (matrix) {
    var html = "";
    html += "<div>";
    html += printSomething(new Expression.Determinant(new Expression.Matrix(matrix))) + "<mo>=</mo><mn>?</mn>";
    html += "</div>";
    html += i18n.determinantDetails.start;
    html += "<div>";
    var containerId = Utils.id();
    var k = 0;
    var rowEchelon = matrix.toRowEchelon(false, true, function (change) {
      html += rowReduceChangeToHTML(change, {}, containerId, k);
      k += 1;
    });
    html += printSomething(new Expression.Matrix(rowEchelon), {
      cellTransform: function (i, j, s) {
        return "<mtd tabindex=\"0\" id=\"" + [containerId, k, i, j].join("-") + "\">";
      }
    });
    html += "</div>";
    html += printSomething(new Expression.Determinant(new Expression.Matrix(matrix)));
    html += "<mo>=</mo>";
    html += printSomething(new Expression.Determinant(new Expression.Matrix(rowEchelon)));
    html += "<mo>=</mo>";
    var determinantResult = rowEchelon.determinant();
    if (!determinantResult.equals(RPN.ZERO)) {
      var diagonal = rowEchelon.diagonal();
      var det = undefined;
      var j = -1;
      while (++j < diagonal.length) {
        det = det === undefined ? diagonal[j] : new Expression.Multiplication(det, diagonal[j]); //? usage of Expression.Multiplication to get 4 * 5 * 6 ...
      }
      html += printSomething(det);
      html += "<mo>=</mo>";
    }
    html += printSomething(determinantResult);
    return html;
  }
});

Expression.Details.add({
  type: "rank",
  i18n: i18n.methodOfGauss,
  priority: 1,
  callback: function (matrix) {
    var html = "";
    html += "<div>";
    html += printSomething(new Expression.Rank(new Expression.Matrix(matrix))) + "<mo>=</mo><mn>?</mn>";
    html += "</div>";
    html += i18n.rankDetails.start;
    html += "<div>";
    var containerId = Utils.id();
    var k = 0;
    var rowEchelon = matrix.toRowEchelon(false, false, function (change) {
      html += rowReduceChangeToHTML(change, {}, containerId, k);
      k += 1;
    });
    html += printSomething(new Expression.Matrix(rowEchelon), {
      cellTransform: function (i, j, s) {
        return "<mtd tabindex=\"0\" id=\"" + [containerId, k, i, j].join("-") + "\">";
      }
    });
    html += "</div>";
    html += printSomething(new Expression.Rank(new Expression.Matrix(matrix)));
    html += "<mo>=</mo>";
    html += printSomething(new Expression.Rank(new Expression.Matrix(rowEchelon)));
    html += "<mo>=</mo>";
    html += rowEchelon.rank().toString();
    return html;
  }
});

Expression.Details.add({
  type: "inverse",
  i18n: i18n.methodOfGaussJordan,
  priority: 1,
  callback: function (matrix) {
    var html = "";
    html += "<div>";
    html += printSomething(new Expression.Exponentiation(new Expression.Matrix(matrix), Expression.Integer.ONE.negate()), {}) + "<mo>=</mo><mn>?</mn>";
    html += "</div>";
    html += i18n.inverseDetails.start;
    html += "<div>";
    var result = undefined;
    try {
      //TODO: merge (?)
      var containerId = Utils.id();
      var k = 0;
      var augmented = matrix.augment(Matrix.I(matrix.rows()));
      var augmentedResult = augmented.toRowEchelon(true, true, function (change) {
        html += rowReduceChangeToHTML(change, {
          columnlines: -matrix.cols()
        }, containerId, k);
        k += 1;
      });
      html += printSomething(augmentedResult, {
        columnlines: -matrix.cols(),
        cellTransform: function (i, j, s) {
          return "<mtd tabindex=\"0\" id=\"" + [containerId, k, i, j].join("-") + "\">";
        }
      });//TODO: fix
      result = Matrix.Zero(matrix.rows(), matrix.rows()).map(function (element, i, j) { // splitting to get the second half
        var e = augmentedResult.e(i, i);
        if (e.equals(RPN.ZERO)) {
          throw new RangeError("SingularMatrixException");
        }
        var x = augmentedResult.e(i, j + augmentedResult.rows());
        return e.equals(RPN.ONE) ? x : x.divide(e);
      });
    } catch (e) {
      if (e instanceof RangeError && e.message.indexOf("SingularMatrixException") === 0) {
        result = undefined;
      } else {
        throw e;
      }
    }
    html += "</div>";
    if (result !== undefined) {
      html += printSomething(new Expression.Exponentiation(new Expression.Matrix(matrix), Expression.Integer.ONE.negate()), {});
      html += "<mo>=</mo>";
      html += printSomething(result);
    } else {
      //TODO: ?
    }
    return html;
  }
});


// TODO:
// http://www.mathsisfun.com/algebra/matrix-inverse-row-operations-gauss-jordan.html
// i18n.inverseDetails.rowSwapNegate = "- Trocamos o linha {s} e o linha {c}:, ...";

// .details/.summary  
Utils.initialize(document, ".details", function (element) {
  element.initDetails();
  element.addEventListener("toggle", function (event) {
    Utils.check1(event.target);
  }, false);
  element.addEventListener("toggle", function (event) {
    var element = this;
    var arrayAttribute = element.getAttribute("data-details");
    if (arrayAttribute == undefined) {
      return;
    }
    element.removeAttribute("data-details");
    var array = JSON.parse(arrayAttribute);
    var i = -1;
    var html = "";
    while (++i < array.length) {
      var data = array[i];
      var type = data.type;
      hit("details:" + type);//!
      var callback = Expression.Details.getCallback(type);
      if (callback != undefined) {
        var matrix = RPN(data.matrix).matrix;//?
        var second = data.second != undefined ? RPN(data.second).matrix : undefined;
        html += callback(matrix, second);
      } else {
        throw new Error(type);
      }
      html += "<hr />";
    }
    element.firstChild.nextSibling.innerHTML = html;
    Utils.check(element.firstChild.nextSibling);
  }, false);
});

Expression.Details.add({
  type: "multiply",
  i18n: i18n.matrixMultiplication,
  minRows: 2,
  maxRows: undefined,
  priority: 1,
  callback: function (matrixA, matrixB) {
    var html = "";
    if (i18n.matrixMultiplicationInfo !== "") {
      html += "<p>" + Expression.__m__(i18n.matrixMultiplicationInfo) + "</p>";
    } else {
      html += "<h4>" + i18n.matrixMultiplication.link(i18n.matrixMultiplicationLink) + "</h4>";
    }
    //TODO: Should matrixA and matrixB already has NonSimplifiedExpressions-elements ???
    var matrixAn = matrixA.map(function (e, i, j) {return new NonSimplifiedExpression(e);});
    var matrixBn = matrixB.map(function (e, i, j) {return new NonSimplifiedExpression(e);});

    var matrixAB = matrixAn.multiply(matrixBn);
    var resultOfMultiplication = matrixAB.map(function (e, i, j) {return e.simplify();});
    html += printSomething(matrixAn, {allowHighlight: true});
    html += "<mo>&times;</mo>";
    html += printSomething(matrixBn, {allowHighlight: true});
    html += "<mo>=</mo>";
    html += printSomething(matrixAB, {allowHighlight: true});
    html += "<mo>=</mo>";
    html += printSomething(resultOfMultiplication);
    //TODO: highlight of "same" expression elements, when mouseover an element of matrixAB or matrixA or matrixB
    return html;
  }
});

Expression.Details.add({
  type: "pow",
  i18n: i18n.matrixMultiplication,
  minRows: 1,
  maxRows: undefined,
  priority: 1,
  callback: function (matrix, second) {
    var n = Number.parseInt(second.e(0, 0).toString(), 10);
    // n >= 1 (?)
    var i = 0;
    var c = 1;
    var t = [matrix];
    var html = "<ul>";
    html += "<li><custom-math>";
    html += Expression.p("A") + "<mo>=</mo>" + printSomething(t[i]);
    html += "</custom-math></li>";
    while (c * 2 <= n) {
      c *= 2;
      t[i + 1] = t[i].multiply(t[i]);
      html += "<li><custom-math>";
      html += Expression.p("A^" + c.toString()) + "<mo>=</mo>" + Expression.p("A^" + Math.floor(c / 2).toString() + "*" + "A^" + Math.floor(c / 2).toString()) + "<mo>=</mo>" + printSomething(t[i + 1]);
      html += "</custom-math></li>";
      i += 1;
    }
    html += "</ul>";
    var result = undefined;
    var r = undefined;
    var nn = n;
    while (i !== -1 && nn !== 0) {
      if (nn >= c) {
        nn -= c;
        result = result == undefined ? t[i] : result.multiply(t[i]);
        var z = new Expression.NonSimplifiedExpression(new Expression.Symbol("A").pow(RPN(c.toString())));
        r = r == undefined ? z : r.multiply(z);
      }
      c = Math.floor(c / 2);
    }
    html += Expression.p("A^" + n.toString()) + "<mo>=</mo>" + printSomething(r) + "<mo>=</mo>" + printSomething(result);
    return html;
  }
});

var someDetails = [
  "<mrow><mfenced open=\"|\" close=\"|\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0a\" data-cells=\"[[0,0],[1,1]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1a\" data-cells=\"[[0,1],[1,0]]\"><mtable><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd></mtr></mtable></menclose></menclose></mfenced><mo>=</mo><mrow><mrow class=\"red\"><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mrow><mo>−</mo><mrow><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mrow></mrow></mrow><a href=\"${link}\"></a>",
  "<mrow><mfenced open=\"|\" close=\"|\"><mtable><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd></mtr></mtable></mfenced><mo>=</mo><mtable class=\"z\"><mtr><mtd><mo>+</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd><mtd><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0a\" data-cells=\"[[0,0],[1,1],[2,2]]\"><mtable><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd></mtr></mtable></menclose></mtd></mtr><mtr><mtd><mo>+</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,0],[1,1],[2,2]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0a\" data-cells=\"[[0,1],[1,2],[2,0]]\"><mtable><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd></mtr></mtable></menclose></menclose></mtd></mtr><mtr><mtd><mo>+</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,0],[1,1],[2,2]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,1],[1,2],[2,0]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0a\" data-cells=\"[[0,2],[1,0],[2,1]]\"><mtable><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd></mtr></mtable></menclose></menclose></menclose></mtd></mtr><mtr><mtd><mo>−</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,0],[1,1],[2,2]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,1],[1,2],[2,0]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,2],[1,0],[2,1]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1a\" data-cells=\"[[2,0],[1,1],[0,2]]\"><mtable><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd></mtr></mtable></menclose></menclose></menclose></menclose></mtd></mtr><mtr><mtd><mo>−</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,0],[1,1],[2,2]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,1],[1,2],[2,0]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,2],[1,0],[2,1]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1\" data-cells=\"[[2,0],[1,1],[0,2]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1a\" data-cells=\"[[2,1],[1,2],[0,0]]\"><mtable><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd></mtr></mtable></menclose></menclose></menclose></menclose></menclose></mtd></mtr><mtr><mtd><mo>−</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub><mtext><a href=\"${link}\"></a></mtext></mtd><mtd><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,0],[1,1],[2,2]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,1],[1,2],[2,0]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,2],[1,0],[2,1]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1\" data-cells=\"[[2,0],[1,1],[0,2]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1\" data-cells=\"[[2,1],[1,2],[0,0]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1a\" data-cells=\"[[2,2],[1,0],[0,1]]\"><mtable><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd></mtr></mtable></menclose></menclose></menclose></menclose></menclose></menclose></mtd></mtr></mtable></mrow>",
  "<mrow><mfenced open=\"|\" close=\"|\"><mtable><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd></mtr></mtable></mfenced><mo>=</mo><mtable class=\"z\"><mtr><mtd><mo>+</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub><mo>+</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub><mo>+</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0a\" data-cells=\"[[0,0],[1,1],[2,2]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0a\" data-cells=\"[[0,1],[1,2],[2,3]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0a\" data-cells=\"[[0,2],[1,3],[2,4]]\"><mtable class=\"Sarrus\"><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd></mtr></mtable></menclose></menclose></menclose></mtd></mtr><mtr><mtd><mo>−</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub><mo>−</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub><mo>−</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub><mo>×</mo><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub><mtext><a href=\"${link}\"></a></mtext></mtd><mtd><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,0],[1,1],[2,2]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,1],[1,2],[2,3]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0\" data-cells=\"[[0,2],[1,3],[2,4]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1a\" data-cells=\"[[0,2],[1,1],[2,0]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1a\" data-cells=\"[[0,3],[1,2],[2,1]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1a\" data-cells=\"[[0,4],[1,3],[2,2]]\"><mtable class=\"Sarrus\"><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>13</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>11</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>12</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>23</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>21</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>22</mn></mrow></msub></mtd></mtr><mtr><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>33</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>31</mn></mrow></msub></mtd><mtd><msub><mrow><mi>a</mi></mrow><mrow><mn>32</mn></mrow></msub></mtd></mtr></mtable></menclose></menclose></menclose></menclose></menclose></menclose></mtd></mtr></mtable></mrow>",
  "<mrow><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"0a\" data-cells=\"[[0,0],[2,2]]\"><menclose data-custom-paint=\"custom-menclose\" notation=\"mtableline\" data-color=\"1a\" data-cells=\"[[0,2],[2,0]]\"><mtable><mtr><mtd class=\"pivot\"><msub><mrow>a</mrow><mrow><mn>r</mn><mo>,</mo><mn>c</mn></mrow></msub></mtd><mtd><mtext>…</mtext></mtd><mtd><msub><mrow>a</mrow><mrow><mn>r</mn><mo>,</mo><mn>j</mn></mrow></msub></mtd></mtr><mtr><mtd><mtext>⋮</mtext></mtd><mtd><mi></mi></mtd><mtd><mtext>⋮</mtext></mtd></mtr><mtr><mtd><msub><mrow>a</mrow><mrow><mn>i</mn><mo>,</mo><mn>c</mn></mrow></msub></mtd><mtd><mtext>…</mtext></mtd><mtd><msub><mrow>a</mrow><mrow><mn>i</mn><mo>,</mo><mn>j</mn></mrow></msub></mtd></mtr></mtable></menclose></menclose></mrow>"
];
global.someDetails = someDetails;

Expression.Details.add({
  type: "inverse-2x2",
  i18n: "",
  minRows: 2,
  maxRows: 2,
  priority: 1,
  callback: function (matrix) {
    var html = "";
    html += "<div>";
    html += i18n.inverse2x2;
    html += " ";
    html += Expression.p("A^-1={{a, b}, {c, d}}^-1=1/determinant(A)*{{C_11, C_21}, {C_21, C_22}}=1/(a*d-b*c)*{{d, -b}, {-c, a}}");
    html += Expression.__m__("[*](" + i18n.inverse2x2Link + ")");
    html += "</div>";
    var r = RPN.ONE.divide(matrix.e(0, 0).multiply(matrix.e(1, 1)).subtract(matrix.e(0, 1).multiply(matrix.e(1, 0))));
    // TODO: highlight (?)
    return html + Expression.p("A^-1=1/(a*d-b*c)*{{d, n}, {m, a}}=t", {
      A: new Expression.Matrix(matrix),
      a: matrix.e(0, 0),
      b: matrix.e(0, 1),
      c: matrix.e(1, 0),
      d: matrix.e(1, 1),
      n: matrix.e(0, 1).negate(),
      m: matrix.e(1, 0).negate(),
      r: r,
      t: new Expression.Matrix(matrix.inverse())
    });
  }
});

Expression.Details.add({
  type: "determinant-2x2",
  i18n: "",
  minRows: 2,
  maxRows: 2,
  priority: 1,
  callback: function (matrix) {
    var html = "<div>" + someDetails[0].replace(/\$\{link\}/g, i18n.determinant2x2Link) + "</div>";
    var determinantResult = matrix.e(0, 0).multiply(matrix.e(1, 1)).subtract(matrix.e(0, 1).multiply(matrix.e(1, 0)));
    return html + Expression.p("determinant(A)=a*d-b*c=r", {
      A: new Expression.Matrix(matrix),
      a: matrix.e(0, 0),
      b: matrix.e(0, 1),
      c: matrix.e(1, 0),
      d: matrix.e(1, 1),
      r: determinantResult
    });
  }
});

Utils.on(document, "click", ".change-button", function () {
  hit("change-button");
  var s1 = this.getAttribute("data-for1");
  var s2 = this.getAttribute("data-for2");
  var table1 = MatrixTables.get(s1);
  var table2 = MatrixTables.get(s2);
  var t1 = table1.getState();
  var t2 = table2.getState();
  table1.insert(t2.inputValues, t2.textareaValue, t2.rows, t2.cols, t2.textareaStyleWidth, t2.textareaStyleHeight, t2.mode);
  table2.insert(t1.inputValues, t1.textareaValue, t1.rows, t1.cols, t1.textareaStyleWidth, t1.textareaStyleHeight, t1.mode);
});

// ---------------------------------------- cookies -----------------------------------------------



Utils.on(document, "click", ".clear-table", function (event) {
  hit("clear-table");
  var s = this.getAttribute("data-for");
  var mt = MatrixTables.get(s);
  mt.clearTable();
});

Utils.on(document, "click", ".resize-table", function (event) {
  hit("resize-table");
  var s = this.getAttribute("data-for");
  var inc = this.getAttribute("data-inc");
  var n = Number.parseInt(inc, 10);
  var mt = MatrixTables.get(s);
  mt.insert(mt.getRawInput("cells"), mt.getRawInput(""), mt.rows + n, mt.cols + n);
});

Utils.on(document, "click", ".find-e-vectors", handleError(function (event) {
  hit("find-e-vectors");
  var s = this.getAttribute("data-for");
  findEVectors(MatrixTables.get(s).getMatrix());
}));

Utils.on(document, "click", ".input-example", handleError(function (event) {
  hit("input-example");
//super hack
  event.preventDefault();
  var s = this.parentNode.parentNode.querySelector(".input-example-code").textContent;
  s = s.replace(/\x20+/g, " ").replace(/^\s+|\s+$/g, "").replace(/\n\x20/g, "\n");
  if (MatrixTables.get("A").mode === "cells") {
    document.querySelector("button.swap-mode").click();
  }
  MatrixTables.get("A").textarea.value = s;
  MatrixTables.get("A").container.scrollIntoViewIfNeeded(false);
}));

var appendScript = function (src) {
  var script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
};

Utils.initialize(document, ".hypercomments-details-summary-container", function (element) {
  var details = element.querySelector("details");

  var showComments = function () {
    if (window._hcwp) {
      return;
    }
    document.querySelector(".hc-link").removeAttribute("hidden");
    window._hcwp = window._hcwp || [];
    window._hcwp.push({widget: "Stream", widget_id: 8317});
    var lang = document.documentElement.lang.slice(0, 2);
    window.HC_LOAD_INIT = true;
    var src = "https://w.hypercomments.com/widget/hc/8317/" + lang + "/widget.js";
    appendScript(src);
  };

  details.addEventListener("toggle", function (event) {
    showComments();
  }, false);

  //var match = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/.exec(navigator.userAgent);
  //var isMobile = match != undefined;
  var isMobile = true; // too big images

  var checkHash = function (e) {
    if (window.location.protocol !== "file:") {
      var hash = decodeLocationHash(window.location.hash.slice(1));
      if (!isMobile || hash.indexOf("hcm") !== -1 || hash.indexOf("hypercomments_widget") !== -1) {
        if (details.getAttribute("open") == undefined) {
          details.querySelector("summary").click();
        }
        showComments();
      }
    } else {
      details.setAttribute("hidden", "hidden");
    }
  };
  checkHash(undefined);
  window.addEventListener("hashchange", checkHash, false);

});
Utils.initialize(document, ".twitter-share-button", function (element) {
  element.href += "&text=" + encodeURIComponent(document.title);
});

// detfindDet

Utils.initialize(document, ".insert-table", function (element) {
//!TODO: remove
  document.body.classList.add("math");

  var id = element.getAttribute("data-id");
  var sizes = element.getAttribute("data-sizes") || "";
  var initialRows = 3;
  var initialCols = 3;
  var match = (/^(\d+)x(\d+)$/).exec(sizes);
  if (match != undefined) {
    initialRows = Number.parseInt(match[1], 10);
    initialCols = Number.parseInt(match[2], 10);
  }
  var mtype = element.getAttribute("data-mode") || "";

  var state = undefined;
  var stateKey1 = id + "1";
  if (window.location.protocol !== "file:" && window.history.replaceState != undefined) {
    var historyState = window.history.state;
    if (historyState != undefined && historyState[stateKey1] != undefined) {
      state = historyState[stateKey1];
    }
  }

  var x = new MatrixTable(id, initialRows, initialCols, mtype === "P" ? 3 : (mtype === "X" ? 1 : 0), element, state);

  if (window.location.protocol !== "file:" && window.history.replaceState != undefined) {
    window.addEventListener("pagehide", function (event) {
      var historyState = Object.assign({}, window.history.state);
      historyState[stateKey1] = x.getState();
      window.history.replaceState(historyState, document.title, window.location.href);
    }, false);
  }

});

Utils.initialize(document, ".expression", function (element) {
  element.addEventListener("click", onExpressionClick, false);
  var expression = element.getAttribute("data-expression");
  if (expression == undefined) {
    var input = element.previousElementSibling;
    if (input.value === input.getAttribute("value")) { // autofill
      input.disabled = true;
      keyStorage.getItem("expression", "", function (value) {
        input.disabled = false;
        if (value !== "") {
          input.value = value;
        }
      });
    }
  }
});

function encodeLocationHash(hash) {
  // comments systems, other software with "auto-link" feature may work not good with some characters ...
  return encodeURIComponent(hash).replace(/\!/g, "%21")
                                 .replace(/'/g, "%27")
                                 .replace(/\(/g, "%28")
                                 .replace(/\)/g, "%29")
                                 .replace(/\*/g, "%2A")
                                 .replace(/\./g, "%2E")
                                 .replace(/~/g, "%7E")
                                 .replace(/%2C/g, ",");
                                                           
}

function decodeLocationHash(hash) {
  return decodeURIComponent(hash);
}

var lastHash = "";

function onHashChange(event) {
  var hash = decodeLocationHash(window.location.hash.slice(1));
  if (lastHash === hash) {
    return;
  }
  lastHash = hash;

  //TODO: (?)
  if (/^hcm\=\d+$/.test(hash)) { // || document.getElementById(hash) != undefined
    return;
  }

  //TODO: FIX!!!
  try {
    //!TODO: Details?
    var details = [];
    var listener = function (e) {
      details.push({type: e.type, matrix: e.data.matrix.toString(), second: e.second === undefined ? undefined : e.second.matrix.toString()});
    };
    Expression.callback = listener;
    var expression = RPN(hash, new RPN.Context({
      get: function (id) {
        return undefined;
      }
    }));
    var result = getResultAndHTML(expression, undefined, expression.simplify());
    var resultHTML = result.html;
    var x = result.result;
    var expressionString = expression.toString();

    //...
    var previousEntryIndex = actHistory.length - 1;
    while (previousEntryIndex >= 0 && actHistory[previousEntryIndex] === undefined) {
      previousEntryIndex -= 1;
    }
    // TODO: FIX!!! It is wrong to compare HTML here, as "Utils.id()" generates different HTML each time
    if (previousEntryIndex === -1 || (actHistory[previousEntryIndex][0] !== resultHTML && (actHistory[previousEntryIndex].length < 4 || actHistory[previousEntryIndex][3] !== expressionString))) {
      if (resultHTML !== undefined) {
        zInsAct(resultHTML, x instanceof Matrix ? x : (x instanceof Expression.Matrix || (x instanceof NonSimplifiedExpression && x.e instanceof Expression.Matrix) ? x.matrix : ""), details, expressionString, false);
      }
    }
    Expression.callback = undefined;
  } catch (error) {
    Expression.callback = undefined;
    if (error instanceof RangeError && error.message.indexOf("UserError") === 0) {
      //ignore
    } else {
      throw error;
    }
  }
}

Utils.initialize(document, ".from-cookie", function (element) {
keyStorage.getItem("resdiv", undefined, function (storedActHistory) {

  try {
    // old data ?
    storedActHistory = storedActHistory != undefined ? JSON.parse(storedActHistory) : undefined;  
  } catch (e) {
    window.setTimeout(function () {
      throw e;
    }, 0);
  }
  var exampleAttribute = element.getAttribute("data-example");
  var needsExample = exampleAttribute != undefined;
  if ((storedActHistory instanceof Array) && storedActHistory.length !== 0) {
    var i = -1;
    while (++i < storedActHistory.length) {
      zInsAct(storedActHistory[i][0],
              storedActHistory[i][1],
              storedActHistory[i].length > 2 ? storedActHistory[i][2] : undefined,
              storedActHistory[i].length > 3 ? storedActHistory[i][3] : undefined,
              true);
      needsExample = false;
    }
  }
  window.addEventListener("hashchange", onHashChange, false);
  onHashChange(undefined);
  needsExample = needsExample && actHistory.length === 0;
  if (needsExample) {
    var m1 = Matrix.Random(3, 3);
    var m2 = Matrix.Random(3, 3);
    var mm = m1.add(m2);
    // TODO: more complex example (multiplication) with details
    zInsAct(printSomething(m1) + "<mo>+</mo>" + printSomething(m2) + "<mo>=</mo>" + printSomething(mm), mm, undefined, undefined, true);
  }
});

  var examples = document.getElementById("examples");
  if (examples != undefined) {
    var list = examples.querySelectorAll("a");
    for (var i = 0; i < list.length; i += 1) {
      var s = list[i].textContent;
      list[i].innerHTML = Expression.p(s, undefined, {useMatrixContainer: false});
    }
  }
  
});

// --------------------------------------------- end ----------------------------------------------

// ---------------------------------------- determinant -----------------------------------------------

function Myelem(m, a, z) {
  this.m = m;
  this.a = a;// Fraction
  this.z = z;// number
}

function getDeterminant(m, k, r, z, koef) {
  if (m.cols() === 1) {
    return m.e(0, 0);
  }

  var o = RPN.ZERO;

  function complement(elem, r, c) {
      return m.e(r >= i ? r + 1 : r , c >= k ? c + 1 : c );
  }

  var i = -1;
  while (++i < m.cols()) {

    // complement matrix for element e(i, k)
    var mx = Matrix.Zero(m.rows() - 1, m.cols() - 1).map(complement);

    var kk = koef.multiply(m.e(i, k));
    if (Math.trunc((i + k) / 2) * 2 !== i + k) {
      kk = kk.negate();
    }
    r.push(new Myelem(mx, kk, z));
    o = o.add(m.e(i, k).multiply(getDeterminant(mx, 0, r, z + 1, kk)));
  }
  return o;
}

function setResult(html) {
  var resdiv = document.getElementById("resdiv");
  resdiv.innerHTML = html;
  Utils.check(resdiv);
  resdiv.scrollIntoViewIfNeeded(false);
}

function detfindDet(m, byRow, num) {
    var r = [];
    var k = Number.parseInt(num, 10) - 1;

    //!
    if (!m.isSquare()) {
      throw new RangeError("NonSquareMatrixException");
    }
    if (k !== Math.trunc(k) || k >= m.rows() || k < 0) { // m.isSquare() === true
      throw new RangeError("IntegerInputError" + ":" + num);
    }
    //!
    
    r.push(new Myelem(m, RPN.ONE, 0));
    if (byRow) {
      // expansion by row k
      m = m.transpose();
      getDeterminant(m, k, r, 1, RPN.ONE);
      var l = -1;
      while (++l < r.length) {
        r[l].m = r[l].m.transpose();
      }
      
    } else {
      getDeterminant(m, k, r, 1, RPN.ONE);// expansion by column k
    }
    //TODO: merge with printSomething ?
    var html = "";
    var z = r[0].m.cols() - 1;
    var i = -1;
    while (++i < z) {
      var j = -1;
      var e = undefined;
      while (++j < r.length) {
        if (r[j].z === i && !r[j].a.equals(RPN.ZERO)) {
          var current = new Expression.Multiplication(r[j].a, new Expression.Determinant(new Expression.Matrix(r[j].m)));
          e = e === undefined ? current : new Expression.Addition(e, current);
        }
      }
      if (e !== undefined) { // all zeros
        html += printSomething(e);
        html += "<mo>=</mo>";
      }
    }
    html += printSomething(m.determinant());
    setResult(html);
}

Utils.on(document, "click", ".detfind-det", handleError(function (event) {
  hit("detfind-det");
  var byRow = this.getAttribute("data-by-row") === "true";
  detfindDet(MatrixTables.get("A").getMatrix(), byRow, document.querySelector(byRow ? "#rNumb" : "#cNumb").value);
}));

Utils.on(document, "click", ".get-zero", handleError(function (event) {
  hit("get-zero");
  var atRow = this.getAttribute("data-at-row") === "true";
  getZero(MatrixTables.get("A").getMatrix(), atRow ? 1 : 0, document.querySelector(atRow ? "#rNumb2" : "#cNumb2").value);
}));

var determinant3x3 = function (matrix, text) {
  if (matrix.cols() !== 3 || matrix.rows() !== 3) {
    Dialog.alert(i18n.theRuleOfSarrusCanBeUsedOnlyWith3x3Matrices);
  } else {
//TODO: replace
    var matrixId = Utils.id();
    var cellId = function (i, j) {
      return matrixId + "_" + i.toString() + "_" + j.toString();
    };
    var html = "";
    html += "<div>" + text + "</div>";
    html += printSomething(new Expression.Determinant(new Expression.Matrix(matrix)), {
      cellTransform: function (i, j, s) {
        return "<mtd id=\"" + cellId(i, j) + "\">";
      }
    });
    html += "<mo>=</mo>";
    // TODO: clickable highlight with initially selected group
    var z = [
      "a_11*a_22*a_33",
      "a_12*a_23*a_31",
      "a_13*a_21*a_32",
      "a_31*a_22*a_13",
      "a_32*a_23*a_11",
      "a_33*a_21*a_12"
    ];
    var context = new RPN.Context({
      get: function (id) {
        return matrix.e(Number.parseInt(id.slice(2, 3), 10) - 1, Number.parseInt(id.slice(3, 4), 10) - 1);
      }
    });
    var determinant = undefined;
    for (var i = 0; i < z.length; i += 1) {
      var e = RPN(z[i], context);
      if (i !== 0) {
        var sign = i < 3 ? "+" : "&minus;";
        html += "<mo>" + sign + "</mo>";
      }
      var highlight = z[i].replace(/a_(\d)(\d)/g, function (x, si, sj) {
        var i = Number.parseInt(si, 10) - 1;
        var j = Number.parseInt(sj, 10) - 1;
        return "#" + cellId(i, j) + ",";
      }).slice(0, -1);
      html += "<a tabindex=\"0\" id=\"" + (matrixId + "_x" + i.toString()) + "\">" + printSomething(e) + "</a>";
      html += "<a class=\"a-highlight\" data-for=\"" + (matrixId + "_x" + i.toString()) + "\" data-highlight=\"" + highlight + "\"></a>";
      determinant = i === 0 ? e : (i < 3 ? determinant.add(e) : determinant.subtract(e));
    }

    html += "<mo>=</mo>";
    html += printSomething(determinant.simplify());
    return html;
  }
  return undefined;
};

//TODO: fix - i18n.usingSarrusRule
Expression.Details.add({
  type: "determinant-Sarrus",
  i18n: i18n.ruleOfSarrus,
  minRows: 3,
  maxRows: 3,
  priority: 3,
  callback: function (matrix) {
    return determinant3x3(matrix, someDetails[2].replace(/\$\{link\}/, i18n.ruleOfSarrusLink));
  }
});

Expression.Details.add({
  type: "determinant-Triangle",
  i18n: i18n.ruleOfTriangle,
  minRows: 3,
  maxRows: 3,
  priority: 4,
  callback: function (matrix) {
    return determinant3x3(matrix, someDetails[1].replace(/\$\{link\}/, i18n.ruleOfTriangleLink));
  }
});

function mgetZero(m, k) { // m == n ; in a column k -- find in k-column non-zero element and ... subtract
    var r = [];
    var i = 0;
    while (i < m.rows() && m.e(i, k).equals(RPN.ZERO)) {
      i += 1;
    }
    if (i < m.rows()) {
      var j = -1;
      while (++j < m.rows()) {
        if (j !== i) {
          m = m.rowReduce(j, i, k);
          r.push(m);
        }
      }
    }
    return r;// r?
}

function getZero(m, b, a) { // b - by row
    var dets = undefined;
    var k = Number.parseInt(a, 10) - 1;
    //!
    if (!m.isSquare()) {
      throw new RangeError("NonSquareMatrixException");
    }
    if (k !== Math.trunc(k) || k >= m.rows() || k < 0) { // m.isSquare() === true
      throw new RangeError("IntegerInputError" + ":" + a);
    }
    //!

    var html = printSomething(new Expression.Determinant(new Expression.Matrix(m))) + "<mo>=</mo>";

    dets = mgetZero(b ? m.transpose() : m, k);
   
    var i = -1;
    while (++i < dets.length) {
      html += (i === 0 ? "" : "<mo>=</mo>") + printSomething(new Expression.Determinant(new Expression.Matrix(b ? dets[i].transpose() : dets[i])));
    }
    html += "<mo>=</mo>";
    html += printSomething(m.determinant());
    setResult(html);
}
// --------------------------------------------- end ----------------------------------------------
// ---------------------------------------- sle -----------------------------------------------

Matrix.trimRight = function (x) {
  var ZERO = RPN.ZERO;
  var lastColumn = 0;
  x.map(function (e, i, j) {
    if (lastColumn < j && !e.equals(ZERO)) {
      lastColumn = j;
    }
    return e;
  });
  return x.slice(0, x.rows(), 0, lastColumn + 1);
};

function testSLECompatibility(fullMatrix) {
  var st = "<h4>" + i18n.textAnalyseCompatibility + "</h4>";
  //TODO: fix i18n
  st += i18n.analyseCompatibilityIntroduction !== undefined ? "<p>" + i18n.analyseCompatibilityIntroduction + "</p>" : "";
  var m = Matrix.trimRight(fullMatrix.slice(0, fullMatrix.rows(), 0, fullMatrix.cols() - 1));
  var b = fullMatrix.slice(0, fullMatrix.rows(), fullMatrix.cols() - 1, fullMatrix.cols());
  var augmented = m.augment(b);
  var mRank = m.rank();
  st += "<div>";
  var augmentedRank = augmented.rank();
  st += "</div>";
  st += "<div>";
  st += i18n.rankDenotation + printSomething(augmented) + "<mo>=</mo>" + augmentedRank;
  st += "</div>";
  st += "<div>";
  st += i18n.rankDenotation + printSomething(m) + "<mo>=</mo>" + mRank;
  st += "</div>";
  st += createDetailsSummary([{type: "rank", matrix: augmented.toString(), second: undefined}]);
  st += "<div>";
  if (mRank === augmentedRank) {
    if (m.cols() === mRank) {
      st += i18n.textAn1a;
    } else {
      st += i18n.textAn1b;
    }
  } else {
    st += i18n.textAn2;
  }
  st += "</div>";
  return st;
}

  //TODO: move
  var outSystem = function (matrix, variableNames) {
    return printSomething(matrix, {
      variableNames: variableNames,
      useBraces: ["{", " "]
    });
  };
  //! TODO: (!)

function solveUsingCramersRule(variableNames, fullMatrix) {
  // TODO: fix
  //!hack
  if (variableNames === undefined) {
    variableNames = {
      get: function (i) {
        return "x_" + (i + 1);
      }
    };
  }

  var m = Matrix.trimRight(fullMatrix.slice(0, fullMatrix.rows(), 0, fullMatrix.cols() - 1));
  var b = fullMatrix.slice(0, fullMatrix.rows(), fullMatrix.cols() - 1, fullMatrix.cols());

  var d = [];
  var i = 0;
  var mstr = "";
  if (!m.isSquare()) {
    Dialog.alert(i18n.text01);
    return undefined;
  }
  var D0 = m.determinant();
  mstr = "<h4>" + Expression.__m__(i18n.solutionByRuleOfCramer) + "</h4>";
  mstr += "<div>";
  mstr += outSystem(fullMatrix, variableNames);
  mstr += "</div>";
  mstr += "<div>";
  mstr += "<mi>&Delta;</mi>";
  mstr += "<mo>=</mo>" + printSomething(new Expression.Determinant(new Expression.Matrix(m)));
  mstr += "<mo>=</mo>" + printSomething(D0);
  mstr += "</div>";
  if (D0.equals(RPN.ZERO)) {
    //TODO: fix text
    mstr += i18n.text02;
    return mstr;
  }
  
  function detMatrixI(elem, row, col) {
    return col === i ? b.e(row, 0) : elem;
  }
  
  i = -1;
  while (++i < m.cols()) {
    mstr += "<div>";
    var m1 = m.map(detMatrixI);
    d[i] = m1.determinant();
    mstr += "<msub><mrow><mi>&Delta;</mi></mrow><mrow><mn>" + (i + 1) + "</mn></mrow></msub><mo>=</mo>" + printSomething(new Expression.Determinant(new Expression.Matrix(m1))) + "<mo>=</mo>" + printSomething(d[i]) + "; ";
    mstr += "</div>";
  }
  i = -1;
  while (++i < m.cols()) {
    mstr += "<div>";
    mstr += new Expression.Symbol(variableNames.get(i)).toMathML();
    mstr += "<mo>=</mo><msub><mrow><mi>&Delta;</mi></mrow><mrow><mn>" + (i + 1) + "</mn></mrow></msub><mo>/</mo><mi>&Delta;</mi><mo>=</mo>" + printSomething(d[i].divide(D0));
    mstr += "</div>";
  }

  mstr += "<div>" + i18n.textAnswer + "</div>";
  i = -1;
  while (++i < m.cols()) {
    mstr += "<div>" + new Expression.Symbol(variableNames.get(i)).toMathML() + "<mo>=</mo>" + printSomething(d[i].divide(D0)) + "</div>";
  }
  return mstr;
}

// SLE solution with inverse matrix
function solveUsingInverseMatrixMethod(variableNames, fullMatrix) {
  //TODO: use variableNames (?)

  var m = Matrix.trimRight(fullMatrix.slice(0, fullMatrix.rows(), 0, fullMatrix.cols() - 1));
  var b = fullMatrix.slice(0, fullMatrix.rows(), fullMatrix.cols() - 1, fullMatrix.cols());

    var mstr = "";
    var c = undefined;
    if (!m.isSquare()) {
        Dialog.alert(i18n.text05);
        return undefined;
    }
    try {
      c = m.inverse();
    } catch (e) {
      if (e instanceof RangeError && e.message.indexOf("SingularMatrixException") === 0) {
        //mstr = i18n.text06;
      } else {
        throw e;
      }
    }
  mstr += "<h4>" + Expression.__m__(i18n.solutionByInverseMatrixMethod) + "</h4>";
  mstr += "<div>";
  mstr += "<mi>A</mi><mo>&times;</mo><mi>X</mi><mo>=</mo><mi>B</mi>";
  mstr += "</div>";
  mstr += "<div>";
  mstr += "<mi>A</mi><mo>=</mo>" + printSomething(m);
  mstr += "</div>";
  mstr += "<div>";
  mstr += "<mi>B</mi><mo>=</mo>" + printSomething(b);
  mstr += "</div>";
  if (c !== undefined) {
    mstr += "<div>";
    mstr += "<msup><mrow><mi>A</mi></mrow><mrow><mn>-1</mn></mrow></msup><mo>=</mo>" + printSomething(c);
    mstr += "</div>";
    mstr += createDetailsSummary([{type: "inverse", matrix: m.toString(), second: undefined}]);
    mstr += "<mi>X</mi><mo>=</mo><msup><mrow><mi>A</mi></mrow><mrow><mn>-1</mn></mrow></msup><mo>&times;<mi>B</mi><mo>=</mo>" + printSomething(c) + printSomething(b) + "<mo>=</mo>" + printSomething(c.multiply(b));
  } else {
    mstr += i18n.text06;
    mstr += createDetailsSummary([{type: "inverse", matrix: m.toString(), second: undefined}]);
    mstr += "<div class=\"for-details\"></div>";
  }
  return mstr;
}

//----------Gauss
// getting row echelon form without columns swapping

Utils.id = function () {
  return "_" + (Math.random() + 1).toString().slice(2);
};

function rowReduceChangeToHTML(change, printOptions, containerId, k) {
  var multiplier = change.type === "reduce" ? change.oldMatrix.e(change.targetRow, change.pivotColumn).divide(change.oldMatrix.e(change.pivotRow, change.pivotColumn)) : undefined;
  var tooltip = ((change.type === "swap-negate" ? i18n.eliminationDetails.rowSwapNegate : "") +
                 (change.type === "swap" ? i18n.eliminationDetails.rowSwap : "") +
                 (change.type === "divide" ? i18n.eliminationDetails.rowDivision.replace(/\$\{B\}/g, printSomething(change.oldMatrix.e(change.pivotRow, change.pivotColumn), printOptions)) : "") +
                 (change.type === "reduce" ? i18n.eliminationDetails.rowSubtraction.replace(/\$\{Q\}/g, (Expression.isNegative(multiplier) ? "<mfenced open=\"(\" close=\")\"><mrow>${B}</mrow></mfenced>" : "<mrow>${B}</mrow>").replace(/\$\{B\}/g, printSomething(multiplier, printOptions))) : ""))
                  .replace(/\$\{s\}/g, (change.targetRow + 1).toString())
                  .replace(/\$\{c\}/g, (change.pivotRow + 1).toString());
  var questionId = Utils.id();
  var tooltipId = Utils.id();

  var text = "";
  var cellId = function (containerId, k, i, j) {
    return [containerId, k, i, j].join("-");
  };
  k += 1; //!
  if (change.type === "reduce") {
    var targetRow = change.targetRow;
    for (var i = 0; i < change.oldMatrix.cols(); i += 1) {
      var divId = Utils.id();
      var highlight = "<a class=\"a-highlight\" data-for=\"" + cellId(containerId, k, targetRow, i) + "\" data-highlight=\"" +
                        "#" + cellId(containerId, k - 1, change.pivotRow, change.pivotColumn) + ", " +
                        "#" + cellId(containerId, k - 1, targetRow, i) + ", " +
                        "#" + cellId(containerId, k - 1, targetRow, change.pivotColumn) + ", " +
                        "#" + cellId(containerId, k - 1, change.pivotRow, i) + ", " +
                        "#" + cellId(containerId, k, targetRow, i) + "\"></a>";
      var tooltips = "<a class=\"a-tooltip\" data-for=\"" + cellId(containerId, k, targetRow, i) + "\" data-tooltip=\"" + divId + "\"></a>";
      text += "<div class=\"mathmlcontainer focusable\" tabindex=\"0\" id=\"" + divId + "\">" +
              Expression.p("a_" + (targetRow + 1).toString() + (i + 1).toString() + "=(b-(c/a)*d)=r", {
                a: change.oldMatrix.e(change.pivotRow, change.pivotColumn),
                b: change.oldMatrix.e(targetRow, i),
                c: change.oldMatrix.e(targetRow, change.pivotColumn),
                d: change.oldMatrix.e(change.pivotRow, i),
                r: change.newMatrix.e(targetRow, i)
              }) +
              "</div>" +
              highlight +
              tooltips;
    }
  }
  
  return "<span class=\"nowrap\">" +
         printSomething(change.oldMatrix, {
           columnlines: printOptions.columnlines,
           cellTransform: function (i, j, s) {
             return "<mtd tabindex=\"0\" id=\"" + cellId(containerId, k - 1, i, j) + "\" " + (i === change.pivotRow && j === change.pivotColumn ? "class=\"pivot\"" : "") + ">";
           }
         }) +
         "  <div class=\"arrow-with-label\" data-custom-paint=\"arrow-with-label\" data-type=\"" + change.type + "\" data-start=\"" + change.pivotRow + "\" data-end=\"" + change.targetRow + "\">" +
         "    <div class=\"arrow\">" +
         (change.type === "swap" || change.type === "swap-negate" || change.pivotRow < change.targetRow ? "      <div class=\"arrow-head-bottom\"></div>" : "") +
         (change.type === "swap" || change.type === "swap-negate" || change.pivotRow > change.targetRow ? "      <div class=\"arrow-head-top\"></div>" : "") +
         (change.type !== "divide" ? "      <div class=\"arrow-line\"></div>" : "") +
         "    </div>" +
         "    <div class=\"label\">" +
//     html += "<mfenced open=\"(\" close=\")\">" + printSomething(polynomToExpression(z.a, variableSymbols)) + "</mfenced>";         
         (change.type === "swap" ? "" : (change.type === "swap-negate" ? "" : (change.type === "divide" ? "<mo>&times;</mo>" + "<mfenced open=\"(\" close=\")\">" + printSomething(RPN.ONE.divide(change.oldMatrix.e(change.targetRow, change.pivotColumn))) + "</mfenced>" : "<mo>&times;</mo>" + "<mfenced open=\"(\" close=\")\">" + printSomething(multiplier.negate()))) + "</mfenced>") +
         "    </div>" +
         "  </div>" +
         "</span>" +
         "<span class=\"relative\"><munder><mrow><mo>~</mo></mrow><mrow>" +
         ((change.type === "swap-negate" ? "${c}<mo>&harr;</mo><mrow><mo>&minus;</mo>${s}</mrow>" : "") +
          (change.type === "swap" ? "${c}<mo>&harr;</mo>${s}" : "") +
          (change.type === "divide" ? "${s}<mo>/</mo><mfenced open=\"(\" close=\")\"><mrow>${B}</mrow></mfenced><mo>&rarr;</mo>${s}".replace(/\$\{B\}/g, printSomething(change.oldMatrix.e(change.pivotRow, change.pivotColumn), printOptions)) : "") +
          (change.type === "reduce" ? "${s}<mo>&minus;</mo>${Q}<mo>&times;</mo>${c}<mo>&rarr;</mo>${s}".replace(/\$\{Q\}/g, (Expression.isNegative(multiplier) ? "<mfenced open=\"(\" close=\")\"><mrow>${B}</mrow></mfenced>" : "<mrow>${B}</mrow>").replace(/\$\{B\}/g, printSomething(multiplier, printOptions))) : ""))
            .replace(/\$\{s\}/g, getMatrixRowDenotation(change.targetRow + 1))
            .replace(/\$\{c\}/g, getMatrixRowDenotation(change.pivotRow + 1)) +
         "</mrow></munder>" + (tooltip !== "" ? "<a class=\"question-icon\" id=\"" + questionId + "\">?</a><a class=\"a-tooltip\" data-for=\"" + questionId + "\" data-tooltip=\"" + tooltipId + "\"></a><div hidden id=\"" + tooltipId + "\">" + tooltip + "</div>" : "") + "<span hidden>" + text + "</span>" + "</span>";
}

var arrowWithLabelInitialize = function (arrowWithLabel) {
  var arrow = arrowWithLabel.querySelector(".arrow");
  var table = arrowWithLabel.previousElementSibling.querySelector("mtable");
  var start = Number.parseInt(arrowWithLabel.getAttribute("data-start"), 10);
  var end = Number.parseInt(arrowWithLabel.getAttribute("data-end"), 10);
  var n = 0;
  var row = table.firstElementChild;
  var startRow = undefined;
  var endRow = undefined;
  while (row != undefined) {
    if (n === start) {
      startRow = row;
    }
    if (n === end) {
      endRow = row;
    }
    n += 1;
    row = row.nextElementSibling;
  }
  var startRowRect = startRow.getBoundingClientRect();
  var endRowRect = endRow.getBoundingClientRect();
  var tableRect = table.getBoundingClientRect();
  if (end < start) {
    var tmp = endRowRect;
    endRowRect = startRowRect;
    startRowRect = tmp;
  }
  var arrowHeight = ((endRowRect.top + endRowRect.bottom) / 2 - (startRowRect.top + startRowRect.bottom) / 2);
  var arrowWithLabelVerticalAlign = ((tableRect.top + tableRect.bottom) / 2 - (startRowRect.top + endRowRect.bottom) / 2);
  window.setTimeout(function () {
    arrow.style.height = arrowHeight.toString() + "px";
    arrow.style.top = "50%";
    arrow.style.marginTop = (-arrowHeight / 2).toString() + "px";
    arrowWithLabel.style.verticalAlign = arrowWithLabelVerticalAlign.toString() + "px";
  }, 0);
};

//Utils.initialize(document, ".arrow-with-label", arrowWithLabelInitialize);
document.addEventListener("custom-paint", function (event) {
  if (event.target.getAttribute("data-custom-paint") === "arrow-with-label") {
    arrowWithLabelInitialize(event.target);
  }
}, false);

var rowReductionGaussJordanMontante = function (matrix, toRowEchelon, rowReduceChangeToHTML, printOptions) {
  var check = function (change) {
    var p = change.oldMatrix;
    var from = change.targetRow !== -1 ? change.targetRow : 0;
    var to = change.targetRow !== -1 ? change.targetRow + 1 : p.rows();
    for (var i = from; i < to; i += 1) {
      if (!p.e(i, p.cols() - 1).equals(RPN.ZERO)) {
        var j = 0;
        while (j < p.cols() && p.e(i, j).equals(RPN.ZERO)) {
          j += 1;
        }
        if (j === p.cols() - 1) {
          return false;
        }
      }
    }
    return true;
  };
  var html = "";
  var rowEchelonMatrix = matrix;
  var containerId = Utils.id();
  var k = 0;
  var stopped = false;
  toRowEchelon(matrix, function (change) {
    stopped = stopped || !check(change);
    if (!stopped) {
      html += rowReduceChangeToHTML(change, printOptions, containerId, k);
      k += 1;
      rowEchelonMatrix = change.newMatrix;
    }
  });
  // TODO: set tabindex="0" only for modified cells
  html += printSomething(rowEchelonMatrix, {
    columnlines: printOptions.columnlines,
    cellTransform: function (i, j, s) {
      return "<mtd tabindex=\"0\" id=\"" + [containerId, k, i, j].join("-") + "\">";
    }
  });
  return {html: html, rowEchelonMatrix: rowEchelonMatrix};
};

function solveByGauss(variableNames, fullMatrix, options) {
  // (?) TODO: allow users to specify "free" variables

  var moreText = options.moreText;
  var eigenvectors = options.eigenvectors;

  var OSLU = 1;
  var i = 0;
  var j = 0;
  var mstr = "";

  var m =fullMatrix.slice(0, fullMatrix.rows(), 0, fullMatrix.cols() - 1);
  if (eigenvectors === undefined && variableNames === undefined) {
    m = Matrix.trimRight(m);
  }
  var b = fullMatrix.slice(0, fullMatrix.rows(), fullMatrix.cols() - 1, fullMatrix.cols());

  //!hack
  if (variableNames === undefined) {
    variableNames = {
      get: function (i) {
        return "x_" + (i + 1);
      }
    };
  }

  //! diapedesis zeros !!!
  b = Matrix.Zero(m.rows(), 1).map(function (element, row, col) {
    return row < b.rows() && col < b.cols() ? b.e(row, col) : 0;
  });

  i = -1;
  while (++i < b.rows() && OSLU === 1) {
    if (!b.e(i, 0).equals(RPN.ZERO)) {
      OSLU = 0;
    }
  }

  var augmented = m.augment(b);
  mstr = "";
  if (moreText) {
    mstr += "<h4>" + Expression.__m__(options.method.i18n) + "</h4>";
    //mstr += "<div>" + i18n.text511 + "</div>";
    mstr += "<div>" + (i18n.text512 || "") + "</div>";
  }

  var ms = rowReductionGaussJordanMontante(augmented, options.method.toRowEchelon, options.method.rowReduceChangeToHTML, {columnlines: -1});
  var k = -1;
  mstr += ms.html;

  m = ms.rowEchelonMatrix;

  var systemId = Utils.id();
  mstr += "<div><a name=\"" + systemId + "\"></a><table><tr><td>" + outSystem(m, variableNames) + "</td><td><a href=\"#" + systemId + "\">(1)</a></td></tr></table></div>";

  // 1. Throwing of null strings - they will be below, but checking: if we find a zero, which at the end has a non-zero, then there are no solutions!;
  var noSolutions = false;

  i = -1;
  while (++i < m.rows()) {
    j = 0;
    while (j < m.cols() && m.e(i, j).equals(RPN.ZERO)) {
      j += 1;
    }
    if (j === m.cols() - 1) {
      noSolutions = true;
    }
  }

  // vector of coefficients of free variables (0-index - constant, 1-index - c_1, 2-index - c_2, ... )
  var createVector = function (size) {
    var vector = [];
    var n = -1;
    while (++n < size) {
      vector[n] = RPN.ZERO;
    }
    return vector;
  };

  if (noSolutions) {
    mstr += "<div>" + i18n.text52 + "</div>";
  } else {
    var freeVariablesCount = 0;
    // ((1/4,1,4,-2,...), ()) // 1/4+c1+c2-2c3
    // vector, 0-index - constant, 1-index - coefficient for c1, 2-index - coefficient for c2
    var solutions = []; // as vectors
    var solutionSymbols = [];
    var solutionsExpressions = [];

    solutionSymbols.push(undefined);
    j = -1;
    while (++j < m.cols()) {
      solutions[j] = undefined;//createVector(m.cols());
    }

    i = m.rows();
    var equation = undefined;
    var equationSymbols = undefined;
    while (--i >= 0) {
      j = 0;
      while (j < m.cols() - 1 && m.e(i, j).equals(RPN.ZERO)) {
        j += 1;
      }
      // first not zero in a row - main variable
      k = j;
      if (i === 0) {
        k = -1;
      }
      solutions[j] = createVector(m.cols());
      while (++k < m.cols() - 1) {
        //if (!m.e(i, k).equals(RPN.ZERO)) {
          if (solutions[k] === undefined) {
            freeVariablesCount += 1;
            // define free as c1, c2, c3...
            solutions[k] = createVector(m.cols());
            solutions[k][freeVariablesCount] = RPN.ONE;
            if (false) {
              solutionSymbols.push(new Expression.Symbol("c_" + freeVariablesCount));
              // TODO: out
            } else {
              solutionSymbols.push(new Expression.Symbol(variableNames.get(k)));
            }
            solutionsExpressions[k] = polynomToExpression(solutions[k], solutionSymbols);
          }
        //}
      }
      if (j < m.cols() - 1) {
        mstr += "<div>";
        mstr += i18n.fromEquationIFindVariable
                  .replace(/\$\{i\}/g, (i + 1).toString())
                  .replace(/\$\{x\}/g, new Expression.Symbol(variableNames.get(j)).toMathML())
                  .replace("#system_1", "#" + systemId);
        mstr += "</div>";
        mstr += "<div>";
        equation = [];
        equationSymbols = [];
        equation.push(m.e(i, j));
        equationSymbols.push(new Expression.Symbol(variableNames.get(j)));
        equation.push(m.e(i, m.cols() - 1));
        equationSymbols.push(undefined);
        k = m.cols() - 1;
        while (--k > j) {
          if (!m.e(i, k).equals(RPN.ZERO)) {
            equation.push(m.e(i, k).negate());
            equationSymbols.push(new Expression.Symbol(variableNames.get(k)));
          }
        }
        var beforeSubstitution = createLinearEquationExpression(equation, equationSymbols, 1);
        mstr += beforeSubstitution;
        equation = [];
        equationSymbols = [];
        equation.push(m.e(i, j));
        equationSymbols.push(new Expression.Symbol(variableNames.get(j)));
        equation.push(m.e(i, m.cols() - 1));
        equationSymbols.push(undefined);
        k = m.cols() - 1;
        while (--k > j) {
          if (!m.e(i, k).equals(RPN.ZERO)) {
            equation.push(m.e(i, k).negate());
            equationSymbols.push(polynomToExpression(solutions[k], solutionSymbols));
          }
        }
        var afterSubstitution = createLinearEquationExpression(equation, equationSymbols, 1);
        //TODO: fix performance
        if (afterSubstitution !== beforeSubstitution) {
          mstr += ", " + afterSubstitution;
        }
        solutions[j][0] = m.e(i, m.cols() - 1).divide(m.e(i, j));
        k = m.cols() - 1;
        while (--k > j) {
          if (!m.e(i, k).equals(RPN.ZERO)) {
            // solutions[j] -= m.e(i, k).negate().multiply(solutions[k])
            var n = -1;
            while (++n < m.cols()) {
              if (!solutions[k][n].equals(RPN.ZERO)) {
                solutions[j][n] = solutions[j][n].subtract(m.e(i, k).multiply(solutions[k][n]).divide(m.e(i, j)));
              }
            }
          }
        }

        solutionsExpressions[j] = polynomToExpression(solutions[j], solutionSymbols);

        equation = [];
        equationSymbols = [];
        equation.push(RPN.ONE);
        equationSymbols.push(new Expression.Symbol(variableNames.get(j)));
        k = solutions[j].length;
        while (--k >= 0) {
          equation.push(solutions[j][k]);
          equationSymbols.push(solutionSymbols[k]);
        }

        var afterSimplification = createLinearEquationExpression(equation, equationSymbols, 1);
        if (afterSimplification !== afterSubstitution) {
          mstr += ", " + afterSimplification;
        }
        mstr += "</div>";
      }
    }

    if (moreText) {
      mstr += "<div>" + i18n.textAnswer + "</div>";
      i = -1;
      while (++i < m.cols() - 1) {
        mstr += "<div>";
        mstr += new Expression.Symbol(variableNames.get(i)).toMathML() + "<mo>=</mo>" + printSomething(solutionsExpressions[i]) + (i < m.cols() - 2 ? " ," : "");
        mstr += "</div>";
      }
    }
    if (options.solution != undefined) {
      return new Matrix([solutionsExpressions]).transpose();
    }
    mstr += "<div>" + (moreText ? i18n.text53 : "") + " <mi>X</mi><mo>=</mo>" + printSomething(new Matrix([solutionsExpressions]).transpose()) + "</div>";

    if ((moreText || eigenvectors !== undefined) && OSLU === 1 && freeVariablesCount > 0) {
      if (moreText) {
        mstr += "<div>" + i18n.textBasicSolutions + ": </div>";
      }
      i = -1;
      var fundamentalSystemHTML = "";
      while (++i < freeVariablesCount) {
        var bx = [];
        j = -1;
        while (++j < m.cols() - 1) {
          bx[j] = solutions[j][i + 1];
        }
        var bxVector = new Matrix([bx]).transpose();
        if (moreText) {
          var bxHTML = printSomething(bxVector);
          mstr += "<msub><mrow><mi>&lambda;</mi></mrow><mrow><mn>" + i + "</mn></mrow></msub>" + bxHTML + " ; ";
          fundamentalSystemHTML += bxHTML + (i !== freeVariablesCount - 1 ? " , " : "");
        }
        if (eigenvectors !== undefined) {
          eigenvectors.push(bxVector);
        }
      }
      if (moreText) {
        mstr += "<div>" + i18n.textFundamentalSystem + ": " + fundamentalSystemHTML + "</div>";
      }
    }

    if (eigenvectors !== undefined) {
      //!
      i = -1;
      while (++i < m.cols() - 1) {
        if (!solutionsExpressions[i].equals(RPN.ZERO)) {
          return mstr;
        }
      }
      // all zeros - lambda was incorrect, and the root is irrational
    }

  }

  return mstr;
}

Expression.Details.add({
  type: "solve-using-Cramer's-rule",
  i18n: i18n.solveByCrammer,
  priority: 1,
  callback: function (variableNames, matrix) {
    return solveUsingCramersRule(variableNames, matrix);
  }
});
Expression.Details.add({
  type: "solve-using-inverse-matrix-method",
  i18n: i18n.solveByInverse,
  priority: 1,
  callback: function (variableNames, matrix) {
    return solveUsingInverseMatrixMethod(variableNames, matrix);
  }
});

Utils.initialize(document, ".slu-buttons", function (element) {
  for (var i = 0; i < Expression.Details.details.length; i += 1) {
    var x = Expression.Details.details[i];
    if (x.type.indexOf("solve-") === 0) {
      var div = document.createElement("div");
      div.innerHTML = "<button type=\"button\" class=\"expression\" data-expression=\"${type} A\">${i18n}</button>"
                        .replace(/\$\{type\}/g, x.type)
                        .replace(/\$\{i18n\}/g, x.i18n);
      element.appendChild(div);
    }
  }
});

Utils.on(document, "click", ".z-expression", handleError(function (event) {
  var type = this.getAttribute("data-type");
  hit(type);
  var matrix = MatrixTables.get("A").getMatrix();
  var resultHTML = Expression.Details.getCallback(type)(matrix);
  if (resultHTML != undefined) {
    setResult(resultHTML);
  }
}));

Utils.initialize(document, ".det-buttons", function (element) {
  for (var i = 0; i < Expression.Details.details.length; i += 1) {
    var x = Expression.Details.details[i];
    if (x.type.indexOf("determinant") === 0 && x.i18n !== "") {
      var div = document.createElement("div");
      div.innerHTML = "<button type=\"button\" class=\"z-expression\" data-type=\"${type}\">${i18n}</button>"
                        .replace(/\$\{type\}/g, x.type)
                        .replace(/\$\{i18n\}/g, i18n.use + " " + x.i18n);
      element.appendChild(div);
    }
  }
});

// -------------------------------------------- vectors -------------------------------------------
function permutations(n, callback) {
  n = Math.trunc(n);
  if (n < 1) {
    return;
  }
  var p = [];
  var even = true;
  var i = -1;
  while (++i < n) {
    p[i] = i;
  }
  var k = 0;
  var l = 0;
  var t = 0;

  while (true) {
    callback(p, even);
    k = n - 2;
    l = n - 1;

    while (k >= 0 && p[k] > p[k + 1]) {
      k -= 1;
    }

    if (k < 0) {
      return;
    }

    while (p[k] > p[l]) {
      l -= 1;
    }

    t = p[k];
    p[k] = p[l];
    p[l] = t;
    even = !even;

    // reverse
    i = k + 1;
    while (i < n - i + k) {
      t = p[n - i + k];
      p[n - i + k] = p[i];
      p[i] = t;
      even = !even;
      i += 1;
    }
  }
}

function getEigenvalues(matrix) {

  if (!matrix.isSquare()) {
    return undefined;
  }
  // TODO: remove Polynom
  // TODO: use another method here (performance), details for determinant calculation

  var determinant = matrix.map(function (e, i, j) {
    return i === j ? new Polynom([e, RPN.ONE.negate()]) : new Polynom([e]);
  }).determinant();

  /*
  var determinant = new Polynom([]);
  permutations(matrix.cols(), function (p, even) {
    var t = new Polynom([even ? RPN.ONE : RPN.ONE.negate()]);
    var i = -1;
    while (++i < p.length) {
      if (i === p[i]) {
        t = t.multiply(new Polynom([matrix.e(i, p[i]), RPN.ONE.negate()]));
      } else {
        t = t.multiply(new Polynom([matrix.e(i, p[i])]));
      }
    }
    determinant = determinant.add(t);
  });
  */
  var characteristicPolynomial = determinant;

  var roots = characteristicPolynomial.getroots();
  // removing of duplicates
  var i = -1;
  var uniqueRoots = [];
  while (++i < roots.length) {
    var isDuplicate = false;
    var j = -1;
    var root = roots[i];
    while (++j < uniqueRoots.length) {
      if (uniqueRoots[j].equals(root)) {
        isDuplicate = true;
      }
    }
    if (!isDuplicate) {
      uniqueRoots.push(root);
    }
  }

  var html = "";
  //TODO: improve i18n (links to Wikipedia)
  var variableName = "\u03BB";
  var variableSymbols = [];
  i = -1;
  while (++i < matrix.cols() + 1) {
    variableSymbols.push(i === 0 ? undefined : (i === 1 ? RPN(variableName) : RPN(variableName + "^" + i)));
  }
  var lambda = new Expression.Symbol("\u03BB");
  var matrixWithLambdas = matrix.map(function (element, i, j) {
    return i === j ? new Expression.Addition(element, new Expression.Negation(lambda)) : element;
  });
  html += "<div>" + i18n.text11 + "</div>";
  html += "<div>";
  html += printSomething(new Expression.Determinant(new Expression.Matrix(matrixWithLambdas))) + "<mo>=</mo>" + printSomething(polynomToExpression(characteristicPolynomial.a, variableSymbols));
  if (roots.length !== 0) {
    html += "<mo>=</mo>";
    var k = -1;
    var z = characteristicPolynomial;
    while (++k < roots.length) {
      z = z.divide(new Polynom([roots[k].negate(), RPN.ONE]));
    }
    k = -1;
    //TODO: remove brackets
    html += "<mfenced open=\"(\" close=\")\">" + printSomething(polynomToExpression(z.a, variableSymbols)) + "</mfenced>";
    while (++k < roots.length) {
      html += "<mfenced open=\"(\" close=\")\">" + printSomething(polynomToExpression((new Polynom([roots[k].negate(), RPN.ONE])).a, variableSymbols)) + "</mfenced>";
    }
  }
  html += "</div>";
  var n = -1;
  while (++n < roots.length) {
    html += "<div>" + "<msub><mrow><mi>&lambda;<mi></mrow><mrow><mn>" + (n + 1) + "</mn></mrow></msub><mo>=</mo>" + printSomething(roots[n]) + "</div>";
  }
  return {eigenvalues: [uniqueRoots, roots], html: html};
}

function addColumn(matrix) {
  return Matrix.Zero(matrix.rows(), matrix.cols() + 1).map(function (element, row, column) {
    return column < matrix.cols() ? matrix.e(row, column) : element;
  });
}

function getEigenvectors(matrix, eigenvalues) {
  var html = "";
  var eigenvectors = [];
  var eigenvaluesForEachVector = [];
  var i = -1;
  while (++i < eigenvalues.length) {
    html += "<div>";
    var mm = matrix.subtract(Matrix.I(matrix.cols()).scale(eigenvalues[i])); // matrix - E * eigenvalue
    var array = [];
    var fullMatrix = addColumn(mm);
    var solutionHTML = solveByGauss(undefined, fullMatrix, {
      moreText: false,
      method: {//TODO Montante ?
        i18n: i18n.solutionByGaussJordanElimination,
        toRowEchelon: function (matrix, callback) {
          return matrix.toRowEchelon(true, false, callback);
        },
        rowReduceChangeToHTML: rowReduceChangeToHTML
      },
      eigenvectors: array
    });
    var j = -1;
    while (++j < array.length) {
      var eigenvector = array[j];
      eigenvectors.push(eigenvector);
      eigenvaluesForEachVector.push(eigenvalues[i]);
    }
    // TODO: fix output for diagonalization - instead of `X = {{0}, {c_1}, {0}}` should be `... let c_1 = 1, then X = {{0}, {1}, {0}}`
    html += "<msub><mrow><mi>&lambda;</mi></mrow><mrow><mn>" + (i + 1) + "</mn></mrow></msub>";
    html += "<mo>=</mo>" + printSomething(eigenvalues[i]);
    html += "<div><mi>A</mi>&minus;<mi>&lambda;</mi><mo>&times;</mo><mi>E</mi><mo>=</mo>" + printSomething(mm) + "</div>";
    html += "<div>";
    html += "<span><mi>A</mi>&minus;<mi>&lambda;</mi><mo>&times;</mo><mi>E</mi><mo>=</mo><mi>O</mi></span>, ";
    html += i18n.text12;
    html += "</div>";
    html += "<div>" + solutionHTML + "</div>";
    html += "</div>";
  }

  return {
    html: html,
    eigenvectors: eigenvectors,
    eigenvaluesForEachVector: eigenvaluesForEachVector
  };
}

function findEVectors(m) {
  if (!m.isSquare()) {
    throw new RangeError("NonSquareMatrixException");
  }

  var tmp = getEigenvalues(m);
  var f = tmp.eigenvalues[0];
  var html = tmp.html;
  if (f.length > 0) {
    html += "<div>";
    html += i18n.text13;
    html += "</div>";
  } else {
    html += i18n.text14;
  }
  tmp = getEigenvectors(m, f);
  html += tmp.html;
  setResult(html);
}
// --------------------------------------------- end ----------------------------------------------




// A = T^-1 L T ,T-matrix of own vectors, L - matrix of own values

Expression.diagonalize = function (m) {
  if (!m.isSquare()) {
    throw new RangeError("NonSquareMatrixException");
  }

  // TODO: move to details
  //TODO: details of determinant calculation, details of roots finding
  var tmp = getEigenvalues(m);
  var eigenValues = tmp.eigenvalues[0];
  var rootsCountWithDuplicates = tmp.eigenvalues[1].length;
  var html = tmp.html;

  // http://en.wikipedia.org/wiki/Eigenvalues_and_eigenvectors#Algebraic_multiplicities
  if (rootsCountWithDuplicates < m.cols()) {
    //TODO: show polynomial in html anyway
    //Dialog.alert(i18n.notEnoughRationalEigenvalues);//!!! TODO: fix message
    return [undefined, undefined, undefined, html, i18n.notEnoughRationalEigenvalues]; //!
  }
  tmp = getEigenvectors(m, eigenValues);
  html += tmp.html;
  var eigenvectors = tmp.eigenvectors;
  var eigenvaluesForEachVector = tmp.eigenvaluesForEachVector;

  if (eigenvectors.length < m.cols()) {
    //TODO: show polynomial in html anyway
    // The matrix is not diagonalizable, because it does not have {n} linearly independent eigenvectors.
    var message = i18n.notDiagonalizable.replace(/\$\{n\}/g, m.cols());
    return [undefined, undefined, undefined, html, message]; //!
  }

  // TODO: text
  var L = Matrix.Diagonal(eigenvaluesForEachVector);
  var T = Matrix.I(m.cols());


  var k = -1;
  while (++k < T.cols()) {
    var v = eigenvectors[k];
    var l = -1;
    while (++l < T.cols()) {
      T.a[l][k] = v.e(l, 0);
    }
  }

  //TODO: fix
  html = createDetailsSummary(undefined, html);
  
  return [T, L, T.inverse(), html, ""];
};

// --------------------------------------------- end ----------------------------------------------

function fordecfract(event) {
  if (event != undefined) { // initialization
    hit("fordecfract");
  }
  var usedecfrac = document.getElementById("decfraccheckbox").checked;
  var frdigits = Number.parseInt(document.getElementById("frdigits").value, 10) || 0;
  decFract = (usedecfrac ? frdigits : -1);
  if (usedecfrac) {
    document.getElementById("frdigitsspan").removeAttribute("hidden");
  } else {
    document.getElementById("frdigitsspan").setAttribute("hidden", "hidden");
  }
}
// 1286

var polyfromtable = function (stable) {
  var m = MatrixTables.get(stable).getMatrix();
  var coefficients = [];
  for (var i = m.cols() - 1; i >= 0; i -= 1) {
    coefficients.push(m.e(0, i));
  }
  return new Polynom(coefficients);
};

Utils.on(document, "click", ".mroots", handleError(function () {
  hit("mroots");
  var p1 = polyfromtable(this.getAttribute("data-for"));
  var roots = p1.getroots();
  var html = "";
  html += "<ul>";
  for (var i = 0; i < roots.length; i += 1) {
    html += "<li>" + printSomething(roots[i]) + "</li>";
  }
  html += "</ul>";
  setResult("Roots: " + html);
}));

Utils.on(document, "click", ".mmult", handleError(function () {
  hit("mmult");
  var p1 = polyfromtable("A");
  var p2 = polyfromtable("B");
  var result = p1.multiply(p2);
  setResult("(" + printSomething(p1) + ")" + "*" + "(" + printSomething(p2) + ")" + "=" + printSomething(result));
}));

  // TODO: fix?
  global.printSomething = printSomething;
  global.rowReduceChangeToHTML = rowReduceChangeToHTML;
  global.rowReductionGaussJordanMontante = rowReductionGaussJordanMontante;
  global.mgetZero = mgetZero;
  global.permutations = permutations;
  global.solveByGauss = solveByGauss;
  global.toDecimalNumber = toDecimalNumber;
  global.appendScript = appendScript;//TODO: remove

function drawElement(element) {

  // main drawing function - recursive call
  function draw(parentBoundingRect, element, context) {
    var computedStyle = window.getComputedStyle(element, undefined);
    var boundingRect = element.getBoundingClientRect();

    context.save();

    context.translate(boundingRect.left - parentBoundingRect.left,
                      boundingRect.top - parentBoundingRect.top);
    var w = boundingRect.right - boundingRect.left;
    var h = boundingRect.bottom - boundingRect.top;

    var borderTopLeftRadius = Number.parseFloat(computedStyle.borderTopLeftRadius);
    var borderTopRightRadius = Number.parseFloat(computedStyle.borderTopRightRadius);
    var borderRadius = borderTopLeftRadius < borderTopRightRadius ? borderTopRightRadius : borderTopLeftRadius;

    // border
    context.save();
    var drawBorder = function (side) {
      context.beginPath();
      var cssWidth = "0px";
      var color = "transparent";
      if (side === "top") {
        cssWidth = computedStyle.borderTopWidth;
        color = computedStyle.borderTopColor;
      } else if (side === "right") {
        cssWidth = computedStyle.borderRightWidth;
        color = computedStyle.borderRightColor;
      } else if (side === "bottom") {
        cssWidth = computedStyle.borderBottomWidth;
        color = computedStyle.borderBottomColor;
      } else if (side === "left") {
        cssWidth = computedStyle.borderLeftWidth;
        color = computedStyle.borderLeftColor;
      }
      var lineWidth = Number.parseFloat(cssWidth);
      if (lineWidth !== 0) {
        context.lineWidth = lineWidth;
        context.strokeStyle = color;
        if (borderRadius === 0 && (side === "top" || side === "bottom")) {
          context.moveTo(0, 0 + lineWidth / 2);
          context.lineTo(w, 0 + lineWidth / 2);
        }
        if (side === "right" || side === "left") {
          context.moveTo(w - lineWidth / 2 - borderRadius, 0);
          context.quadraticCurveTo(w - lineWidth / 2, 0, w - lineWidth / 2, borderRadius);
          context.lineTo(w - lineWidth / 2, h - borderRadius);
          context.quadraticCurveTo(w - lineWidth / 2, h, w - lineWidth / 2 - borderRadius, h);
        }
        context.stroke();
      }
    };
    drawBorder("top");
    drawBorder("right");
    context.translate(+w / 2, +h / 2);
    context.rotate(-Math.PI);
    context.translate(-w / 2, -h / 2);
    drawBorder("bottom");
    drawBorder("left");
    context.restore();

    var childNode = element.firstChild;
    while (childNode != undefined) {
      var nodeType = childNode.nodeType;
      if (nodeType === Node.ELEMENT_NODE) {
        draw(boundingRect, childNode, context);
      }
      if (nodeType === Node.TEXT_NODE) {
        // text childs:
        var range = childNode.ownerDocument.createRange();
        context.fillStyle = computedStyle.color;
        context.textBaseline = "top";
        context.font = computedStyle.font;

        var childNodeData = childNode.data;
        var l = childNodeData.length;
        var j = -1;
        while (++j < l) {
          range.setStart(childNode, j);
          range.setEnd(childNode, j + 1);
          var r = range.getClientRects();
          if (r.length !== 0) {
            context.fillText(childNodeData[j], r[0].left - boundingRect.left, r[0].top - boundingRect.top);
          }
        }
      }
      childNode = childNode.nextSibling;
    }

    context.restore();
  }

  var canvas = document.createElement("canvas");
  var boundingRect = element.getBoundingClientRect();
  canvas.width = Math.trunc(boundingRect.right - boundingRect.left + 0.5);
  canvas.height = Math.trunc(boundingRect.bottom - boundingRect.top + 0.5);
  var context = canvas.getContext("2d");
  context.fillStyle = "transparent";
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  draw(boundingRect, element, context);
  return {
    src: canvas.toDataURL(),
    width: canvas.width,
    height: canvas.height
  };
}

var hitQueue = [];
var hit = function (click) {
  if (window.yaCounter29787732 == undefined) {
    hitQueue.push(click);
  } else {
    //window.yaCounter29787732.reachGoal("GOAL", {
    //  click: click
    //});
    window.yaCounter29787732.hit(window.location.hash, document.title, document.referrer, {
      click: click
    });
  }
};

window.history.navigationMode = "fast"; // - Opera Presto

Utils.initialize(document, ".adsbygoogle", function (element) {

  window.setTimeout(function () {
    (window["yandex_metrika_callbacks"] = window["yandex_metrika_callbacks"] || []).push(function() {
      try {
        window.yaCounter29787732 = new Ya.Metrika({
          id: 29787732,
          clickmap: true,
          trackLinks: true,
          accurateTrackBounce: true,
          trackHash: true,
          webvisor: window.navigator.userAgent.indexOf("Safari/600.1.4") !== -1,
          params: {}
        });
        var length = hitQueue.length;
        for (var i = 0; i < length; i += 1) {
          hit(hitQueue[i]);
        }
        hitQueue = undefined;
      } catch(e) { }
    });
    appendScript("https://mc.yandex.ru/metrika/watch.js");
  }, 0);

  window.setTimeout(function () {
    // loading indicator in Opera
    if (window.matchMedia !== undefined && window.opera === undefined) {
      var mediaQueryList = window.matchMedia("screen and (max-width: 800px)");  // see style.css
      var checkMedia = function () {
        if (!mediaQueryList.matches) {
          mediaQueryList.removeListener(checkMedia);
          if (Math.random() < 0.25 && document.documentElement.lang === "ru") {
            element.innerHTML = "<div>" +
                                "<div><a href=\"http://megaflowers.ru/\" target=\"_blank\"><img width=\"160\" height=\"192\" src=\"http://cdn.megaflowers.ru/pub/bouquet/pojema-o-vesne_m.jpg\" /></a></div>" +
                                "<div>Срочно нужны цветы?</div>" +
                                "<div><a href=\"http://megaflowers.ru/\">Закажите сейчас!</a></div>" +
                                "<div>Доставим через 3 часа!</div>" +
                                "</div>";
          } else if (Date.now() < 1430506800000 && Math.random() < 0.5) {
            element.innerHTML = "<a class=\"socrealizmdance\" href=\"http://vk.com/socrealizmdance\" target=\"_blank\"><img width=\"200\" height=\"283\" src=\"/imgs/lnwJnOgPyCw.jpg\" /></a>";
            var a = element.querySelector("a");
            a.addEventListener("click", function (event) {
              hit("socrealizmdance");
            }, false);
            element.removeChild(a);
            element.parentNode.insertBefore(a, element);
            element.parentNode.removeChild(element);
          } else {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            appendScript("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js");
          }
        }
      };
      mediaQueryList.addListener(checkMedia);
      checkMedia();
    }
  }, 0);
});

Utils.initialize(document, ".g-plusone", function (element) {
  window.setTimeout(function () {
    if (window.location.protocol !== "file:") {
      window.___gcfg = {lang: document.documentElement.lang};
      appendScript("https://apis.google.com/js/plusone.js");
    }
  }, 0);
});

if (window.location.protocol !== "file:") {
  if (("serviceWorker" in window.navigator)) {
    window.navigator.serviceWorker.register("sw.js", {scope: "./"}).then(function (registration) {
      window.console.log("ServiceWorker registration successful with scope: ", registration.scope);
    })["catch"](function (error) {
      window.console.log("ServiceWorker registration failed: ", error);
    });
  }
}

window.addEventListener("beforeinstallprompt", function (event) {
  if (event.userChoice != undefined) {
    event.userChoice.then(function (choiceResult) {
      hit("beforeinstallprompt" + choiceResult.outcome);
    });
  }
  hit("beforeinstallprompt");
}, false);

}(this));

/*global i18nObject, Expression, Matrix, RPN, printSomething */

  Matrix.prototype.toRowEchelon3 = function (callback) {
    callback = callback === undefined ? undefined : callback;
    var m = this;
    var pivotRow = 0;
    var pivotColumn = -1;
    var oldMatrix = undefined;

    var targetRow = -1;
    var previousPivot = RPN.ONE;

    var rows = m.rows();
    var cols = m.cols();
    while (++pivotColumn < cols) {
      // pivot searching
      targetRow = pivotRow;
      // not zero element in a column (starting from the main diagonal);
      while (targetRow < rows && m.e(targetRow, pivotColumn).equals(RPN.ZERO)) {
        targetRow += 1;
      }
      if (targetRow < rows) {
        if (targetRow !== pivotRow) {
          // determinant will not be changed
          oldMatrix = m;
          m = m.map(function (e, i, j) {
            if (i === pivotRow) {
              return m.e(targetRow, j);
            }
            if (i === targetRow) {
              return m.e(pivotRow, j).negate();
            }
            return e;
          });
          if (callback !== undefined) {
            callback({previousPivot: previousPivot, newMatrix: m, oldMatrix: oldMatrix, type: "swap-negate", targetRow: pivotRow, pivotRow: targetRow, pivotColumn: pivotColumn});
          }
        }
        oldMatrix = m;
        targetRow = -1;
        while (++targetRow < rows) {
          if (targetRow !== pivotRow) {
            m = m.rowReduce(targetRow, pivotRow, pivotColumn, previousPivot);
          }
        }
        if (callback !== undefined) {
          callback({previousPivot: previousPivot, newMatrix: m, oldMatrix: oldMatrix, type: "pivot", targetRow: -1, pivotRow: pivotRow, pivotColumn: pivotColumn});
        }
        previousPivot = m.e(pivotRow, pivotColumn);
        pivotRow += 1;
      }
    }
    return m;
  };

  Matrix.prototype.determinant = function () {
    var n = this.rows();
    if (!this.isSquare() || n === 0) {
      throw new RangeError("NonSquareMatrixException");
    }
    return this.toRowEchelon3(undefined).e(n - 1, n - 1);
  };

  Matrix.prototype.rank = function () {
    // rank === count of non-zero rows after bringing to row echelon form ...
    var m = this.toRowEchelon3(undefined).transpose().toRowEchelon3(undefined);
    var result = 0;
    var i = m.rows() < m.cols() ? m.rows() : m.cols();

    while (--i >= 0) {
      result += m.e(i, i).equals(RPN.ZERO) ? 0 : 1;
    }
    return result;
  };

  Matrix.prototype.inverse = function () { // m == n by augmention ...
    if (!this.isSquare()) {
      throw new RangeError("NonSquareMatrixException");
    }
    var m = this.augment(Matrix.I(this.rows()));
    m = m.toRowEchelon3(undefined);

    return Matrix.Zero(m.rows(), m.rows()).map(function (element, i, j) { // splitting to get the second half
      var e = m.e(i, i);
      if (e.equals(RPN.ZERO)) {
        throw new RangeError("SingularMatrixException");
      }
      var x = m.e(i, j + m.rows());
      return e.equals(RPN.ONE) ? x : x.divide(e);
    });
  };

Expression.Details.add({
  type: "solve-using-Gaussian-elimination",
  i18n: i18nObject.solveByGauss,
  priority: 1,
  callback: function (variableNames, matrix) {
    return solveByGauss(variableNames, matrix, {
      moreText: true,
      method: {
        i18n: i18nObject.solutionByGaussianElimination,
        toRowEchelon: function (matrix, callback) {
          return matrix.toRowEchelon(false, false, callback);
        },
        rowReduceChangeToHTML: rowReduceChangeToHTML
      },
      eigenvectors: undefined
    });
  }
});

Expression.Details.add({
  type: "solve-using-Gauss-Jordan-elimination",
  i18n: i18nObject.solveByJordanGauss,
  priority: 1,
  callback: function (variableNames, matrix) {
    return solveByGauss(variableNames, matrix, {
      moreText: true,
      method: {
        i18n: i18nObject.solutionByGaussJordanElimination,
        toRowEchelon: function (matrix, callback) {
          return matrix.toRowEchelon(true, false, callback);
        },
        rowReduceChangeToHTML: rowReduceChangeToHTML
      },
      eigenvectors: undefined
    });
  }
});

Expression.Details.add({
  type: "solve-using-Montante-method",
  i18n: i18nObject.methodOfMontante,
  priority: 2,
    callback: function (variableNames, matrix) {
    return solveByGauss(variableNames, matrix, {
      moreText: true,
      method: {
        i18n: i18nObject.solutionByMethodOfMontante.replace(/\$\{link\}/, i18nObject.solutionByMethodOfMontanteLink),
        toRowEchelon: function (matrix, callback) {
          return matrix.toRowEchelon3(callback);
        },
        rowReduceChangeToHTML: rowReduceChangeToHTMLMontante
      },
      eigenvectors: undefined
    });
  }
});

  var rowReduceChangeToHTMLMontante = function (args, printOptions, containerId, k) {

    var t = function (r, c, k) {
      return "<mrow>" +
               Expression.p("(a_(${r},${c})*a_(i,j)-a_(i,${c})*a_(${r},j))/p_${k}"
                              .replace(/\$\{r\}/g, (r + 1).toString())
                              .replace(/\$\{c\}/g, (c + 1).toString())
                              .replace(/\$\{k\}/g, (k + 1).toString())) +
               "<mo>&rarr;</mo>" +
               Expression.p("a_(i,j)") +
             "</mrow>";
    };
    var cellId = function (containerId, matrixId, i, j) {
      return containerId + "-" + matrixId.toString() + "-" + i.toString() + "-" + j.toString();
    };
    
    var html = "";

    if (true) {
      rowEchelonMatrix = args.newMatrix;
      if (args.type === "swap-negate") {
        html += rowReduceChangeToHTML(args, printOptions, containerId, k);
      } else if (args.type === "pivot") {
        var pivotElementText = (i18nObject.eliminationDetails.pivotElement !== "" ? "<div>" + i18nObject.eliminationDetails.pivotElement + "</div>" : "") +
                               "<div>" + 
                               Expression.p("p_" + ((k + 1).toString()) + "=a_" + (args.pivotRow + 1).toString() + (args.pivotColumn + 1).toString() + "=q", {q: args.oldMatrix.e(args.pivotRow, args.pivotColumn)}) +
                               "</div>";
        var a0 = printSomething(new Expression.Matrix(args.oldMatrix), {
          columnlines: printOptions.columnlines,
          cellTransform: function (i, j, s) {
            return "<mtd tabindex=\"0\" id=\"" + cellId(containerId, k, i, j) + "\" " + (i === args.pivotRow && j === args.pivotColumn ? "class=\"pivot\"" : "") + ">";
          }
        });
        html += a0 + "<munder><mrow><mo>~</mo></mrow><mrow><mtable><mtr><mtd>" + pivotElementText + "</mtd></mtr><mtr><mtd>" + t(args.pivotRow, args.pivotColumn, k - 1) + "</mtd></mtr></mtable></mrow></munder>";
        k += 1;

        var text = "";
        for (var targetRow = 0; targetRow < args.oldMatrix.rows(); targetRow += 1) {
          if (targetRow !== args.pivotRow) {
            text += "<div>";
            for (var i = 0; i < args.oldMatrix.cols(); i += 1) {
              var divId = Utils.id();
              var highlight = "<a class=\"a-highlight\" data-for=\"" + cellId(containerId, k, targetRow, i) + "\" data-highlight=\"" +
                                "#" + cellId(containerId, k - 1, args.pivotRow, args.pivotColumn) + ", " +
                                "#" + cellId(containerId, k - 1, targetRow, i) + ", " +
                                "#" + cellId(containerId, k - 1, targetRow, args.pivotColumn) + ", " +
                                "#" + cellId(containerId, k - 1, args.pivotRow, i) + ", " +
                                "#" + cellId(containerId, k, targetRow, i) + "\"></a>";
              var tooltips = "<a class=\"a-tooltip\" data-for=\"" + cellId(containerId, k, targetRow, i) + "\" data-tooltip=\"" + divId + "\"></a>";
              text += "<div class=\"mathmlcontainer focusable\" tabindex=\"0\" id=\"" + divId + "\">" +
                      Expression.p("a_" + (targetRow + 1).toString() + (i + 1).toString() + "=(a*b-c*d)/p=r", {
                        a: args.oldMatrix.e(args.pivotRow, args.pivotColumn),
                        b: args.oldMatrix.e(targetRow, i),
                        c: args.oldMatrix.e(targetRow, args.pivotColumn),
                        d: args.oldMatrix.e(args.pivotRow, i),
                        p: args.previousPivot,
                        r: args.newMatrix.e(targetRow, i)
                      }) +
                      "</div>" +
                      highlight +
                      tooltips;
            }
            text += "</div>";
          }
        }
        html += "<span hidden>" + text + "</span>";
      } else {
        throw new Error(args.type);
      }
    }
    return html;
  };

var rowReductionMontante = function (matrix, printOptions) {
  return rowReductionGaussJordanMontante(matrix, function (matrix, callback) {
    return matrix.toRowEchelon3(callback);
  }, rowReduceChangeToHTMLMontante, printOptions);
};

Expression.Details.add({
  type: "determinant-Montante",
  i18n: i18nObject.methodOfMontante,
  priority: 2,
  callback: function (matrix) {
    var html = "";
    html += "<div>";
    html += "<div>";  
    html += printSomething(new Expression.Determinant(new Expression.Matrix(matrix))) + "<mo>=</mo><mn>?</mn>";
    html += "</div>";

    html += i18nObject.methodOfMontanteDetails.determinantDetails.start.replace(/\$\{someDetails3\}/, someDetails[3]).replace(/`([^`]*)`/g, function (p, input) {
      return "<div class=\"mathmlcontainer\">" + Expression.p(input) + "</div>";
    });

    var tmp = rowReductionMontante(matrix, {});
    html += tmp.html;
    var rowEchelonMatrix = tmp.rowEchelonMatrix;

    html += "<div>";
    html += printSomething(new Expression.Determinant(new Expression.Matrix(matrix)));
    html += "<mo>=</mo>";
    html += printSomething(rowEchelonMatrix.e(rowEchelonMatrix.rows() - 1, rowEchelonMatrix.cols() - 1));
    html += "</div>";
    return html;
  }
});

Expression.Details.add({
  type: "rank-Montante",
  i18n: i18nObject.methodOfMontante,
  priority: 2,
  callback: function (matrix) {
    var html = "";
    html += "<div>";
    html += printSomething(new Expression.Rank(new Expression.Matrix(matrix))) + "<mo>=</mo><mn>?</mn>";
    html += "</div>";
    html += i18nObject.methodOfMontanteDetails.rankDetails.start;
    html += "<div>";
    var tmp = rowReductionMontante(matrix, {});
    html += tmp.html;
    var rowEchelon = tmp.rowEchelonMatrix;
    html += "</div>";
    html += printSomething(new Expression.Rank(new Expression.Matrix(matrix)));
    html += "<mo>=</mo>";
    html += printSomething(new Expression.Rank(new Expression.Matrix(rowEchelon)));
    html += "<mo>=</mo>";
    html += rowEchelon.rank().toString();
    return html;
  }
});

Expression.Details.add({
  type: "inverse-Montante",
  i18n: i18nObject.methodOfMontante,
  priority: 2,
  callback: function (matrix) {
    var html = "";
    html += "<div>";
    html += printSomething(new Expression.Exponentiation(new Expression.Matrix(matrix), Expression.Integer.ONE.negate()), {}) + "<mo>=</mo><mn>?</mn>";
    html += "</div>";
    html += i18nObject.methodOfMontanteDetails.inverseDetails.start;
    html += "<div>";
    var result = undefined;
    var c = undefined;
    var result2 = undefined;
    try {
      var tmp = rowReductionMontante(matrix.augment(Matrix.I(matrix.rows())), {columnlines: -matrix.cols()});
      html += tmp.html;

      var m = tmp.rowEchelonMatrix;
      c = m.e(0, 0);//!
      result2 = Matrix.Zero(m.rows(), m.rows()).map(function (element, i, j) { // splitting to get the second half
        var e = m.e(i, i);
        if (e.equals(RPN.ZERO)) {
          throw new RangeError("SingularMatrixException");
        }
        var x = m.e(i, j + m.rows());
        //return e.equals(RPN.ONE) ? x : x.divide(e);
        return x;
      });
      result = result2.map(function (element, i, j) {
        return element.divide(c);
      });
    } catch (e) {
      if (e instanceof RangeError && e.message.indexOf("SingularMatrixException") === 0) {
        result = undefined;
      } else {
        throw e;
      }
    }
    html += "</div>";
    if (result !== undefined) {
      html += printSomething(new Expression.Exponentiation(new Expression.Matrix(matrix), Expression.Integer.ONE.negate()), {});
      html += "<mo>=</mo>";
      html += printSomething(new Expression.Multiplication(new Expression.Division(RPN.ONE, c), new Expression.Matrix(result2)));
      html += "<mo>=</mo>";
      html += printSomething(result);
    } else {
      //TODO: ?
    }
    return html;
  }
});

/*global window, document*/

(function (global) {
  "use strict";

var lastDevicePixelRatio = 0;
var lastScrollFix = 1;
var getScrollFix = function () {
  if (lastDevicePixelRatio !== window.devicePixelRatio) {
    lastDevicePixelRatio = window.devicePixelRatio;
    var input = document.createElement("input");
    document.body.appendChild(input);
    input.style.width = "1px";
    input.style.overflow = "hidden";
    input.value = "xxxxxxxxxxxxxxx";
    input.scrollLeft = 16383;
    if ("webkitTextStroke" in document.documentElement.style) {
      lastScrollFix = (input.scrollWidth - input.clientWidth) / input.scrollLeft;
    }
    if (input.scrollLeft === 0) {
      lastScrollFix = 1 / 0;
    }
    document.body.removeChild(input);
  }
  return lastScrollFix;
};

if (Number.parseFloat == undefined) {
  Number.parseFloat = parseFloat;
}

var initializeAInput = function (container) {
  var input = container.querySelector("input, textarea");

  // see https://github.com/kueblc/LDT

  var inputStyle = window.getComputedStyle(input, undefined);

  // FF does not like font
  var fontFamily = inputStyle.fontFamily;
  var fontSize = Number.parseFloat(inputStyle.fontSize);
  var font = fontSize.toString() + "px" + " " + fontFamily;
  var lineHeight = Number.parseFloat(inputStyle.lineHeight);
  var tabSize = 4; // Number.parseFloat(inputStyle.tabSize);

  var marginLeft = Number.parseFloat(inputStyle.marginLeft);
  var marginTop = Number.parseFloat(inputStyle.marginTop);
  var borderLeftWidth = Number.parseFloat(inputStyle.borderLeftWidth);
  var borderTopWidth = Number.parseFloat(inputStyle.borderTopWidth);
  var paddingLeft = Number.parseFloat(inputStyle.paddingLeft);
  var paddingTop = Number.parseFloat(inputStyle.paddingTop);

  var isActive = false;
  var canvas = undefined; // document.createElement("canvas");
  var backgroundElement = document.createElement("div");
  container.insertBefore(backgroundElement, input);

  var update = function (event) {
    var width = 0;
    var height = 0;
    var scrollLeft = 0;
    var scrollTop = 0;
    var text = "";
    var strokeStyle = "";
    if (isActive) {
      var value = input.value;
      var selectionStart = input.selectionStart - 1;
      var c = 0;
      var step = 0;
      var n = selectionStart + 2;
      var pair = 0;
      while (step === 0 && selectionStart < n) {
        c = value.charCodeAt(selectionStart);
        var brackets = "(){}[]";
        for (var k = 0; k < brackets.length; k += 2) {
          if (c === brackets.charCodeAt(k)) {
            pair = brackets.charCodeAt(k + 1);
            step = +1;
          }
          if (c === brackets.charCodeAt(k + 1)) {
            pair = brackets.charCodeAt(k);
            step = -1;
          }
        }
        selectionStart += 1;
      }
      selectionStart -= 1;
      if (step !== 0) {
        var i = selectionStart;
        var depth = 1;
        i += step;
        while (i >= 0 && i < value.length && depth > 0) {
          var code = value.charCodeAt(i);
          if (code === c) {
            depth += 1;
          }
          if (code === pair) {
            depth -= 1;
          }
          i += step;
        }
        i -= step;
        var spaces = value.replace(/[^\r\n\t]/g, " ");
        //var spaces = value;
        if (depth === 0) {
          var a = i < selectionStart ? i : selectionStart;
          var b = i < selectionStart ? selectionStart : i;
          text = spaces.slice(0, a) + 
                 value.slice(a, a + 1) +
                 spaces.slice(a + 1, b) + 
                 value.slice(b, b + 1) +
                 spaces.slice(b + 1);
          strokeStyle = "lightgray";//"antiquewhite";
        } else {
          var d = selectionStart;
          text = spaces.slice(0, d) + 
                value.slice(d, d + 1) +
                spaces.slice(d + 1);
          strokeStyle = "lightpink";
        }
        width = input.clientWidth;
        height = input.clientHeight;
        scrollLeft = input.scrollLeft;
        scrollTop = input.scrollTop;
        if (input.tagName === "INPUT") {
          var scrollFix = getScrollFix();
          scrollLeft *= scrollFix;
          scrollTop *= scrollFix;
          if (scrollFix === 1 / 0) {
            text = "";
          }
        }
      }
    }

    if (text !== "") {
      var context = undefined;
      if (canvas != undefined) {
        canvas.width = width;
        canvas.height = height;
        context = canvas.getContext("2d");
        context.font = font;
        context.strokeStyle = strokeStyle;
        context.lineWidth = 2.5;
      } else {
        backgroundElement.innerHTML = "";
        backgroundElement.style.font = font;
        backgroundElement.style.color = strokeStyle;
        if (backgroundElement.style.webkitTextStroke != undefined) {
          backgroundElement.style.webkitTextStroke = "2.5px";
        } else {
          backgroundElement.style.textShadow = "-1px -1px 1px, 1px -1px 1px, -1px 1px 1px, 1px 1px 1px";
        }
      }
      var x = paddingLeft - scrollLeft;
      var y = paddingTop - scrollTop + fontSize;
      if (canvas == undefined) {
        y += 2; //?
      }

      var extraOffset = 0;
      var t = text.replace(/\t/g, function (p, offset) {
        var o = offset + extraOffset;
        var n = tabSize - o % tabSize;
        extraOffset += n - 1;
        return " ".repeat(n);
      });

      var lines = t.split("\n");
      for (var j = 0; j < lines.length; j += 1) {
        var line = lines[j];
        if (canvas != undefined) {
          context.strokeText(line, x, y);
        } else {
          var div = document.createElement("div");
          div.appendChild(document.createTextNode(line));
          div.style.position = "absolute";
          div.style.left = (borderLeftWidth + marginLeft + x).toString() + "px";
          div.style.top = (borderTopWidth + marginTop + y - fontSize).toString() + "px";
          backgroundElement.appendChild(div);
        }
        y += lineHeight;
      }

      if (canvas != undefined) {
        input.style.backgroundImage = "url(" + canvas.toDataURL() + ")";
      }
    } else {
      if (input.style.backgroundImage !== "none") {
        input.style.backgroundImage = "none";
      }
      if (backgroundElement.firstChild != undefined) {
        backgroundElement.innerHTML = "";
      }
    }
  };

  var oldSelectionStart = -1;
  var timeoutId = 0;
  var check = function (event) {
    if (timeoutId === 0) {
      timeoutId = window.setTimeout(function () {
        timeoutId = 0;
        var newSelectionStart = input.selectionStart;
        if (oldSelectionStart !== newSelectionStart) {
          oldSelectionStart = newSelectionStart;
          update(undefined);
        }
      }, 0);
    }
  };
  input.addEventListener("selectionchange", check, false);//?
  input.addEventListener("keydown", check, false);
  input.addEventListener("mousedown", check, false);
  input.addEventListener("input", function (event) {
    //?
    event.target.style.width = Math.max(21, (event.target.value.length * 0.7)).toString() + "em";
  }, false);  
  input.addEventListener("input", update, false);
  var onScroll = function () {
    window.setTimeout(function () {
      update(undefined);
    }, 0);
  };
  input.addEventListener("scroll", onScroll, false);
  var onFocus = function () {
    isActive = true;
    update(undefined);
  };
  var onBlur = function () {
    isActive = false;
    update(undefined);
  };
  input.addEventListener("focus", onFocus, false);
  input.addEventListener("blur", onBlur, false);
};

window.setTimeout(function () {
  var elements = document.querySelectorAll(".a-input");
  for (var i = 0; i < elements.length; i += 1) {
    initializeAInput(elements[i]);
  }
}, 0);

}(this));
