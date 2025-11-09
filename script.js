// main.js (Firebase Modular API)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set, onChildAdded, onChildChanged, onChildRemoved, update, remove } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBMHkFe8wCC0UUSJq_EmFERtdSznd77qho",
  authDomain: "project-3---isaac-ng.firebaseapp.com",
  databaseURL: "https://project-3---isaac-ng-default-rtdb.firebaseio.com",
  projectId: "project-3---isaac-ng",
  storageBucket: "project-3---isaac-ng.firebasestorage.app",
  messagingSenderId: "688669865765",
  appId: "1:688669865765:web:f5481b45c3e49b53524ccc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Sign in anonymously
signInAnonymously(auth).catch(err => {
  console.error("Auth error:", err);
});

// Notes ref
const notesRef = ref(db, "notes");

// --- Draggable settings ---
const draggableNote = {
  cancel: ".editable",
  zIndex: 3000,
  stack: ".note"
};

$(document).ready(function () {
  // Firebase listeners
  onChildAdded(notesRef, (snap) => {
    const note = snap.val();
    const id = snap.key;
    addNoteToBoard(id, note);
  });

  onChildChanged(notesRef, (snap) => {
    const note = snap.val();
    const id = snap.key;
    updateNoteOnBoard(id, note);
  });

  onChildRemoved(notesRef, (snap) => {
    const id = snap.key;
    $(`#${id}`).remove();
  });

  // Add new note
  $("#btn-addNote").click(() => {
    const newRef = push(notesRef);
    const newNote = { top: 100, left: 100, text: "" };
    set(newRef, newNote)
      .then(() => console.log("Note added:", newRef.key))
      .catch(err => console.error("Failed to add note:", err));
  });
});

// --- DOM Functions ---
function addNoteToBoard(id, note) {
  if ($(`#${id}`).length) return;
  const html = createNoteHTML(id, note.left, note.top, note.text);
  $("#board").append(html);

  $(`#${id}`).draggable({
    ...draggableNote,
    stop: function (e, ui) {
      update(ref(db, "notes/" + id), {
        left: ui.position.left,
        top: ui.position.top
      }).catch(err => console.error("Move failed:", err));
    }
  });

  $(`#${id} .delete`).click(() =>
    remove(ref(db, "notes/" + id)).catch(err => console.error("Delete failed:", err))
  );

  $(`#${id} .editable`).on("blur", function () {
    update(ref(db, "notes/" + id), {
      text: $(this).text()
    }).catch(err => console.error("Text update failed:", err));
  });
}

function updateNoteOnBoard(id, note) {
  const $n = $(`#${id}`);
  if (!$n.length) return;
  $n.css({ top: note.top, left: note.left });
  $n.find(".editable").text(note.text || "");
}

function createNoteHTML(id, left, top, text = "") {
  return `
    <div class="note" id="${id}" style="left:${left || 100}px; top:${top || 100}px">
      <div class="toolbar"><span class="delete">&times;</span></div>
      <div class="editable" contenteditable="true">${escapeHtml(text)}</div>
    </div>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;"
  }[m]));
}
