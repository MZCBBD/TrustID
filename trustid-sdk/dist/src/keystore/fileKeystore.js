"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileKeystore = void 0;
/*

Copyright 2020 Telefónica Digital España. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0

*/
var keystore_1 = require("./keystore");
var wallet_1 = require("../wallet");
var fs_1 = __importDefault(require("fs"));
var FileKeystore = /** @class */ (function (_super) {
    __extends(FileKeystore, _super);
    function FileKeystore(type, dir) {
        if (type === void 0) { type = "file"; }
        if (dir === void 0) { dir = './keystore/keystore'; }
        var _this = _super.call(this) || this;
        _this.WALLET_SRCS = [
            "file",
            "empty",
            "localStorage"
        ];
        // Reset keystore from file if existing.
        _this.loadKeystore(type, dir);
        _this.dir = dir;
        return _this;
    }
    /** SaveKeystore with all the DIDs. Store status of the wallet  */
    FileKeystore.prototype.saveKeystore = function (type) {
        if (type === void 0) { type = "file"; }
        switch (type) {
            case "file": {
                fs_1.default.writeFileSync(this.dir, JSON.stringify(this.keystore), 'utf8');
                break;
            }
            case "localStorage": {
                localStorage.setItem('keystore', JSON.stringify(this.keystore));
                break;
            }
            default: {
                throw new Error("Storage type not implemented.");
            }
        }
    };
    /** LoadKeystore loads the stored status of a wallet */
    FileKeystore.prototype.loadKeystore = function (source, dir) {
        if (dir === void 0) { dir = ""; }
        // If type not supported throw error.
        if (!Object.values(this.WALLET_SRCS).includes(source)) {
            throw new Error("Wallet source to initialize not valid!");
        }
        switch (source) {
            case "file": {
                var auxKs = void 0;
                try {
                    var val = fs_1.default.readFileSync(dir, 'utf8');
                    auxKs = JSON.parse(val);
                }
                catch (_a) {
                    auxKs = {};
                }
                for (var k in auxKs) {
                    var emptyDID = new wallet_1.DID("RSA", undefined);
                    emptyDID.loadFromObject(auxKs[k]);
                    auxKs[k] = emptyDID;
                }
                this.keystore = auxKs;
                // this.keystore = JSON.parse(fs.readFileSync(dir, 'utf8'))
                break;
            }
            case "localStorage": {
                var val = localStorage.getItem('keystore');
                this.keystore = JSON.parse(val || "");
                break;
            }
            default: {
                throw new Error("Storage type not implemented.");
            }
        }
    };
    /** getKey gets a key from the keystore of the wallet */
    FileKeystore.prototype.getDID = function (id) {
        if (id === void 0) { id = "default"; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // We only get from inMemory keystore for performance purposes.
                if (!(this.keystore.hasOwnProperty(id))) {
                    // throw new Error("This DID does not exist in the keystore.");
                    return [2 /*return*/, {}];
                }
                return [2 /*return*/, this.keystore[id]];
            });
        });
    };
    /** Stores DID in the permanent keystore */
    FileKeystore.prototype.storeDID = function (did) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Check if did already in keystore and save keystore.
                // If not add DID and save keystore.
                try {
                    if (this.keystore[did.id] == undefined) {
                        // Add in inmemory storage
                        this.keystore[did.id] = did;
                    }
                    this.saveKeystore();
                    return [2 /*return*/, true];
                }
                catch (_b) {
                    return [2 /*return*/, false];
                }
                return [2 /*return*/];
            });
        });
    };
    return FileKeystore;
}(keystore_1.Keystore));
exports.FileKeystore = FileKeystore;
