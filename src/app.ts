import { Client, Contact, GroupChat, Message } from "whatsapp-web.js"
import ora, {Ora} from "ora" 
import qr from "qrcode-terminal" 
import chalk from "chalk" 
import fs from "fs" 
import {resolve} from "path"
import { DB, group, groupMessage, user } from "./dbMagnament" 
let load:Ora = ora(chalk.yellow("Esperando autenticación...")).start()
let isLogged = false;
const settings = {
    sessionStorage: "./session",
    prefix: "?"
}
let hasOwnSession;
if (fs.existsSync(resolve(__dirname,settings.sessionStorage + ".json"))) {
    const token = require(`${resolve(__dirname,settings.sessionStorage + ".json")}`)
    hasOwnSession = token
}

const client = new Client({
    session: hasOwnSession
});

client.on('qr', (qrCode) => {
    // Generate and scan this code with your phone
    isLogged = true
    const code = qr.generate(qrCode, { small: true })
    console.log(code)
});


client.on('message', async msg => {
    const isGroup = (await msg.getChat()).isGroup;
    const authorNumber = await msg.getContact();
    load.text = "Nuevo Mensaje"
    if(!isGroup){
        savePrivate(msg,authorNumber);
    }else{
        saveGroup(msg,authorNumber)
    }
});

const saveGroup = async function(msg:Message, authorNumber:Contact){
    let Group = (await msg.getChat())
    let groupName = Group.name;
    let groupID = Group.id;

    let number = authorNumber.id.user;
    let message = msg.body;
    let date = Date().toString();

    const pool = DB.GetConnection()
    let groupsPool = pool.get("groups");
    let group = groupsPool.find(e => String(e.groupID) === String(groupID));
    let groupValue = group.value()
    if(groupValue){
        const save:groupMessage = {
            message,
            date,
            number
        }
        group.get("messages")
            .push(save)
            .write()
    }else{
        const save:group = {
            groupID:String(groupID),
            groupName,
            messages: [
                {
                    date: Date().toString(),
                    message: msg.body,
                    number
                }
            ]
        }
        groupsPool.push(save).write()
    }
    load.succeed("Mensaje Guardado")
}

const savePrivate = function(msg:Message,authorNumber:Contact){
    const pool = DB.GetConnection()
    const userPool = pool.get("users");
    
    let users = userPool.find(e => e.authorNumber === authorNumber.id.user);
    const value = users.value()

    if(value){
        load.start()
        users.get("messages").push({
            date: Date().toString(),
            message: msg.body
        }).write()
    }
    else{
        const save:user = {
            authorNumber: authorNumber.id.user,
             messages: [
            {
                date: Date().toString(),
                message: msg.body 
            }]
        } 
        pool.get("users").push(save).write()
    }
    load.succeed("Mensaje Guardado")
}
client.on("authenticated", e => {
    hasOwnSession = e;
    isLogged = true;
    fs.writeFileSync(resolve(__dirname,settings.sessionStorage + ".json"), JSON.stringify(e));
    load.succeed("Cliente conectado a Whatsapp!")
    DB.CreateConnection(load)
})
client.on("auth_failture", e => {
    load.stop();
    console.error(e)
    process.exit(1)
})
client.initialize();
setTimeout(() => {
    if (!isLogged) {
        console.log(isLogged);
        load.fail("Error tiempo de espera terminado");
        fs.rmSync(resolve(__dirname,settings.sessionStorage + ".json"));
        process.exit(1);
    }
}, 7000)