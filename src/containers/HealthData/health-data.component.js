/* eslint-disable constructor-super */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */

import React from "react";
import { useTranslation } from "react-i18next";

import { rdf, schema } from "rdf-namespaces";
import NotesComponent from "./notes-component";
import {
  TextEditorWrapper,
  TextEditorContainer,
  Header,
  Form,
  FullGridSize,
  WebId
} from "./health-data.style";

async function addNote(note, notesList) {
  const newNote = notesList.addSubject();
  newNote.addRef(rdf.type, schema.TextDigitalDocument);
  newNote.addString(schema.text, note);
  newNote.addDateTime(schema.dateCreated, new Date(Date.now()));

  return await notesList.save([newNote]);
}

export const Editor = ({ ownerWebId }) => {
  
  return (
    <Form>
      <FullGridSize>
        <WebId>
          <b>
            Connected as: <a href={ownerWebId}>{ownerWebId}</a>
          </b>
        </WebId>
      </FullGridSize>
      <FullGridSize>
        <NotesComponent owner = { ownerWebId }/>
      </FullGridSize>
    </Form>
  );
};
 

const HealthData = ({ webId }: Props) => {
  const { t } = useTranslation();
  console.log(webId);
  return (
    <TextEditorWrapper>
      <TextEditorContainer>
        <Header>Health Data</Header>
        <Editor ownerWebId={webId} />
      </TextEditorContainer>
    </TextEditorWrapper>
  );
};

export default HealthData;
