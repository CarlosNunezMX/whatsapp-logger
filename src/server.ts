import express, {Application} from 'express';
import chalk from "chalk"
import {Ora} from "ora"
import router from './router';
class Server{
    private app:Application;
    // @ts-ignore
    ora:Ora;
    private port:Number;
    constructor() {
        this.app = express();
        this.port = Number(process.env.PORT) || 3300
        this.settings()
        this.router()
    }
    settings(){
        this.app.use(express.json())
        this.app.use(express.urlencoded({extended:false}))
    }
    listen(){
        this.ora.text = "Iniciando Servidor"
        const thisProps = {
            ora: this.ora,
            port: this.port
        };
        this.app.listen(this.port, function(){
            thisProps.ora.succeed(chalk.green("Servidor inciado en puerto") + chalk.yellow(thisProps.port))
        })
    }
    router(){
        this.app.use("/", router)
    }
}


export const ServerRunner = new Server()