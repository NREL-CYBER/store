"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeVirtualStore = void 0;

var _zustand = _interopRequireDefault(require("zustand"));

var _composeGenericVirtualStore = require("./composeGenericVirtualStore");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var composeVirtualStore = function composeVirtualStore(options) {
  return (0, _composeGenericVirtualStore.composeGenericVirtualStore)(_zustand["default"], options);
};

exports.composeVirtualStore = composeVirtualStore;