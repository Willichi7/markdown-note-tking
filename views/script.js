// Select elements from the DOM
const checkGrammarBtn = document.getElementById('checkGrammarBtn');
const grammarContent = document.getElementById('grammarContent');
const grammarResult = document.getElementById('grammarResult');

const saveNoteBtn = document.getElementById('saveNoteBtn');
const noteTitle = document.getElementById('noteTitle');
const noteContent = document.getElementById('noteContent');

const listNotesBtn = document.getElementById('listNotesBtn');
const notesList = document.getElementById('notesList');

const renderNoteId = document.getElementById('renderNoteId');
const renderNoteBtn = document.getElementById('renderNoteBtn');
const renderedNote = document.getElementById('renderedNote');

// Function to check grammar
checkGrammarBtn.addEventListener('click', async () => {
    const content = grammarContent.value;

    const response = await fetch('/api/notes/check-grammar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
    });

    const result = await response.json();
    grammarResult.textContent = JSON.stringify(result, null, 2);
});

// Function to save a note
saveNoteBtn.addEventListener('click', async () => {
    const title = noteTitle.value;
    const content = noteContent.value;

    const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content })
    });

    const result = await response.json();
    alert(result.message);
});

// Function to list notes
listNotesBtn.addEventListener('click', async () => {
    const response = await fetch('/api/notes');
    const result = await response.json();

    notesList.innerHTML = ''; // Clear the list
    result.notes.forEach(note => {
        const li = document.createElement('li');
        li.textContent = `${note.title} (Created at: ${new Date(note.createdAt).toLocaleString()})`;
        notesList.appendChild(li);
    });
});

// Function to render note
renderNoteBtn.addEventListener('click', async () => {
    const noteId = renderNoteId.value;

    const response = await fetch(`/api/notes/${noteId}/render`, {
        method: 'GET',
    });

    const result = await response.json();
    renderedNote.innerHTML = result.html; // Set the rendered HTML
});
