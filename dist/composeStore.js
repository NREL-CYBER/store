"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeStore = void 0;

var _zustand = _interopRequireDefault(require("zustand"));

var _composeGenericStore = require("./composeGenericStore");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var composeStore = function composeStore(options) {
  return (0, _composeGenericStore.composeGenericStore)(_zustand["default"], options);
};

exports.composeStore = composeStore;