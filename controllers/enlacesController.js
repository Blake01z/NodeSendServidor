const Enlaces = require('../models/Enlace');
const shortid = require('shortid');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');


const nuevoEnlace = async (req,res, next) =>{
    
    //revisar si hay errores
    const errores = validationResult(req);
    if(!errores.isEmpty()){
        return res.status(400).json({errores: errores.array()});
    }

    //Crear un objeto de Enlace
    const {nombre_original,nombre} = req.body;
    
    const enlace = new Enlaces();
    enlace.url = shortid.generate();
    enlace.nombre = nombre;
    enlace.nombre_original = nombre_original;
    
    // si el usuario esta autenticado
    if(req.usuario){
        const {password, descargas} = req.body;

        //Asignar a enlace el numero de descargas
        if(descargas){
            enlace.descargas = descargas;
        }
        //asginar un password
        if(password){
            const salt = await bcrypt.genSalt(10);
            enlace.password = await bcrypt.hash(password, salt);
        }

        //asginar el autor
        enlace.autor = req.usuario.id;
    }

    //Almacenar en la BD
    try{
        await enlace.save();
        return res.json({msg: `${enlace.url}`})
        next();
    }catch(error){
        console.log(error)
    }
}

//Obtine un listado de todos los enlaces
const todosEnlaces = async (req,res) =>{
    try{
        const enlaces = await Enlaces.find({}).select('url -_id');
        res.json({enlaces});
    }catch(error){
        console.log(error);
    }
}

//Retorna si el enlace tiene password o no
const tienePassword = async (req,res,next) =>{
    const {url} = req.params;

    console.log(url);

    //Verificar si existe el enlace
    const enlace = await Enlaces.findOne({url});

    if(!enlace){
        res.status(404).json({msg: 'Ese enlace no existe'});
        next();
    }

    if(enlace.password){
        return res.json({password:true, enlace:enlace.url});
    }
    next();
}

//Verifica si el password es correcto
const verificarPassword = async (req,res,next) =>{
    const {url} = req.params;
    const {password} = req.body;

    //consultar por el enlace
    const enlace = await Enlaces.findOne({url});

    //Verificar el password
    if(bcrypt.compareSync(password,enlace.password)){
        //permitir al usuario descargar
        next();
    }else{
        return res.status(401).json({msg:'Password incorrecto.'})
    }


}


//Obtener el enlace
obtenerEnlace = async (req,res, next) =>{
    
    const {url} = req.params;

    //Verificar si existe el enlace
    const enlace = await Enlaces.findOne({url});

    if(!enlace){
        res.status(404).json({msg: 'Ese enlace no existe'});
        next();
    }
    //si el enalce existe
    res.json({archivo: enlace.nombre, password:false})

    next();

}


module.exports ={
    nuevoEnlace,
    obtenerEnlace,
    todosEnlaces,
    tienePassword,
    verificarPassword
}