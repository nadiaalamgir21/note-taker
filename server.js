const PORT =  process.env.PORT || 5000;
const fs = require('fs');
const path = require('path');
const totalNotes = require('./db/db.json');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/api/notes', (req, res) => {
    res.json(totalNotes.slice(1));
});

//main route to show landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

//route to handle every not match url
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

//below function handles the note from body and store it in the db.json file
function makeNote(body, notesList) {
    const newNote = body;
    if (!Array.isArray(notesList))
        notesList = [];
    
    if (notesList.length === 0)
        notesList.push(0);

    body.id = notesList[0];
    notesList[0]++;

    notesList.push(newNote);
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify(notesList, null, 2)
    );
    return newNote;
}

app.post('/api/notes', (req, res) => {
    const newNote = makeNote(req.body, totalNotes);
    res.json(newNote);
});


//below function deletes a particular note by selecting it from the notesList and then storing it again in the db.json file
function deleteParticularNote(id, notesList) {
    for (let i = 0; i < notesList.length; i++) {
        let note = notesList[i];

        if (note.id == id) {
            notesList.splice(i, 1);
            fs.writeFileSync(
                path.join(__dirname, './db/db.json'),
                JSON.stringify(notesList, null, 2)
            );

            break;
        }
    }
}

app.delete('/api/notes/:id', (req, res) => {
    deleteParticularNote(req.params.id, totalNotes);
    res.json(true);
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});
