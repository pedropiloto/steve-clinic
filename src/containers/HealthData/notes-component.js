import React from 'react';

import {
    describeSubject,
    describeDocument,
    describeContainer,
    fetchDocument
  } from "plandoc";
import { space, solid, rdf, schema } from "rdf-namespaces";
import { addPermission, createFileACLIfNotExists } from "./acl-utils";

class NotesComponent extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            notes: [],
            webId: props.owner
        };

        console.log(this.state);
    }

    componentDidMount() {
        
        getNotesDataFromPod(this.state.webId).then((result) => {
            console.log("Got this notes from the pod: " + result);
            this.setState({notes: result})
        }, (err) => {
            console.log("An error occurred when reading the notes from the pod: "  +  err);
        });
    }

    render() {
        const readNotes = this.state.notes;
        console.log("Read notes " + readNotes);
        return this.state.notes.map(note => <p>{ note }</p>)
    }
}

const getNotesDataFromPod = async webId => {
    console.log("webid: " + webId);
    const profile = describeSubject().isFoundAt(webId);
    const storage = describeContainer().isFoundOn(profile, space.storage);
    const publicTypeIndex = describeDocument().isFoundOn(
      profile,
      solid.publicTypeIndex
    );
  
    const notesTypeRegistration = describeSubject()
      .isEnsuredIn(publicTypeIndex)
      .withRef(rdf.type, solid.TypeRegistration)
      .withRef(solid.forClass, schema.TextDigitalDocument);
  
    const notesDoc = describeDocument().isEnsuredOn(
      notesTypeRegistration,
      solid.instance,
      storage
    );
  
    //Create the document if one does not exist already
    const notesFetchedDocument = await fetchDocument(notesDoc);
    let fileUrl = notesFetchedDocument.getAcl().replace(".acl", "");
  
    //create ACL if one does not exist already
    createFileACLIfNotExists(fileUrl, webId);
  
    //Add Note
    //await addNote("New Note " + new Date(), notesFetchedDocument);
  
    // List Notes
    let notes = notesFetchedDocument
      .getSubjectsOfType(schema.TextDigitalDocument)
      .map(x => x.getString(schema.text));
  
    //Share with other users
    addPermission(fileUrl, webId, [
      "https://pedropiloto.solid.community/profile/card#me",
      "https://pedropiloto2.solid.community/profile/card#me"
    ]);
  
    return notes;
};

export default NotesComponent;