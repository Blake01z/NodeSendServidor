const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');

const nuevoUsuario = async (req, res) =>{
    //mostrar mensajes de errores de express validator
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }

    //verificar si el usuario ya esta registrado
    const {email, password} = req.body;

    let usuario = await Usuario.findOne({email});

    if(usuario){
        return res.status(400).json({msg: 'El usuario ya esta registrado'})
    }

    //crear un nuevo usuario
    usuario = new Usuario(req.body);

    // Hashear el passwors
    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);

    try{
        await usuario.save();
        res.status(200).json({msg:'Usuario creado correctamente'});
    }catch(error){
        console.log(error);
    }



}


module.exports ={
    nuevoUsuario,

}