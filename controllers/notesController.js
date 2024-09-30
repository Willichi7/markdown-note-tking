const Note = require("../models/noteModel");
const axios = require('axios')
const MarkDownIt = require('markdown-it')
const md = new MarkDownIt()
const fs = require('fs')
const pdf = require('pdf-parse')
const path = require('path')


//upload a file and check grammaer endpoint
const checkGrammerFromFile = async (req, res) => {
   const file = req.file;

   if (!file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
   }

   try {
      let fileContent = '';

      // Read the file content depending on its type
      const fileExtension = path.extname(file.originalname).toLowerCase();
      if (fileExtension === '.txt') {
         // Read text file
         fileContent = fs.readFileSync(file.path, 'utf-8');
      } else if (fileExtension === '.pdf') {
         // Read PDF file and extract text
         const dataBuffer = fs.readFileSync(file.path);
         const pdfData = await pdf(dataBuffer);
         fileContent = pdfData.text;
      } else {
         return res.status(400).json({ success: false, message: 'Unsupported file type.' });
      }

      const response = await axios.post('https://api.languagetool.org/v2/check', {
         text: fileContent,
         language: 'en-US',
         enabledOnly: false, // Use all rules
         motherTongue: 'en', // Specify the mother tongue for better suggestions
         preferredVariants: ['en-US'],
      }, {
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
         }
      });

      if (response.data && response.data.matches) {
         const matches = response.data.matches;

         // Highlight errors in the content
         let highlightedContent = fileContent;

         matches.forEach(match => {
            const errorText = highlightedContent.slice(match.context.offset, match.context.offset + match.context.length);
            const replacement = match.replacements.length > 0 ? match.replacements[0].value : '';

            // Highlight the error in red
            const highlightedError = `<span style="color: red; background-color: yellow;">${errorText}</span>`;
            highlightedContent = highlightedContent.replace(errorText, highlightedError);
         });

         fs.unlinkSync(file.path);

         return res.status(200).json({ success: true, highlightedContent });
      } else {
         return res.status(500).json({ success: false, message: 'Unexpected response format from LanguageTool API' });
      }
   } catch (error) {
      res.status(500).json({ success: false, message: 'Error checking grammar', error: error.response?.data || error.message });
   }
}

// Utility function to escape special characters in the regex pattern
function escapeRegExp(string) {
   return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
//Grammer check endpoint
const checkGrammar = async (req, res) => {
   const { content } = req.body;

   if (!content) {
      return res.status(400).json({ success: false, message: 'No content provided' });
   }

   try {
      // Call the LanguageTool API
      const response = await axios.post('https://api.languagetool.org/v2/check', {
         text: content,
         language: 'en-US',
         enabledOnly: false, // Use all rules
         motherTongue: 'en', // Specify the mother tongue for better suggestions
         preferredVariants: ['en-US'], // Prefer US English rules
       }, {
         headers: {
           'Content-Type': 'application/x-www-form-urlencoded',
         }
       });
       
      if (response.data && response.data.matches) {
         const matches = response.data.matches;
         
         const simplifiedErrors = matches.filter(match => match.replacements.length > 0).map(match => {
            const errorText = content.slice(match.context.offset, match.context.offset + match.context.length);
            const suggestedReplacement = match.replacements[0].value;
            
            // Only consider changes with valid replacements
            if (suggestedReplacement && errorText !== suggestedReplacement) {
              return {
                error: errorText,
                message: match.message,
                suggestion: suggestedReplacement
              };
            }
          });
          
       
         return res.status(200).json({ success: true, grammarErrors: simplifiedErrors });
       } else {
         return res.status(500).json({ success: false, message: 'Unexpected response format from LanguageTool API' });
       } 
      } catch (error) {
      // Log error details for debugging
      console.error('Error checking grammar:', error.message);
      console.error('Request Data:', {
         text: content,
         language: 'en-US',
      });
      res.status(500).json({ success: false, message: 'Error checking grammar', error: error.response?.data || error.message });
   }
}



// save note endpoint
const saveNote = async (req, res) => {
   const {title, content, createdAt} = req.body

   if(!title || !content){
      return res.status(400).json({success: false, messag: 'Title and content are not provided'})
   }

   try {
      const note = new Note({ title, content, createdAt})
      await note.save()
      res.status(200).json({ success: true, message: 'Note created successfully', note})
   } catch (error) {
      res.status(500).json({success: false, message: 'Error saving note', error})
   }
}


// List note endpoint
const listNotes = async (req, res) => {
   try {
      const notes = await Note.find().select('title createdAt content')
      res.status(200).json({success:true, notes})
   } catch (error) {
      res.status(500).json({success: false, message: 'Error fetching list', error})
   }
}
//Render markdown as html
const renderNote = async (req, res) => {

   try {
      const note = await Note.findById(req.params.id)
      if(!note){
         return res.status(404).json({success: false, message: 'Note not found'})
      }
      const htmlContent = md.render(note.content)
      res.status(200).json({success: true, html: htmlContent})
   } catch (error) {
      res.status(500).json({success: false, message: 'error rendering note', error})
   }
}

module.exports = {
   checkGrammar,
   saveNote,
   listNotes,
   renderNote,
   checkGrammerFromFile
};