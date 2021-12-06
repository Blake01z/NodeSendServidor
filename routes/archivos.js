const express = require('express');
const router = express.Router();
const {subirArchivo,eliminarArchivo,descargar} = require('../controllers/archivosController');
const auth = require('../middleware/auth');

//subida de archivos
const multer = require('multer');
const upload = multer({dest: './uploads/'})

router.post('/',
    auth,
    subirArchivo
);

router.get('/:archivo',
    descargar,
    eliminarArchivo
);

module.exports = router;