"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var defer = function defer(func) {
  setTimeout(func, 0);
};

var _default = defer;
exports["default"] = _default;