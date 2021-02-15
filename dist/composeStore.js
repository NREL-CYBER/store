"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeStore = void 0;

var _immer = _interopRequireDefault(require("immer"));

var _uuid = require("uuid");

var _validator = _interopRequireDefault(require("validator"));

var _zustand = _interopRequireDefault(require("zustand"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var composeStore = function composeStore(options) {
  var schema = options.schema,
      definition = options.definition,
      initial = options.initial;
  var injectedValidator = options.validator;
  var collection = definition ? definition : schema.$id ? schema.$id : "errorCollection";

  if (collection === "errorCollection") {
    throw new Error("invalid JSON schema");
  }

  var validator = typeof injectedValidator !== "undefined" ? injectedValidator : typeof definition === "string" ? new _validator["default"](schema, definition) : new _validator["default"](schema);
  /*
   * validate the initial state and show errors and filter invalid and process data.
   */

  var records = initial ? initial : {};
  var index = initial ? Object.keys(initial) : [];
  var workspace = validator.makeWorkspace();

  var validateRecords = function validateRecords(entries) {
    var data = Object.values(entries);
    if (data.length === 0) return true;
    return data.map(function (item) {
      return validator.validate(item);
    }).reduce(function (x, y) {
      return x && y;
    });
  };

  var findRecordErrors = function findRecordErrors(entries) {
    Object.values(entries).forEach(function (x) {
      if (!validator.validate(x)) {
        return validator.validate.errors;
      }
    });
    return [];
  };

  var errors = !validateRecords(records) ? findRecordErrors(records) : []; // Create the implementation of the store type now that we have the initial values prepared.

  return (0, _zustand["default"])(function (set, store) {
    return {
      workspace: workspace,

      /* data type identifier index */

      /* Name of the collection */
      collection: collection,

      /* index of all record ids */
      index: index,

      /* storage map of all records */
      records: records,

      /* validation errors */
      errors: errors,

      /* status of store activity */
      status: "idle",

      /* validation object responsible for data integrity  */
      validator: validator,

      /**
      * Post Crud Listened Events
      */
      listeners: [],

      /**
      * filter entries via a predicate
      */
      filter: function filter(predicate) {
        return store().index.filter(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        }).map(function (matchingItemIndex) {
          return store().retrieve(matchingItemIndex);
        });
      },

      /**
       * Remove an Item from the store by Id
       *  
       * const {remove} = useStore()
       * onDelete => remove(item)
       */
      remove: function remove(idToRemove) {
        set({
          status: "removing"
        });
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
          active: active,
          status: "idle"
        });
        return true;
      },
      insert: function insert(dataToAdd, optionalItemIndex) {
        var itemIndex = optionalItemIndex ? optionalItemIndex : (0, _uuid.v4)();
        set({
          status: "inserting"
        });

        var index = _toConsumableArray(store().index);

        var valid = store().validator.validate(dataToAdd);

        if (valid) {
          var _records = _objectSpread({}, store().records);

          _records[itemIndex] = dataToAdd;
          if (!index.includes(itemIndex)) index = [].concat(_toConsumableArray(index), [itemIndex]);
          set({
            index: index,
            records: _records,
            status: "idle"
          });
          store().listeners.forEach(function (callback) {
            return callback(itemIndex, _objectSpread({}, dataToAdd), "inserting");
          });
          return true;
        } else {
          var _errors = store().validator.validate.errors;
          _errors ? set({
            errors: _errors,
            status: "invalid"
          }) : set({
            status: "invalid"
          });
          return false;
        }
      },

      /**
       * retrieve an Item to the store
       * ie for atomic updates use:
       * const item = useStore(x=>x.retreive(id))
       */
      retrieve: function retrieve(itemIndex) {
        return store().records[itemIndex];
      },

      /**
      * highlight or select this instance for detail view
      */
      setActive: function setActive(active) {
        set({
          active: active
        });
      },

      /**
      * Perform safe partial updates here using immer produce<Datatype>()
      */
      setWorkspace: function setWorkspace(workspaceUpdate) {
        var newWorkspace = (0, _immer["default"])(store().workspace, workspaceUpdate);
        set({
          workspace: newWorkspace
        });
        store().listeners.forEach(function (callback) {
          return callback("workspace", newWorkspace, "workspace-update");
        });
      },

      /**
      * Listen for updates on the store
      */
      addListener: function addListener(callback) {
        set({
          listeners: [].concat(_toConsumableArray(store().listeners), [callback])
        });
      },

      /**
      * Find a single data instance in the store
      */
      find: function find(predicate) {
        return store().filter(predicate).pop();
      },

      /**
      * Find and remove any matching instances
      */
      findAndRemove: function findAndRemove(predicate) {
        store().index.filter(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        }).forEach(function (index) {
          store().remove(index);
        });
      },

      /**
      * Find the index the data item matching a predicate
      */
      findIndex: function findIndex(predicate) {
        return store().index.find(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        });
      },

      /**
      * All records in an array
      */
      all: function all() {
        return store().filter(function (x) {
          return true;
        });
      },

      /**
       * Retrieve the active instance if there is one
       */
      activeInstance: function activeInstance() {
        var _store = store(),
            active = _store.active;

        return active ? store().retrieve(active) : undefined;
      },
      "import": function _import(entries) {
        var errors = findRecordErrors(records);
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

        return errors.length == 0;
      },
      clear: function clear() {
        store()["import"]({});
        store().listeners.forEach(function (callback) {
          return callback("", {}, "clear");
        });
      },

      /**
       * Export all items including the partial.
       * Exported loses information about the "active item"
       */
      "export": function _export() {
        return JSON.stringify(store().records);
      },
      exportWorkspace: function exportWorkspace() {
        return JSON.stringify(store().workspace);
      }
    };
  });
};

exports.composeStore = composeStore;