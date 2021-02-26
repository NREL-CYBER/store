"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeStore = void 0;

var _immer = _interopRequireDefault(require("immer"));

var _uuid = require("uuid");

var _validator2 = _interopRequireDefault(require("validator"));

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

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var composeStore = function composeStore(options) {
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
  var index = initial ? Object.keys(initial) : []; // Create the implementation of the store type now that we have the initial values prepared.

  return (0, _zustand["default"])(function (set, store) {
    return {
      workspace: function () {
        var _workspace = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
          var validator, workspaceInstance;
          return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!(typeof store().workspaceInstance === "undefined")) {
                    _context.next = 9;
                    break;
                  }

                  _context.next = 3;
                  return store().validator();

                case 3:
                  validator = _context.sent;
                  workspaceInstance = validator.makeWorkspace();
                  setTimeout(function () {
                    set({
                      workspaceInstance: workspaceInstance
                    });
                  }, 100);
                  return _context.abrupt("return", workspaceInstance);

                case 9:
                  return _context.abrupt("return", store().workspaceInstance);

                case 10:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        function workspace() {
          return _workspace.apply(this, arguments);
        }

        return workspace;
      }(),
      validatorInstance: validatorInstance,
      collection: collection,
      index: index,
      records: records,
      errors: [],
      status: "lazy",
      validator: function () {
        var _validator = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
          var _validatorInstance;

          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  if (!(typeof store().validatorInstance !== "undefined")) {
                    _context2.next = 4;
                    break;
                  }

                  return _context2.abrupt("return", store().validatorInstance);

                case 4:
                  _validatorInstance = typeof definition === "string" ? new _validator2["default"](schema, definition) : new _validator2["default"](schema);
                  setTimeout(function () {
                    set({
                      validatorInstance: _validatorInstance,
                      status: "idle"
                    });
                  }, 100);
                  return _context2.abrupt("return", _validatorInstance);

                case 7:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function validator() {
          return _validator.apply(this, arguments);
        }

        return validator;
      }(),
      listeners: [],
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
      insert: function () {
        var _insert = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(dataToAdd, optionalItemIndex) {
          var itemIndex, index, validator, valid, _records, errors;

          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  itemIndex = optionalItemIndex ? optionalItemIndex : (0, _uuid.v4)();
                  set({
                    status: "inserting"
                  });
                  index = _toConsumableArray(store().index);
                  _context3.next = 5;
                  return store().validator();

                case 5:
                  validator = _context3.sent;
                  valid = validator.validate(dataToAdd);

                  if (!valid) {
                    _context3.next = 16;
                    break;
                  }

                  _records = _objectSpread({}, store().records);
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
                  return _context3.abrupt("return", true);

                case 16:
                  errors = validator.validate.errors;
                  errors ? set({
                    errors: errors,
                    status: "invalid"
                  }) : set({
                    status: "invalid"
                  });
                  return _context3.abrupt("return", false);

                case 19:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }));

        function insert(_x, _x2) {
          return _insert.apply(this, arguments);
        }

        return insert;
      }(),
      update: function () {
        var _update = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(id, itemUpdate) {
          var newItem;
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  newItem = (0, _immer["default"])(store().retrieve(id), itemUpdate);
                  _context4.next = 3;
                  return store().insert(newItem, id);

                case 3:
                  return _context4.abrupt("return", _context4.sent);

                case 4:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }));

        function update(_x3, _x4) {
          return _update.apply(this, arguments);
        }

        return update;
      }(),
      retrieve: function retrieve(itemIndex) {
        return store().records[itemIndex];
      },
      setActive: function setActive(active) {
        set({
          active: active
        });
      },
      setWorkspace: function () {
        var _setWorkspace = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(workspaceUpdate) {
          var workspace, newWorkspace;
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  _context5.next = 2;
                  return store().workspace();

                case 2:
                  workspace = _context5.sent;
                  newWorkspace = (0, _immer["default"])(workspace, workspaceUpdate);
                  store().setWorkspaceInstance(newWorkspace);

                case 5:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        }));

        function setWorkspace(_x5) {
          return _setWorkspace.apply(this, arguments);
        }

        return setWorkspace;
      }(),
      setWorkspaceInstance: function setWorkspaceInstance(workspaceInstance) {
        set({
          workspaceInstance: workspaceInstance
        });
        store().listeners.forEach(function (callback) {
          return callback("workspace", workspaceInstance, "workspace-update");
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

        var findRecordErrors = function findRecordErrors(entries) {
          Object.values(entries).forEach( /*#__PURE__*/function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(x) {
              var validator;
              return regeneratorRuntime.wrap(function _callee6$(_context6) {
                while (1) {
                  switch (_context6.prev = _context6.next) {
                    case 0:
                      _context6.next = 2;
                      return store().validator();

                    case 2:
                      validator = _context6.sent;

                      if (validator.validate(x)) {
                        _context6.next = 5;
                        break;
                      }

                      return _context6.abrupt("return", validator.validate.errors);

                    case 5:
                    case "end":
                      return _context6.stop();
                  }
                }
              }, _callee6);
            }));

            return function (_x6) {
              return _ref.apply(this, arguments);
            };
          }());
          return [];
        };

        var errors = shouldValidate ? findRecordErrors(records) : [];
        set({
          errors: errors,
          records: entries,
          index: Object.keys(entries)
        });

        if (errors.length == 0) {
          Object.entries(entries).forEach(function (_ref2) {
            var _ref3 = _slicedToArray(_ref2, 2),
                itemIndex = _ref3[0],
                importItem = _ref3[1];

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
      "export": function _export() {
        return JSON.stringify(store().records);
      },
      exportWorkspace: function exportWorkspace() {
        return JSON.stringify(store().workspace());
      }
    };
  });
};

exports.composeStore = composeStore;