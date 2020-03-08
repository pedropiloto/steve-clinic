/* eslint-disable constructor-super */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-console */

import SolidAuth from "solid-auth-client";
import { AccessControlList } from "@inrupt/solid-react-components";
const SolidAclUtils = require("solid-acl-utils");
const { AclApi, Permissions } = SolidAclUtils;
const { READ, WRITE, APPEND, CONTROL } = Permissions;

export async function addPermission(fileUrl, ownerWebId, webId) {
  const aclApi = new AclApi(SolidAuth.fetch, { autoSave: true });
  const acl = await aclApi.loadFromFileUrl(fileUrl.replace(".acl", ""));

  // Note: Workaround, because currently no default permissions are copied when a new acl file is created. Not doing this could result in having no CONTROL permissions after the first acl.addRule call
  if (!acl.hasRule(Permissions.ALL, ownerWebId)) {
    await acl.addRule(Permissions.ALL, ownerWebId);
  }
  if (!acl.hasRule([READ, WRITE], webId)) {
    await acl.addRule([READ, WRITE], webId);
  }
}

export async function createFileACLIfNotExists(fileUrl, webId) {
  try {
    console.log("ACL was not created for fileUrl", fileUrl);
    const aclApi = new AclApi(SolidAuth.fetch, { autoSave: true });
    await aclApi.loadFromFileUrl(fileUrl);
  } catch (e) {
    console.log("ACL was created for fileUrl", fileUrl);
    const filePermissions = [];
    const ACLFile = new AccessControlList(webId, fileUrl);
    await ACLFile.createACL(filePermissions);
  }
}
