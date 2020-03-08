/* eslint-disable constructor-super */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SolidAuth from "solid-auth-client";
import { successToaster, errorToaster } from "@utils";
import { Table, Tr } from "styled-table-component";
import {
  describeSubject,
  VirtualDocument,
  describeDocument,
  describeContainer,
  Reference,
  fetchDocument
} from "plandoc";
import { space, solid, rdf, schema } from "rdf-namespaces";

import { addPermission, createFileACLIfNotExists } from "./acl-utils";
import {
  TextEditorWrapper,
  TextEditorContainer,
  Header,
  Form,
  FullGridSize,
  Button,
  Label,
  Input,
  WebId
} from "./health-data.style";

const getPodData = async webId => {
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
  await addNote("1,1", notesFetchedDocument);

  // List Notes
  let notes = notesFetchedDocument
    .getSubjectsOfType(schema.TextDigitalDocument)
    .map(x => x.getString(schema.text));
  console.log("p:", notes);

  //Share with other users
  addPermission(fileUrl, webId, [
    "https://pedropiloto.solid.community/profile/card#me",
    "https://pedropiloto2.solid.community/profile/card#me"
  ]);
};

async function addNote(note, notesList) {
  const newNote = notesList.addSubject();
  newNote.addRef(rdf.type, schema.TextDigitalDocument);
  newNote.addString(schema.text, note);
  newNote.addDateTime(schema.dateCreated, new Date(Date.now()));

  return await notesList.save([newNote]);
}

export const Editor = ({ ownerWebId }) => {
  getPodData(ownerWebId);
  return (
    <Form>
      <FullGridSize>
        <WebId>
          <b>
            Connected as: <a href={ownerWebId}>{ownerWebId}</a>
          </b>
        </WebId>
      </FullGridSize>
    </Form>
  );
};

/**
 * A React component page that is displayed when there's no valid route. Users can click the button
 * to get back to the home/welcome page.
 */
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
