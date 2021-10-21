"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeGenericVirtualStore = void 0;

var _immer = _interopRequireDefault(require("immer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

/**
 * @param synchronize function to synchronize into real object
 * @param fetch get the value of the real object
 */
var composeGenericVirtualStore = function composeGenericVirtualStore(create, options) {
  var synchronize = options.synchronize,
      fetch = options.fetch;
  var status = "booting";
  return create(function (set, store) {
    return {
      records: fetch,
      errors: [],
      index: function index() {
        return Object.keys(fetch());
      },
      statusHistory: [],
      setStatus: function setStatus(status) {
        set({
          status: status,
          statusHistory: [].concat(_toConsumableArray(store().statusHistory.slice(0, 9)), [status])
        });
      },
      status: status,
      indexes: {},
      filter: function filter(predicate) {
        return store().filterIndex(predicate).map(function (matchingItemIndex) {
          return store().retrieve(matchingItemIndex);
        });
      },
      remove: function () {
        var _remove = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(idToRemove) {
          return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
              switch (_context2.prev = _context2.next) {
                case 0:
                  store().setStatus("removing");
                  return _context2.abrupt("return", new Promise( /*#__PURE__*/function () {
                    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
                      var index, records;
                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              index = store().index().filter(function (x) {
                                return x !== idToRemove;
                              });

                              if (!(store().index().length === index.length)) {
                                _context.next = 3;
                                break;
                              }

                              return _context.abrupt("return", false);

                            case 3:
                              records = _objectSpread({}, store().records());
                              delete records[idToRemove];
                              _context.next = 7;
                              return synchronize(function (realObject) {
                                realObject = records;
                              });

                            case 7:
                              store().setStatus("idle");
                              resolve("succuss");

                            case 9:
                            case "end":
                              return _context.stop();
                          }
                        }
                      }, _callee);
                    }));

                    return function (_x2, _x3) {
                      return _ref.apply(this, arguments);
                    };
                  }()));

                case 2:
                case "end":
                  return _context2.stop();
              }
            }
          }, _callee2);
        }));

        function remove(_x) {
          return _remove.apply(this, arguments);
        }

        return remove;
      }(),
      insert: function insert(itemIndex, dataToAdd) {
        return new Promise( /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(resolve, reject) {
            var index, records;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    store().setStatus("inserting");
                    index = _toConsumableArray(store().index());
                    records = _objectSpread({}, store().records());
                    records[itemIndex] = dataToAdd;
                    if (!index.includes(itemIndex)) index = [].concat(_toConsumableArray(index), [itemIndex]);
                    _context3.next = 7;
                    return synchronize(function (realObject) {
                      realObject = records;
                    });

                  case 7:
                    store().setStatus("idle");
                    resolve(itemIndex);

                  case 9:
                  case "end":
                    return _context3.stop();
                }
              }
            }, _callee3);
          }));

          return function (_x4, _x5) {
            return _ref2.apply(this, arguments);
          };
        }());
      },
      update: function update(id, itemUpdate) {
        store().setStatus("updating");
        var newItem = (0, _immer["default"])(store().retrieve(id), itemUpdate);
        return store().insert(id, newItem);
      },
      retrieve: function retrieve(itemIndex) {
        var item = store().records()[itemIndex];

        if (!item) {
          console.log("Cache Miss", itemIndex, "virtual-store");
        }

        return item;
      },
      find: function find(predicate) {
        return store().filter(predicate).pop();
      },
      findAndRemove: function findAndRemove(predicate) {
        store().index().filter(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        }).forEach(function (index) {
          store().remove(index);
        });
      },
      filterIndex: function filterIndex(predicate) {
        return store().index().filter(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        });
      },
      findIndex: function findIndex(predicate) {
        return store().index().find(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        });
      },
      all: function all() {
        return store().filter(function (x) {
          return true;
        });
      },
      clear: function () {
        var _clear = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
          return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  store().setStatus("clearing");
                  store().index().forEach(function (i) {
                    store().remove(i);
                  });
                  store().setStatus("idle");

                case 3:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee4);
        }));

        function clear() {
          return _clear.apply(this, arguments);
        }

        return clear;
      }()
    };
  });
};

exports.composeGenericVirtualStore = composeGenericVirtualStore;