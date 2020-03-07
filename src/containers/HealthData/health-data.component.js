/* eslint-disable constructor-super */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SolidAuth from "solid-auth-client";
import { successToaster, errorToaster } from "@utils";
import ldflex from "@solid/query-ldflex";
import { AccessControlList } from "@inrupt/solid-react-components";
import { Table, Tr } from "styled-table-component";
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

type Props = { webId: String };
const $rdf = require("rdflib");
const folderName = "steve-clinic";

export const Editor = ({ webId }: Props) => {
  const { t } = useTranslation();
  const [file, setFile] = useState();
  const [fileName, setFileName] = useState("");
  const [baseURL, setBaseURL] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [users, setUsers] = useState("");
  const [accessibleFiles, setAccessibleFiles] = useState([]);
  const [photoOwner, setPhotoOwner] = useState("");
  const [folderAgents, setFolderAgents] = useState("");

  return (
    <Form>
      <FullGridSize>
        <WebId>
          <b>
            Connected as: <a href={webId}>{webId}</a>
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
        <Editor webId={webId} />
      </TextEditorContainer>
    </TextEditorWrapper>
  );
};

export default HealthData;
