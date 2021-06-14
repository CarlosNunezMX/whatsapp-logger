import {Router,Request,Response, NextFunction} from "express";
import {DB,passwordEncrypt} from "./dbMagnament";
import {checkSession, CreateToken} from "./jsonWebToken"
import {v4 as uuid} from "uuid"
const router = Router();

router.get("/chats/getAll",checkSession,function(req:Request,res:Response,next:NextFunction){
    let pool = DB.GetConnection();
    return res.json({
        users: pool.get("users"),
        groups: pool.get("groups")
    })
})
router.post("/api/register",function(req:Request,res:Response){
    console.log(req.body);
    
    let {name, password} = req.body;
    const id = uuid();
    password = passwordEncrypt().encrypt(password);
    const pool = DB.GetConnection();
    const ownerPool = pool.get("owner")
    if(ownerPool.value().id){
        return res.status(403).send("Ya hay un usuario registrado!");
    }
    ownerPool.set("password",password).write()
    ownerPool.set("name",name).write(),
    ownerPool.set("id",id).write()
    return res.status(200).json({
        token: CreateToken(id)
    })
})
router.post("/api/login",function(req:Request,res:Response){
    const {password,name} = req.body
    if(!password || !name){
        return res.status(404).json({
            message: "Por favor introduzca usuario y contraseña"
        })
    }
    const pool = DB.GetConnection();
    const ownerPool = pool.get("owner");
    if(!ownerPool.value()){
        return res.status(400).json({
            message:"Necesitas un usuario para poder iniciar sesión!"
        })
    }
    const user = ownerPool.value();
    if(user.name !== name){
        return res.status(400).json({
            message: "Usuario incorrecto"
        })
    }
    const DePassword = passwordEncrypt().decrypt(user.password);
    if(DePassword !== password){
        return res.status(400).json({
            message: "Contraseña incorrecta"
        })
    }
    let token = CreateToken(String(user.id))

    return res.status(200).json({
        token
    })
})


export default router;