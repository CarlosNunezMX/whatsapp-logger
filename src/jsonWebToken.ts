//import JSONWTK from "node-jose"
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
const secret = "My awesome key";
export function CreateToken(session:string){
    if(!session){
        return {
            state: 400
        }
    }else{
        const token = jwt.sign(session,secret);
        return {
            state: 200,
            token
        }
    }
}

export const checkSession = (req:Request,res:Response, next:NextFunction) => {
    const header = req.headers.login;
    if(!header){
        return res.status(400).json({
            message: "No tienes permisos de entrar ahí"
        })
    }
    console.log(header);
    
    let verification = jwt.verify(String(header),secret);
    if(!verification){
        return res.status(400).json({
            message: "No tienes permisos de entrar ahí, Token no valido"
        })
    }
    next()
}