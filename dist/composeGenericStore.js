"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.composeGenericStore = void 0;

var _immer = _interopRequireDefault(require("immer"));

var _uuid = require("uuid");

var _validator4 = _interopRequireDefault(require("validator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

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

/**
 * Create an indexed storage & validation for vanilla TS
 * @param schema JSON Schema7 object for validating incoming data
 * @param defininition name of the collection (singular) should match json schema (if unspecified, entire schema is considered a definition)
 * @param initial The initial value of the store
 */
var composeGenericStore = function composeGenericStore(create, options) {
  var schema = options.schema,
      definition = options.definition,
      initial = options.initial,
      workspace = options.workspace,
      indexes = options.indexes,
      fetch = options.fetch,
      _query = options.query;
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
  var status = "booting"; // const openDB = IndexDBService.please().open(namespace, version, (db) => {
  //     indexes?.forEach(({ name, keypath }) => {
  //         db.createIndex(name, keypath)
  //     })
  // });
  // Create the implementation of the store type now that we have the initial values prepared.

  return create(function (set, store) {
    return {
      schema: schema,
      workspace: workspace,
      lazyLoadWorkspace: function lazyLoadWorkspace() {
        return new Promise( /*#__PURE__*/function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(complete) {
            var _validator, _workspace;

            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!(typeof store().workspace === "undefined" && typeof workspace === "undefined")) {
                      _context.next = 10;
                      break;
                    }

                    store().setStatus("warming-workspace");
                    _context.next = 4;
                    return store().lazyLoadValidator();

                  case 4:
                    _validator = _context.sent;
                    _workspace = _validator.makeWorkspace();
                    set({
                      workspace: _workspace
                    });
                    complete(_workspace);
                    _context.next = 11;
                    break;

                  case 10:
                    complete(store().workspace || workspace);

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
      query: function query(_ref2, queryOptions, fullText) {
        var identifier = _ref2.identifier,
            page = _ref2.page,
            pageSize = _ref2.pageSize;
        var queryHash = window.btoa(JSON.stringify({
          page: page,
          pageSize: pageSize
        }) + JSON.stringify(queryOptions));
        var queryIndex = store().queryIndex || {};
        var queryHashIndex = queryIndex[queryHash];
        if (typeof queryHashIndex !== "undefined") // We've already got the results to this query stored
          return new Promise(function (resolve) {
            resolve(queryHashIndex.map(function (id) {
              return store().retrieve(id);
            }).filter(Boolean));
          });
        store().setStatus("querying");
        return new Promise(function (resolve, reject) {
          _query ? _query({
            page: page,
            pageSize: pageSize,
            identifier: identifier
          }, queryOptions).then(function (queryResults) {
            var _objectSpread2;

            set({
              status: 'idle',
              queryIndex: _objectSpread(_objectSpread({}, store().queryIndex), {}, (_objectSpread2 = {}, _defineProperty(_objectSpread2, queryHash, queryResults.map(function (x) {
                return x[identifier];
              })), _defineProperty(_objectSpread2, "queryResults", queryResults), _objectSpread2))
            });
            resolve(queryResults);
          })["catch"](function (error) {
            set({
              status: "erroring",
              errors: [{
                message: "Pagination Error",
                dataPath: "",
                keyword: "",
                params: [],
                schemaPath: ""
              }]
            });
            reject(error);
          }) : function () {
            var start = page * pageSize;
            var end = page * pageSize + pageSize;
            var attributes = Object.entries(queryOptions);
            var items = store().filter(function (item) {
              return attributes.map(function (_ref3) {
                var _ref4 = _slicedToArray(_ref3, 2),
                    attribute = _ref4[0],
                    value = _ref4[1];

                var itemValue = item[attribute];
                if (value.length === 0 || typeof value === "undefined") return true;
                if (typeof itemValue === "string" && typeof value === "string") return itemValue === value || itemValue.toLowerCase().includes(value.toLowerCase());
                return itemValue === value || value.includes(itemValue);
              }).reduce(function (a, b) {
                return a && b;
              }, true);
            });
            var queryResults = items.slice(start, end);
            var queryIndexEntry = queryResults.map(function (x) {
              return x[identifier];
            });
            set({
              status: "idle",
              queryIndex: _objectSpread(_objectSpread({}, queryIndex), {}, _defineProperty({}, queryHash, queryIndexEntry))
            });
            resolve(queryResults);
          }();
        });
      },
      lazyLoadValidator: function lazyLoadValidator() {
        return new Promise(function (complete, reject) {
          if (store().status === "warming-validator") {
            reject(new Error("Can't warm a validator while it's loading, you have a race condition. Wait for the Validator to be loaded instead of trying to lazy load it twice"));
          }

          if (typeof store().validator !== "undefined") {
            complete(store().validator);
          } else {
            store().setStatus("warming-validator");

            var _validator2 = new _validator4["default"](schema, definition, {
              uuid: _uuid.v4
            });

            set({
              validator: _validator2
            });
            store().setStatus("idle");
            complete(_validator2);
          }
        });
      },
      indexes: {},
      listeners: [// (id, item, status) => {
        //     switch (status) {
        //         case "clearing":
        //             break;
        //         case "inserting":
        //             openDB.then((db) => {
        //                 db.put(collection, item, id)
        //             })
        //             break;
        //         case "removing":
        //             openDB.then((db) => {
        //                 db.delete(collection, id)
        //             })
        //             break;
        //         default:
        //             break;
        //     }
        // }
      ],
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
      fetch: fetch ? fetch : function (id) {
        return new Promise(function (resolve) {
          resolve(store().retrieve(id));
        });
      },
      filterIndex: function filterIndex(predicate) {
        return store().index.filter(function (itemIndex) {
          return predicate(store().retrieve(itemIndex));
        });
      },
      remove: function () {
        var _remove = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(idToRemove) {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  store().setStatus("removing");
                  return _context3.abrupt("return", new Promise( /*#__PURE__*/function () {
                    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(resolve, reject) {
                      var index, records, oldRecord, active;
                      return regeneratorRuntime.wrap(function _callee2$(_context2) {
                        while (1) {
                          switch (_context2.prev = _context2.next) {
                            case 0:
                              index = store().index.filter(function (x) {
                                return x !== idToRemove;
                              });

                              if (!(store().index.length === index.length)) {
                                _context2.next = 3;
                                break;
                              }

                              return _context2.abrupt("return", false);

                            case 3:
                              records = _objectSpread({}, store().records);
                              oldRecord = _objectSpread({}, records[idToRemove]);
                              delete records[idToRemove];
                              active = store().active;

                              if (active && active === idToRemove) {
                                active = undefined;
                              }

                              set({
                                index: index,
                                records: records,
                                active: active
                              });
                              _context2.next = 11;
                              return Promise.all(store().listeners.map(function (callback) {
                                return callback(idToRemove, oldRecord, "removing");
                              }));

                            case 11:
                              store().setStatus("idle");
                              resolve("succuss");

                            case 13:
                            case "end":
                              return _context2.stop();
                          }
                        }
                      }, _callee2);
                    }));

                    return function (_x3, _x4) {
                      return _ref5.apply(this, arguments);
                    };
                  }()));

                case 2:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3);
        }));

        function remove(_x2) {
          return _remove.apply(this, arguments);
        }

        return remove;
      }(),
      insert: function insert(itemIndex, dataToAdd) {
        var validate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var clearCache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        return new Promise( /*#__PURE__*/function () {
          var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(resolve, reject) {
            var index, _store, lazyLoadValidator, valid, _records, _errors$pop, _validator3, errors;

            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    store().setStatus("inserting");
                    index = _toConsumableArray(store().index);
                    _store = store(), lazyLoadValidator = _store.lazyLoadValidator;

                    if (!validate) {
                      _context4.next = 9;
                      break;
                    }

                    _context4.next = 6;
                    return lazyLoadValidator();

                  case 6:
                    _context4.t0 = _context4.sent.validate(dataToAdd);
                    _context4.next = 10;
                    break;

                  case 9:
                    _context4.t0 = true;

                  case 10:
                    valid = _context4.t0;

                    if (!valid) {
                      _context4.next = 22;
                      break;
                    }

                    _records = _objectSpread({}, store().records);
                    _records[itemIndex] = dataToAdd;
                    if (!index.includes(itemIndex)) index = [].concat(_toConsumableArray(index), [itemIndex]);
                    set({
                      index: index,
                      records: _records,
                      queryIndex: undefined
                    });
                    _context4.next = 18;
                    return Promise.all(store().listeners.map(function (callback) {
                      return callback(itemIndex, _objectSpread({}, dataToAdd), "inserting");
                    }));

                  case 18:
                    store().setStatus("idle");
                    resolve(itemIndex);
                    _context4.next = 29;
                    break;

                  case 22:
                    _context4.next = 24;
                    return lazyLoadValidator();

                  case 24:
                    _validator3 = _context4.sent;

                    _validator3.validate(dataToAdd);

                    errors = _validator3.validate.errors;

                    if (errors) {
                      set({
                        errors: errors
                      });
                      store().setStatus("erroring");
                      store().setStatus("idle");
                    }

                    reject((errors === null || errors === void 0 ? void 0 : (_errors$pop = errors.pop()) === null || _errors$pop === void 0 ? void 0 : _errors$pop.message) || collection + " item not valid!");

                  case 29:
                  case "end":
                    return _context4.stop();
                }
              }
            }, _callee4);
          }));

          return function (_x5, _x6) {
            return _ref6.apply(this, arguments);
          };
        }());
      },
      update: function update(id, itemUpdate) {
        store().setStatus("updating");
        var newItem = (0, _immer["default"])(store().retrieve(id), itemUpdate);
        return store().insert(id, newItem);
      },
      retrieve: function retrieve(itemIndex) {
        var item = store().records[itemIndex];

        if (!item) {
          console.log("Cache Miss", itemIndex, collection);
        }

        return item;
      },
      setActive: function () {
        var _setActive = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(active) {
          return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
              switch (_context5.prev = _context5.next) {
                case 0:
                  store().setStatus("activating");
                  _context5.next = 3;
                  return store().listeners.map(function (callback) {
                    return callback(active, store().retrieve(active), "activating");
                  });

                case 3:
                  set({
                    active: active
                  });
                  store().setStatus("idle");

                case 5:
                case "end":
                  return _context5.stop();
              }
            }
          }, _callee5);
        }));

        function setActive(_x7) {
          return _setActive.apply(this, arguments);
        }

        return setActive;
      }(),
      updateWorkspace: function updateWorkspace(workspaceUpdate) {
        store().setStatus("workspacing");
        return new Promise( /*#__PURE__*/function () {
          var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(resolve, reject) {
            var workspace, newWorkspace;
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    _context6.next = 2;
                    return store().lazyLoadWorkspace();

                  case 2:
                    workspace = _context6.sent;
                    newWorkspace = (0, _immer["default"])(workspace, workspaceUpdate);
                    store().setWorkspaceInstance(newWorkspace);
                    Promise.all(store().listeners.map(function (callback) {
                      return callback("workspace", newWorkspace, "workspacing");
                    })).then(function () {
                      store().setStatus("idle");
                      resolve();
                    })["catch"](function () {
                      store().setStatus("erroring");
                      reject();
                    });

                  case 6:
                  case "end":
                    return _context6.stop();
                }
              }
            }, _callee6);
          }));

          return function (_x8, _x9) {
            return _ref7.apply(this, arguments);
          };
        }());
      },
      setWorkspaceInstance: function setWorkspaceInstance(workspace) {
        var notify = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
        set({
          workspace: workspace
        });
        notify && Promise.all(store().listeners.map(function (callback) {
          return callback("workspace", workspace, "workspacing");
        })).then(function () {
          store().setStatus("idle");
        })["catch"](function () {
          store().setStatus("erroring");
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
        var _store2 = store(),
            active = _store2.active;

        return active ? store().retrieve(active) : undefined;
      },
      "import": function _import(entries) {
        var shouldValidate = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
        var shouldNotify = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
        var shouldClearCache = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
        return new Promise( /*#__PURE__*/function () {
          var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(resolve, reject) {
            var findRecordErrors, errors;
            return regeneratorRuntime.wrap(function _callee9$(_context9) {
              while (1) {
                switch (_context9.prev = _context9.next) {
                  case 0:
                    store().setStatus("importing");

                    findRecordErrors = /*#__PURE__*/function () {
                      var _ref9 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(entries) {
                        var validator;
                        return regeneratorRuntime.wrap(function _callee7$(_context7) {
                          while (1) {
                            switch (_context7.prev = _context7.next) {
                              case 0:
                                _context7.next = 2;
                                return store().lazyLoadValidator();

                              case 2:
                                validator = _context7.sent;
                                Object.values(entries).forEach(function (x) {
                                  if (!validator.validate(x)) {
                                    return validator.validate.errors;
                                  }
                                });
                                return _context7.abrupt("return", []);

                              case 5:
                              case "end":
                                return _context7.stop();
                            }
                          }
                        }, _callee7);
                      }));

                      return function findRecordErrors(_x12) {
                        return _ref9.apply(this, arguments);
                      };
                    }();

                    if (!shouldValidate) {
                      _context9.next = 8;
                      break;
                    }

                    _context9.next = 5;
                    return findRecordErrors(records);

                  case 5:
                    _context9.t0 = _context9.sent;
                    _context9.next = 9;
                    break;

                  case 8:
                    _context9.t0 = [];

                  case 9:
                    errors = _context9.t0;
                    set({
                      errors: errors,
                      records: entries,
                      index: Object.keys(entries),
                      queryIndex: undefined
                    });

                    if (errors.length == 0 && shouldNotify) {
                      Object.entries(entries).forEach( /*#__PURE__*/function () {
                        var _ref11 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(_ref10) {
                          var _ref12, itemIndex, importItem;

                          return regeneratorRuntime.wrap(function _callee8$(_context8) {
                            while (1) {
                              switch (_context8.prev = _context8.next) {
                                case 0:
                                  _ref12 = _slicedToArray(_ref10, 2), itemIndex = _ref12[0], importItem = _ref12[1];
                                  _context8.next = 3;
                                  return Promise.all(store().listeners.map(function (callback) {
                                    return callback(itemIndex, _objectSpread({}, importItem), "inserting");
                                  }));

                                case 3:
                                case "end":
                                  return _context8.stop();
                              }
                            }
                          }, _callee8);
                        }));

                        return function (_x13) {
                          return _ref11.apply(this, arguments);
                        };
                      }());
                    }

                    store().setStatus("idle");
                    errors.length === 0 ? resolve() : reject();

                  case 14:
                  case "end":
                    return _context9.stop();
                }
              }
            }, _callee9);
          }));

          return function (_x10, _x11) {
            return _ref8.apply(this, arguments);
          };
        }());
      },
      clear: function () {
        var _clear = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
          return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
              switch (_context10.prev = _context10.next) {
                case 0:
                  store().setStatus("clearing");
                  store()["import"]({});
                  _context10.next = 4;
                  return Promise.all(store().listeners.map(function (callback) {
                    return callback("", {}, "clearing");
                  }));

                case 4:
                  store().setStatus("idle");

                case 5:
                case "end":
                  return _context10.stop();
              }
            }
          }, _callee10);
        }));

        function clear() {
          return _clear.apply(this, arguments);
        }

        return clear;
      }(),
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