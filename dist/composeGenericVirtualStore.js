"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeGenericVirtualStore = void 0;

var _immer = _interopRequireDefault(require("immer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
      fetch = options.fetch,
      _index = options.index;
  var status = "booting";
  return create(function (set, store) {
    return {
      errors: [],
      index: function index() {
        return Object.keys(fetch().map(function (x) {
          return x[_index];
        }));
      },
      statusHistory: [],
      setStatus: function setStatus(status) {
        set({
          status: status,
          statusHistory: [].concat(_toConsumableArray(store().statusHistory.slice(0, 9)), [status])
        });
      },
      status: status,
      filter: function filter(predicate) {
        return fetch().filter(predicate);
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
                      var remaining;
                      return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                          switch (_context.prev = _context.next) {
                            case 0:
                              remaining = fetch().filter(function (x) {
                                return x[_index] !== idToRemove;
                              });

                              if (!(store().index().length === remaining.length)) {
                                _context.next = 3;
                                break;
                              }

                              return _context.abrupt("return", false);

                            case 3:
                              _context.next = 5;
                              return synchronize(function (realObject) {
                                realObject = remaining;
                              });

                            case 5:
                              store().setStatus("idle");
                              resolve("succuss");

                            case 7:
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
            var newCollection;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    store().setStatus("inserting");
                    newCollection = fetch().filter(function (x) {
                      return x[_index] !== itemIndex;
                    });
                    newCollection.push(dataToAdd);
                    _context3.next = 5;
                    return synchronize(function (realObject) {
                      realObject = newCollection;
                    });

                  case 5:
                    store().setStatus("idle");
                    resolve(itemIndex);

                  case 7:
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
      "import": function _import(records) {
        return synchronize(function (realObject) {
          realObject = records;
        });
      },
      retrieve: function retrieve(itemIndex) {
        var item = fetch().find(function (x) {
          return x[_index] === itemIndex;
        });

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
        return fetch().filter(function (item) {
          return predicate;
        }).map(function (x) {
          return x[_index];
        });
      },
      findIndex: function findIndex(predicate) {
        return store().index().find(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        });
      },
      all: fetch,
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