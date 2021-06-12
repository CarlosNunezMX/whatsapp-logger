import Lowdb, { lowdb, LowdbBase, lowdbFp } from "lowdb";
import low from "lowdb";
import JSONFS from "lowdb/adapters/FileSync";
import { Ora } from "ora";

interface Message{
    date:String,
    message: String | string | undefined,
}
export interface user{
    authorNumber: String | string | undefined,
    messages: Array<Message>
}
export interface groupMessage extends Message{
    number: String
}
export interface group{
    groupName: String,
    messages: Array<groupMessage>
}
export interface DataBase{
    users: Array<Message>,
    groups: Array<group>
}
let db:low.LowdbSync<DataBase>;
const CreateConnection = async(sppiner:Ora) => {
    const adapter = new JSONFS<DataBase>("db.json");
    sppiner.text = "Conectando a la Base de Datos";
    db = low(adapter);
    db.defaults({
        users: [],
        groups: []
    }).write();
    sppiner.succeed("Conexión completa")
}

const GetConnection = () => db;


export const DB = {
    CreateConnection,
    GetConnection
}