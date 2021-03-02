"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeVanillaStore = void 0;

var _vanilla = _interopRequireDefault(require("zustand/vanilla"));

var _compseGenericStore = require("./compseGenericStore");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var composeVanillaStore = function composeVanillaStore(options) {
  return (0, _compseGenericStore.composeGenericStore)(_vanilla["default"], options);
};

exports.composeVanillaStore = composeVanillaStore;