"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "composeStore", {
  enumerable: true,
  get: function get() {
    return _composeStore.composeStore;
  }
});
Object.defineProperty(exports, "Store", {
  enumerable: true,
  get: function get() {
    return _store.Store;
  }
});
Object.defineProperty(exports, "composeVanillaStore", {
  enumerable: true,
  get: function get() {
    return _composeVanillaStore.composeVanillaStore;
  }
});

var _composeStore = require("./composeStore");

var _store = require("./store");

var _immer = require("immer");

var _composeVanillaStore = require("./composeVanillaStore");

(0, _immer.enablePatches)();