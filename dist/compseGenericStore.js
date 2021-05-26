"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeGenericStore = void 0;

var _immer = _interopRequireDefault(require("immer"));

var _uuid = require("uuid");

var _validator3 = _interopRequireDefault(require("validator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var composeGenericStore = function composeGenericStore(create, options) {
  var schema = options.schema,
      definition = options.definition,
      initial = options.initial;
  var validator = options.validator;
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
      schema: schema,
      workspace: undefined,
      lazyLoadWorkspace: function lazyLoadWorkspace() {
        return new Promise( /*#__PURE__*/function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(complete) {
            var _validator, workspace;

            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!(typeof store().workspace === "undefined")) {
                      _context.next = 10;
                      break;
                    }

                    store().setStatus("warming-workspace");
                    _context.next = 4;
                    return store().lazyLoadValidator();

                  case 4:
                    _validator = _context.sent;
                    workspace = _validator.makeWorkspace();
                    set({
                      workspace: workspace
                    });
                    complete(workspace);
                    _context.next = 11;
                    break;

                  case 10:
                    complete(store().workspace);

                  case 11:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }());
      },
      validator: validator,
      collection: collection,
      index: index,
      records: records,
      errors: [],
      statusHistory: [],
      setStatus: function setStatus(status) {
        set({
          status: status,
          statusHistory: [].concat(_toConsumableArray(store().statusHistory.slice(0, 9)), [status])
        });
      },
      status: status,
      lazyLoadValidator: function lazyLoadValidator() {
        return new Promise(function (complete, reject) {
          if (store().status === "warming-validator") {
            reject(new Error("Can't warm a validator while it's loading, you have a race condition. Wait for the Validator to be loaded instead of trying to lazy load it twice"));
          }

          if (typeof store().validator !== "undefined") {
            complete(store().validator);
          } else {
            store().setStatus("warming-validator");

            var _validator2 = typeof definition === "string" ? new _validator3["default"](schema, definition) : new _validator3["default"](schema);

            set({
              validator: _validator2
            });
            store().setStatus("idle");
            complete(_validator2);
          }
        });
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
      fetch: function fetch(id) {
        store().setStatus("fetching");
        return new Promise(function (resolve, reject) {
          var cached = store().retrieve(id);
          store().setStatus("idle");
          store().listeners.forEach(function (listener) {
            listener(id, _objectSpread({}, cached), "fetching");
          });

          if (cached) {
            resolve(cached);
          } else {
            reject();
          }
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
        return new Promise( /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
            var itemIndex, index, validator, valid, _records, _errors$pop, errors;

            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    store().setStatus("inserting");
                    itemIndex = optionalItemIndex ? optionalItemIndex : (0, _uuid.v4)();
                    index = _toConsumableArray(store().index);
                    _context2.next = 5;
                    return store().lazyLoadValidator();

                  case 5:
                    validator = _context2.sent;
                    valid = validator.validate(dataToAdd);

                    if (valid) {
                      _records = _objectSpread({}, store().records);
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
                      resolve(itemIndex);
                    } else {
                      errors = validator.validate.errors;

                      if (errors) {
                        set({
                          errors: errors
                        });
                        store().setStatus("erroring");
                        store().setStatus("idle");
                      }

                      reject((errors === null || errors === void 0 ? void 0 : (_errors$pop = errors.pop()) === null || _errors$pop === void 0 ? void 0 : _errors$pop.message) || collection + " item not valid!");
                    }

                  case 8:
                  case "end":
                    return _context2.stop();
                }
              }
            }, _callee2);
          }));

          return function (_x2, _x3) {
            return _ref2.apply(this, arguments);
          };
        }());
      },
      insert_and_skip_validatation: function insert_and_skip_validatation(dataToAdd, optionalItemIndex) {
        store().setStatus("inserting");
        var itemIndex = optionalItemIndex ? optionalItemIndex : (0, _uuid.v4)();

        var index = _toConsumableArray(store().index);

        var records = _objectSpread(_objectSpread({}, store().records), {}, _defineProperty({}, itemIndex, dataToAdd));

        if (!index.includes(itemIndex)) index = [].concat(_toConsumableArray(index), [itemIndex]);
        set({
          index: index,
          records: records
        });
        store().listeners.forEach(function (callback) {
          return callback(itemIndex, _objectSpread({}, dataToAdd), "inserting");
        });
        store().setStatus("idle");
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
      updateWorkspace: function updateWorkspace(workspaceUpdate) {
        store().setStatus("workspacing");
        return new Promise( /*#__PURE__*/function () {
          var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
            var workspace, newWorkspace;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    _context3.next = 2;
                    return store().lazyLoadWorkspace();

                  case 2:
                    workspace = _context3.sent;
                    newWorkspace = (0, _immer["default"])(workspace, workspaceUpdate);
                    store().setWorkspaceInstance(newWorkspace);
                    store().setStatus("idle");
                    resolve();

                  case 7:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3);
          }));

          return function (_x4, _x5) {
            return _ref3.apply(this, arguments);
          };
        }());
      },
      setWorkspaceInstance: function setWorkspaceInstance(workspace) {
        set({
          workspace: workspace
        });
        store().listeners.forEach(function (callback) {
          return callback("workspace", workspace, "workspacing");
        });
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
        var shouldNotify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        return new Promise( /*#__PURE__*/function () {
          var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(resolve, reject) {
            var findRecordErrors, errors;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    store().setStatus("importing");

                    findRecordErrors = /*#__PURE__*/function () {
                      var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(entries) {
                        var validator;
                        return regeneratorRuntime.wrap(function _callee4$(_context4) {
                          while (1) {
                            switch (_context4.prev = _context4.next) {
                              case 0:
                                _context4.next = 2;
                                return store().lazyLoadValidator();

                              case 2:
                                validator = _context4.sent;
                                Object.values(entries).forEach(function (x) {
                                  if (!validator.validate(x)) {
                                    return validator.validate.errors;
                                  }
                                });
                                return _context4.abrupt("return", []);

                              case 5:
                              case "end":
                                return _context4.stop();
                            }
                          }
                        }, _callee4);
                      }));

                      return function findRecordErrors(_x8) {
                        return _ref5.apply(this, arguments);
                      };
                    }();

                    if (!shouldValidate) {
                      _context5.next = 8;
                      break;
                    }

                    _context5.next = 5;
                    return findRecordErrors(records);

                  case 5:
                    _context5.t0 = _context5.sent;
                    _context5.next = 9;
                    break;

                  case 8:
                    _context5.t0 = [];

                  case 9:
                    errors = _context5.t0;
                    set({
                      errors: errors,
                      records: entries,
                      index: Object.keys(entries)
                    });

                    if (errors.length == 0 && shouldNotify) {
                      Object.entries(entries).forEach(function (_ref6) {
                        var _ref7 = _slicedToArray(_ref6, 2),
                            itemIndex = _ref7[0],
                            importItem = _ref7[1];

                        store().listeners.forEach(function (callback) {
                          return callback(itemIndex, _objectSpread({}, importItem), "inserting");
                        });
                      });
                    }

                    store().setStatus("idle");
                    errors.length === 0 ? resolve() : reject();

                  case 14:
                  case "end":
                    return _context5.stop();
                }
              }
            }, _callee5);
          }));

          return function (_x6, _x7) {
            return _ref4.apply(this, arguments);
          };
        }());
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
        var workspaceJSON = JSON.stringify(store().workspace);
        store().setStatus("idle");
        return workspaceJSON;
      }
    };
  });
};

exports.composeGenericStore = composeGenericStore;