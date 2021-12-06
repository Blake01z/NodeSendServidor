const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({path: 'variables.env'});
const {validationResult} = require('express-validator');


const autenticarUsuario = async (req,res, next) =>{
    //mostrar mensajes de errores de express validator
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }


    //buscar el usuario para ver si esta registrado
    const {email, password} = req.body;
    const usuario = await Usuario.findOne({email});

    if(!usuario){
        res.status(401).json({msg:'El usuario no existe'});
        return next();
    }

    //verificar el usuario y autenticar el password
    if(bcrypt.compareSync(password, usuario.password)){
        
        //Crear JWT
        const token = jwt.sign({
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
        },process.env.SECRETA,{
            expiresIn: '2h'
        });
        res.json({token});

    }else{
        res.status(401).json({msg: 'El password es incorrecto'});
        return next();
    }

}


const usuarioAutenticado = (req,res,next) => {
    res.json({usuario: req.usuario});
}




module.exports = {
    autenticarUsuario,
    usuarioAutenticado
}