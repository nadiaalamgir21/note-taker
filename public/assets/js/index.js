let noteHeading;
let noteContent;
let saveBtn;
let newNoteBtn;
let noteList;

//below code is to get and store the references of the following elements
if (window.location.pathname === '/notes') {
  newNoteBtn = document.querySelector('.new-note');
  noteContent = document.querySelector('.note-textarea');
  saveBtn = document.querySelector('.save-note');
  noteList = document.querySelectorAll('.list-container .list-group');
  noteHeading = document.querySelector('.note-title');
}

//below function sends the data recieved for saving
const saveNoteAPI = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(note),
  });

let currentNote = {};

//below function fetch all the notes from the backend
const fetchNotes = () =>
  fetch('/api/notes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

//below function display the current active note
const displayActiveNote = () => {
  saveBtn.style.display = 'none';

  if (currentNote.id) {
    noteHeading.setAttribute('readonly', true);
    noteContent.setAttribute('readonly', true);
    noteHeading.value = currentNote.title;
    noteContent.value = currentNote.text;
  } else {
    noteHeading.removeAttribute('readonly');
    noteContent.removeAttribute('readonly');
    noteHeading.value = '';
    noteContent.value = '';
  }
};

//below function handles the note saving and sends the data to saveNoteApi method for futher process
const handleNoteSave = () => {
  const newNote = {
    title: noteHeading.value,
    text: noteContent.value,
  };
  saveNoteAPI(newNote).then(() => {
    fetchAndDisplayNotes();
    displayActiveNote();
  });
};

//below function calls the delete api for removing a partucliar note
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

// Delete the clicked note
const handleNoteDelete = (e) => {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  e.stopPropagation();

  const note = e.target;
  const noteId = JSON.parse(note.parentElement.getAttribute('data-note')).id;

  if (currentNote.id === noteId) {
    currentNote = {};
  }

  deleteNote(noteId).then(() => {
    fetchAndDisplayNotes();
    displayActiveNote();
  });
};

// Sets the currentNote and displays it
const handleNoteView = (e) => {
  e.preventDefault();
  currentNote = JSON.parse(e.target.parentElement.getAttribute('data-note'));
  displayActiveNote();
};

// Sets the currentNote to and empty object and allows the user to enter a new note
const handleNewNoteView = (e) => {
  currentNote = {};
  displayActiveNote();
};

const handleRenderSaveBtn = () => {
  if (!noteHeading.value.trim() || !noteContent.value.trim()) {
    saveBtn.style.display = 'none';
  } else {
    saveBtn.style.display = 'inline';
  }
};

// display the list of note heading only
const displayNoteList = async (notes) => {
  let jsonNotes = await notes.json();
  if (window.location.pathname === '/notes') {
    noteList.forEach((el) => (el.innerHTML = ''));
  }

  let noteListItems = [];

  // Returns HTML element with or without a delete button
  const formListItem = (text, delBtn = true) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item');

    const spanEl = document.createElement('span');
    spanEl.innerText = text;
    spanEl.addEventListener('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = document.createElement('i');
      delBtnEl.classList.add(
        'fa',
        'fa-trash',
        'float-right',
        'text-danger',
        'delete-note'
      );
      delBtnEl.addEventListener('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  if (jsonNotes.length === 0) {
    noteListItems.push(formListItem('No saved Notes', false));
  }

  jsonNotes.forEach((note) => {
    const li = formListItem(note.title);
    li.dataset.note = JSON.stringify(note);

    noteListItems.push(li);
  });

  if (window.location.pathname === '/notes') {
    noteListItems.forEach((note) => noteList[0].append(note));
  }
};

// Gets notes from the database and displays them in the sidebar
const fetchAndDisplayNotes = () => fetchNotes().then(displayNoteList);

if (window.location.pathname === '/notes') {
  saveBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNoteView);
  noteHeading.addEventListener('keyup', handleRenderSaveBtn);
  noteContent.addEventListener('keyup', handleRenderSaveBtn);
}

fetchAndDisplayNotes();
