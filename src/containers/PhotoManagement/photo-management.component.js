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
} from "./photo-management.style";

type Props = { webId: String };
const $rdf = require("rdflib");
const folderName = "steve-clinic";

function extractWacAllow(response) {
  // WAC-Allow: user="read write append control",public="read"
  const modes = {
    user: {
      read: false,
      append: false,
      write: false,
      control: false
    },
    public: {
      read: false,
      append: false,
      write: false,
      control: false
    }
  };
  const wacAllowHeader = response.headers.get("WAC-Allow");
  console.log("wacAllowHeader", wacAllowHeader);
  if (wacAllowHeader) {
    wacAllowHeader // 'user="read write append control",public="read"'
      .split(",") // ['user="read write append control"', 'public="read"']
      .map(str => str.trim())
      .forEach(statement => {
        // 'user="read write append control"'
        const parts = statement.split("="); // ['user', '"read write control"']
        if (
          parts.length >= 2 &&
          ["user", "public"].indexOf(parts[0]) !== -1 &&
          parts[1].length > 2
        ) {
          const modeStr = parts[1].replace(/"/g, ""); // 'read write control' or ''
          if (modeStr.length) {
            modeStr.split(" ").forEach(mode => {
              modes[parts[0]][mode] = true;
            });
          }
        }
      });
  }
  return modes;
}

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

  async function setUrlFromStorage() {
    if (webId) {
      const storageRoot = await ldflex[webId]["pim:storage"];
      const storage = await ldflex[webId]["acl:trustedApp"];

      if (storageRoot) {
        const exampleUrl = new URL("/", storageRoot.value);
        console.log("exampleURL", exampleUrl);
        setBaseURL(exampleUrl);

        const ACLFolder = new AccessControlList(
          webId,
          new URL(folderName + "/", exampleUrl)
        );
        let permissions = await ACLFolder.getPermissions();
        let users = [].concat.apply(
          [],
          permissions.filter(p => p.modes.includes("Read")).map(p => p.agents)
        );
        setFolderAgents(users);
      }
    }
  }

  useEffect(() => {
    setUrlFromStorage();
  }, [webId]);

  function handleFileChange(event) {
    event.preventDefault();
    console.log("file", event.target.files[0]);
    setFileName(event.target.value);
    setFile(event.target.files[0]);
    setFileURL(
      new URL("/" + folderName + "/" + event.target.files[0].name, baseURL)
    );
  }

  function handleUsersChange(event) {
    event.preventDefault();
    setUsers(event.target.value);
  }

  function handlePhotoOwnerChange(event) {
    event.preventDefault();
    setPhotoOwner(event.target.value);
  }

  async function handleSave(event) {
    event.preventDefault();

    const reader = new FileReader();

    reader.onload = async f => {
      let data = f.target.result;
      const result = await SolidAuth.fetch(
        baseURL + folderName + "/" + file.name,
        {
          method: "PUT",
          body: data,
          headers: {
            "Content-Type": file.type
          }
        }
      );

      if (result.ok) {
        successToaster(t("notifications.saved"));
        const filePermissions = [
          {
            agents: users.split(","),
            modes: [AccessControlList.MODES.READ, AccessControlList.MODES.WRITE]
          }
        ];
        const ACLFile = new AccessControlList(webId, fileURL);
        await ACLFile.createACL(filePermissions);

        let agents = [...new Set(folderAgents.concat(users.split(",")))];
        const folderPermissions = [
          {
            agents,
            modes: [AccessControlList.MODES.READ, AccessControlList.MODES.WRITE]
          }
        ];
        const ACLFolder = new AccessControlList(
          webId,
          new URL(folderName + "/", baseURL)
        );
        await ACLFolder.createACL(folderPermissions);

        successToaster(t("notifications.accessGranted"));
      } else if (result.ok === false) {
        errorToaster(t("notifications.errorSaving"));
      }
    };

    reader.readAsArrayBuffer(file);
  }

  async function handleSearch(event) {
    setAccessibleFiles([]);
    event.preventDefault();
    if (photoOwner.includes("/profile/card#me")) {
      let basePhotoOwnerFolderURL = photoOwner.replace("profile/card#me", "");
      console.log("aaaa", basePhotoOwnerFolderURL);
      let folder = $rdf.sym(basePhotoOwnerFolderURL + folderName + "/");
      const store = $rdf.graph();
      const fetcher = new $rdf.Fetcher(store);
      const LDP = $rdf.Namespace("http://www.w3.org/ns/ldp#");
      fetcher.load(folder).then(async () => {
        let files = store.match(folder, LDP("contains"));
        console.log(files);
        Promise.all(
          files.map(async p => {
            let details = await getFileDetails(p.object.value);
            return details;
          })
        ).then(data => {
          let pppp = data.filter(x => !!x.hasPermission);
          console.log("ppppaaaa", pppp);
          setAccessibleFiles(pppp);
        });
      });
    }
  }

  async function getFileDetails(fileURL) {
    const doc = SolidAuth.fetch(fileURL);
    let filesDetails = await doc
      .then(async response => {
        const text = await response.text();
        const wacAllowModes = extractWacAllow(response);
        console.log("wac");
        return {
          hasPermission: wacAllowModes.user.read,
          url: fileURL,
          value: text
        };
      })
      .catch(() => {
        console.log("nao pode fazer pedido");
        return { hasPermission: false, url: fileURL };
        errorToaster(t("notifications.errorFetching"));
      });
    return filesDetails;
  } // assuming the logged in user doesn't change without a page refresh

  return (
    <Form>
      <FullGridSize>
        <WebId>
          <b>
            Connected as: <a href={webId}>{webId}</a>
          </b>
        </WebId>
      </FullGridSize>
      <FullGridSize>
        <Label>
          File
          <Input
            type="file"
            size="200"
            value={fileName}
            onChange={handleFileChange}
          />
        </Label>
        <Label>
          Users (separated by ',')
          <Input
            type="text"
            size="200"
            value={users}
            onChange={handleUsersChange}
          />
        </Label>
        <div className="input-wrap">
          <Button
            className="ids-link-filled ids-link-filled--primary button"
            onClick={handleSave}
          >
            {t("editor.save")}
          </Button>
        </div>
      </FullGridSize>
      <FullGridSize>
        <Label>
          Photo Owner
          <Input
            type="text"
            size="200"
            value={photoOwner}
            onChange={handlePhotoOwnerChange}
          />
        </Label>
        <div className="input-wrap">
          <Button
            className="ids-link-filled ids-link-filled--primary button"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>
        <Table>
          <thead>
            <tr>
              <th scope="col">Files</th>
            </tr>
          </thead>
          <tbody>
            {accessibleFiles.map(file => {
              return (
                <Tr>
                  <td>{file.url}</td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
      </FullGridSize>
    </Form>
  );
};

/**
 * A React component page that is displayed when there's no valid route. Users can click the button
 * to get back to the home/welcome page.
 */
const PhotoManagement = ({ webId }: Props) => {
  const { t } = useTranslation();
  console.log(webId);
  return (
    <TextEditorWrapper>
      <TextEditorContainer>
        <Header>Photo Management</Header>
        <Editor webId={webId} />
      </TextEditorContainer>
    </TextEditorWrapper>
  );
};

export default PhotoManagement;
