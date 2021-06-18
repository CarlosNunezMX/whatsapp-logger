"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const whatsapp_web_js_1 = require("whatsapp-web.js");
const ora_1 = __importDefault(require("ora"));
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const path_1 = require("path");
const dbMagnament_1 = require("./dbMagnament");
const uuid_1 = require("uuid");
let load = ora_1.default(chalk_1.default.yellow("Esperando autenticación...")).start();
let isLogged = false;
const settings = {
    sessionStorage: "./session",
    prefix: "?"
};
let hasOwnSession;
if (fs_1.default.existsSync(path_1.resolve(__dirname, settings.sessionStorage + ".json"))) {
    const token = require(`${path_1.resolve(__dirname, settings.sessionStorage + ".json")}`);
    hasOwnSession = token;
}
const client = new whatsapp_web_js_1.Client({
    session: hasOwnSession
});
client.on('qr', (qrCode) => {
    // Generate and scan this code with your phone
    isLogged = true;
    const code = qrcode_terminal_1.default.generate(qrCode, { small: true });
    console.log(code);
});
client.on('message', (msg) => __awaiter(void 0, void 0, void 0, function* () {
    const isGroup = (yield msg.getChat()).isGroup;
    const authorNumber = yield msg.getContact();
    load.text = "Nuevo Mensaje";
    if (!isGroup) {
        savePrivate(msg, authorNumber);
    }
    else {
        saveGroup(msg, authorNumber);
    }
}));
const saveGroup = function (msg, authorNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        let Group = (yield msg.getChat());
        let groupName = Group.name;
        let number = authorNumber.id.user;
        let message = msg.body;
        let date = Date().toString();
        const pool = dbMagnament_1.DB.GetConnection();
        let groupsPool = pool.get("groups");
        let group = groupsPool.find(e => e.groupName === groupName);
        let groupValue = group.value();
        if (groupValue) {
            const save = {
                message,
                date,
                number
            };
            group.get("messages")
                .push(save)
                .write();
        }
        else {
            const save = {
                groupName,
                messages: [
                    {
                        date: Date().toString(),
                        message: msg.body,
                        number
                    }
                ]
            };
            groupsPool.push(save).write();
        }
        load.succeed("Mensaje Guardado");
    });
};
const savePrivate = function (msg, authorNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = dbMagnament_1.DB.GetConnection();
        const userPool = pool.get("users");
        // @ts-ignore
        let users = userPool.find(e => e.authorNumber === authorNumber.id.user);
        const value = users.value();
        if (value) {
            load.start();
            if (msg.type === 'image') {
                const media = yield msg.downloadMedia();
                const urlRand = uuid_1.v4();
                let url;
                if (media.mimetype = "image/jpeg") {
                    url = urlRand + ".jpeg";
                }
                else if (media.mimetype = "image/png") {
                    url = urlRand + ".png";
                }
                //@ts-ignore
                fs_1.default.writeFile(url, media.data, 'base64', error => console.log(error));
                //@ts-ignore
                users.get("messages").push({
                    date: Date().toString(),
                    message: url
                }).write();
            }
            else {
                // @ts-ignore
                users.get("messages").push({
                    date: Date().toString(),
                    message: msg.body
                }).write();
            }
        }
        else {
            let save;
            if (msg.type === 'image') {
                const media = yield msg.downloadMedia();
                const urlRand = uuid_1.v4();
                let url;
                if (media.mimetype = "image/jpeg") {
                    url = urlRand + ".jpeg";
                }
                else if (media.mimetype = "image/png") {
                    url = urlRand + ".png";
                }
                //@ts-ignore
                fs_1.default.writeFile(url, media.data, 'base64', error => console.log(error));
                save = {
                    authorNumber: authorNumber.id.user,
                    messages: [
                        {
                            date: Date().toString(),
                            message: url
                        }
                    ]
                };
            }
            else {
                save = {
                    authorNumber: authorNumber.id.user,
                    messages: [
                        {
                            date: Date().toString(),
                            message: msg.body
                        }
                    ]
                };
            }
            // @ts-ignore
            pool.get("users").push(save).write();
        }
        load.succeed("Mensaje Guardado");
    });
};
client.on("authenticated", e => {
    hasOwnSession = e;
    isLogged = true;
    fs_1.default.writeFileSync(path_1.resolve(__dirname, settings.sessionStorage + ".json"), JSON.stringify(e));
    load.succeed("Cliente conectado a Whatsapp!");
    dbMagnament_1.DB.CreateConnection(load);
});
client.on("auth_failture", e => {
    load.stop();
    console.error(e);
    process.exit(1);
});
client.initialize();
setTimeout(() => {
    if (!isLogged) {
        console.log(isLogged);
        load.fail("Error tiempo de espera terminado");
        fs_1.default.rmSync(path_1.resolve(__dirname, settings.sessionStorage + ".json"));
        process.exit(1);
    }
}, 7000);
