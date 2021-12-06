const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const Enlaces = require('../models/Enlace');

const subirArchivo = async (req, res, next) =>{

    const configuracionMulter = {
        limits: {fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024}, //si el usuario esta autenticado
        storage: fileStorage = multer.diskStorage({
            destination: (req, file, cb) => {
                cb(null,__dirname + '/../uploads')
            },
            filename: (req, file, cb) =>{
                const extension = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
                cb(null, `${shortid.generate()}${extension}`);
            },
            // fileFilter:(req,file,cb)=>{  permite filtrar los archivos para solo aceptar los que queremos
            //     if(file.minetype === 'application/pdf'){
            //         return cb(null, true);
            //     }
            // }
        })
    }
    
    const upload = multer(configuracionMulter).single('archivo');



    upload(req,res, async (error) => {
        console.log(req.file)
        if(!error){
            res.json({archivo: req.file.filename});
        }else{
            console.log(error);
            next();
        }
    })
}

const eliminarArchivo = async(req,res) =>{

    try{
        fs.unlinkSync(__dirname + `/../uploads/${req.archivo}`);
        console.log('Archivo Eliminado')
    }catch (error){
        console.log(error);
    }
}

//Descarga un archivo
const descargar = async (req, res, next) => {

    //Obtiene el enlace
    const {archivo} = req.params;
    const enlace = await Enlaces.findOne({nombre: archivo})

    const archivoDescarga = __dirname + '/../uploads/' + archivo;
    res.download(archivoDescarga);

    //eliminar el archivo y entrada de la bd
    // Si las descargas son iguales a 1 - Borrar la entrada y borrar el archivo
    const {descargas, nombre} = enlace;

    if(descargas === 1 ){

        //elimianr el archivo
        req.archivo = nombre;

        //eliminar la entrada de la bd
        await  Enlaces.findOneAndRemove(enlace.id);
        next();

    }else{
        // Si las descargas son mayores a 1 restar una descarga
        enlace.descargas--;
        await enlace.save();
    }
}



module.exports = {
    subirArchivo,
    eliminarArchivo,
    descargar
}