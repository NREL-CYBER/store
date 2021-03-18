"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeGenericStore = void 0;

var _immer = _interopRequireDefault(require("immer"));

var _uuid = require("uuid");

var _validator = _interopRequireDefault(require("validator"));

var _defer = _interopRequireDefault(require("./defer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var composeGenericStore = function composeGenericStore(create, options) {
  var schema = options.schema,
      definition = options.definition,
      initial = options.initial;
  var validatorInstance = options.validator;
  var collection = definition ? definition : schema.$id ? schema.$id : "errorCollection";

  if (collection === "errorCollection") {
    throw new Error("invalid JSON schema");
  }
  /*
   * validate the initial state and show errors and filter invalid and process data.
   */


  var records = initial ? initial : {};
  var index = initial ? Object.keys(initial) : [];
  var status = "booting"; // Create the implementation of the store type now that we have the initial values prepared.

  return create(function (set, store) {
    return {
      workspace: function workspace() {
        if (typeof store().workspaceInstance === "undefined") {
          store().setStatus("warming-workspace");
          var workspaceInstance = store().validator().makeWorkspace();
          (0, _defer["default"])(function () {
            set({
              workspaceInstance: workspaceInstance
            });
          });
          return workspaceInstance;
        } else {
          return store().workspaceInstance;
        }
      },
      validatorInstance: validatorInstance,
      collection: collection,
      index: index,
      records: records,
      errors: [],
      statusHistory: [],
      setStatus: function setStatus(status) {
        (0, _defer["default"])(function () {
          set({
            status: status,
            statusHistory: [].concat(_toConsumableArray(store().statusHistory.slice(0, 9)), [status])
          });
        });
      },
      status: status,
      validator: function validator() {
        if (typeof store().validatorInstance !== "undefined") {
          return store().validatorInstance;
        } else {
          store().setStatus("warming-validator");

          var _validatorInstance = typeof definition === "string" ? new _validator["default"](schema, definition) : new _validator["default"](schema);

          (0, _defer["default"])(function () {
            set({
              validatorInstance: _validatorInstance
            });
            store().setStatus("idle");
          });
          return _validatorInstance;
        }
      },
      listeners: [],
      search: function search(query) {
        return store().filterIndex(function (x) {
          return Object.values(x).join("").toLowerCase().includes(query.toLowerCase());
        }).map(function (key) {
          return [key, store().retrieve(key)];
        });
      },
      filter: function filter(predicate) {
        return store().filterIndex(predicate).map(function (matchingItemIndex) {
          return store().retrieve(matchingItemIndex);
        });
      },
      filterIndex: function filterIndex(predicate) {
        return store().index.filter(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        });
      },
      remove: function remove(idToRemove) {
        store().setStatus("removing");
        var index = store().index.filter(function (x) {
          return x !== idToRemove;
        });

        if (store().index.length === index.length) {
          return false;
        }

        var records = _objectSpread({}, store().records);

        var oldRecord = _objectSpread({}, records[idToRemove]);

        delete records[idToRemove];
        var active = store().active;

        if (active && active === idToRemove) {
          active = undefined;
        }

        store().listeners.forEach(function (callback) {
          return callback(idToRemove, oldRecord, "removing");
        });
        set({
          index: index,
          records: records,
          active: active
        });
        store().setStatus("idle");
        return true;
      },
      insert: function insert(dataToAdd, optionalItemIndex) {
        var itemIndex = optionalItemIndex ? optionalItemIndex : (0, _uuid.v4)();
        store().setStatus("inserting");

        var index = _toConsumableArray(store().index);

        var validator = store().validator();
        var valid = validator.validate(dataToAdd);

        if (valid) {
          var _records = _objectSpread({}, store().records);

          _records[itemIndex] = dataToAdd;
          if (!index.includes(itemIndex)) index = [].concat(_toConsumableArray(index), [itemIndex]);
          set({
            index: index,
            records: _records
          });
          store().listeners.forEach(function (callback) {
            return callback(itemIndex, _objectSpread({}, dataToAdd), "inserting");
          });
          store().setStatus("idle");
          return true;
        } else {
          var errors = validator.validate.errors;
          errors && set({
            errors: errors
          }) && store().setStatus("erroring") && store().setStatus("idle");
          return false;
        }
      },
      update: function update(id, itemUpdate) {
        store().setStatus("updating");
        var newItem = (0, _immer["default"])(store().retrieve(id), itemUpdate);
        return store().insert(newItem, id);
      },
      retrieve: function retrieve(itemIndex) {
        return store().records[itemIndex];
      },
      setActive: function setActive(active) {
        store().setStatus("activating");
        store().listeners.forEach(function (callback) {
          return callback(active, store().retrieve(active), "activating");
        });
        set({
          active: active
        });
        store().setStatus("idle");
      },
      setWorkspace: function setWorkspace(workspaceUpdate) {
        store().setStatus("workspacing");
        var newWorkspace = (0, _immer["default"])(store().workspace(), workspaceUpdate);
        store().setWorkspaceInstance(newWorkspace);
        store().setStatus("idle");
      },
      setWorkspaceInstance: function setWorkspaceInstance(workspaceInstance) {
        set({
          workspaceInstance: workspaceInstance
        });
        store().listeners.forEach(function (callback) {
          return callback("workspace", workspaceInstance, "workspacing");
        });
        store().setStatus("idle");
      },
      addListener: function addListener(callback) {
        set({
          listeners: [].concat(_toConsumableArray(store().listeners), [callback])
        });
      },
      find: function find(predicate) {
        return store().filter(predicate).pop();
      },
      findAndRemove: function findAndRemove(predicate) {
        store().index.filter(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        }).forEach(function (index) {
          store().remove(index);
        });
      },
      findIndex: function findIndex(predicate) {
        return store().index.find(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        });
      },
      all: function all() {
        return store().filter(function (x) {
          return true;
        });
      },
      activeInstance: function activeInstance() {
        var _store = store(),
            active = _store.active;

        return active ? store().retrieve(active) : undefined;
      },
      "import": function _import(entries) {
        var shouldValidate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        store().setStatus("importing");

        var findRecordErrors = function findRecordErrors(entries) {
          var validator = store().validator();
          Object.values(entries).forEach(function (x) {
            if (!validator.validate(x)) {
              return validator.validate.errors;
            }
          });
          return [];
        };

        var errors = shouldValidate ? findRecordErrors(records) : [];
        set({
          errors: errors,
          records: entries,
          index: Object.keys(entries)
        });

        if (errors.length == 0) {
          Object.entries(entries).forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                itemIndex = _ref2[0],
                importItem = _ref2[1];

            store().listeners.forEach(function (callback) {
              return callback(itemIndex, _objectSpread({}, importItem), "inserting");
            });
          });
        }

        store().setStatus("idle");
        return errors.length == 0;
      },
      clear: function clear() {
        store().setStatus("clearing");
        store()["import"]({});
        store().listeners.forEach(function (callback) {
          return callback("", {}, "clearing");
        });
        store().setStatus("idle");
      },
      "export": function _export() {
        store().setStatus("exporting");
        var result = JSON.stringify(store().records);
        store().setStatus("idle");
        return result;
      },
      exportWorkspace: function exportWorkspace() {
        store().setStatus("exporting");
        return JSON.stringify(store().workspace());
        store().setStatus("idle");
      }
    };
  });
};

exports.composeGenericStore = composeGenericStore;