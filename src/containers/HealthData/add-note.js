import { rdf, schema } from "rdf-namespaces";

export default async function addNote(note, notesList) {

    const newNote = notesList.addSubject();
    newNote.addRef(rdf.type, schema.TextDigitalDocument);
    newNote.addString(schema.text, note);
    newNote.addDateTime(schema.dateCreated, new Date(Date.now()));
  
    return await notesList.save([newNote]);
}
