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

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Create an indexed storage & validation for vanilla TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 */
var composeStore = function composeStore(schema, definition, initialState) {
  var collection = definition ? definition : schema.$id ? schema.$id : "errorCollection";

  if (collection === "errorCollection") {
    throw new Error("invalid JSON schema");
  }

  var validator = typeof definition === "string" ? new _validator["default"](schema, definition) : new _validator["default"](schema);
  var errors = [];
  /*
   * validate the initial state and show errors and filter invalid and process data.
   */

  var records = initialState ? initialState : {};
  var index = initialState ? Object.keys(initialState) : [];

  if (initialState) {
    var allValid = Object.values(records).map(function (item) {
      return validator.validate(item);
    }).reduce(function (x, y) {
      return x && y;
    });

    if (!allValid) {
      throw new Error("Invalid initial Value");
    }
  }

  var partial = validator.makePartial(); // Create the implementation of the store type now that we have the initial values prepared.

  return (0, _zustand["default"])(function (set, store) {
    return {
      partial: partial,

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
        } else {
          var _errors = store().validator.validate.errors;
          _errors ? set({
            errors: _errors,
            status: "invalid"
          }) : set({
            status: "invalid"
          });
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
      getPartial: function getPartial() {
        return _objectSpread({}, store().partial);
      },

      /**
      * Perform safe partial updates here using immer produce<Datatype>()
      */
      setPartial: function setPartial(partialUpdate) {
        var newPartial = (0, _immer["default"])(store().partial, partialUpdate, function (events) {
          events.forEach(function (e) {
            return console.log(e.op + " " + e.path + " " + JSON.stringify(e.value));
          });
        });
        set({
          partial: newPartial
        });
        store().listeners.forEach(function (callback) {
          return callback("partial", newPartial, "partial-update");
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

      /**
       * Export all items including the partial.
       * Exported loses information about the "active item"
       */
      "export": function _export() {
        return JSON.stringify(_toConsumableArray(store().all()));
      },
      exportPartial: function exportPartial() {
        return JSON.stringify(store().partial);
      }
    };
  });
};

exports.composeStore = composeStore;