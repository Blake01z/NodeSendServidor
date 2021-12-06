const express = require('express');
const router = express.Router();
const {nuevoUsuario} = require('../controllers/usuariosControllers');
const {check} = require('express-validator');
const {autenticarUsuario,usuarioAutenticado} = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/',[
    check('email','Agrega un email valido').isEmail(),
    check('password','El password no debe estar vacio').not().isEmpty(), 
],
    autenticarUsuario
);

router.get('/',
    auth,
    usuarioAutenticado
);


module.exports = router;