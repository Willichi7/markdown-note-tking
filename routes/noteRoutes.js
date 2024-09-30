const express = require('express')
const router = express.Router()
const multer = require('multer')
const { checkGrammar, saveNote, listNotes, renderNote, checkGrammerFromFile } = require('../controllers/notesController');


const upload = multer({
   dest: 'uploads/'
})

//check grammer end point
router.post('/check-grammar', checkGrammar)

// save notes endpoint
router.post('/save', saveNote)

//List notes endpoint
router.get('/list', listNotes)

//Render markdown as html
router.get('/render/:id', renderNote)

router.post('/check-grammar-file', upload.single('file'), checkGrammerFromFile);

module.exports = router