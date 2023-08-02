import { aql, db } from "../db/arangodb.js";

// get a client details
export async function getPerfectClientDoc({ clientKey }) {
  if (clientKey != null) {
    const doc_cursor = await db.query(aql`FOR pfc IN clients_sig 
    FILTER pfc._key == ${clientKey} RETURN pfc`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      // office key
      return {
        ...(doc.officeKey = await getOfficeDoc({ officeKey: doc.officeKey })),
        ...doc,
      };
    } else {
      return {};
    }
  } else {
    return null;
  }
}

export async function getSigGroupDoc({ ref }) {
  if (ref != null) {
    const doc_cursor = await db.query(aql`FOR g IN groupes_sig 
    FILTER g._key == ${ref}  OR g.groupCode == ${ref} RETURN g`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...doc,
      };
    } else {
      return {};
    }
  } else {
    return null;
  }
}

export async function getPerfectClientDocs({ keysArr }) {
  if (keysArr != null && keysArr.length > 0) {
    const docs_cursor = await db.query(aql`FOR pfc IN clients_sig 
    FILTER pfc._key IN ${keysArr} RETURN pfc`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return { ...doc };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getCountryDoc({ key }) {
  if (key != null) {
    const doc_cursor = await db.query(aql`FOR cc IN country 
      FILTER cc._key == ${key} 
      OR cc.countryFlag == ${key} 
      OR cc.countryCode == ${key} RETURN cc`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function getCityDoc({ key }) {
  if (key != null) {
    const doc_cursor = await db.query(aql`FOR cty IN city 
      FILTER cty._key == ${key} RETURN cty`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function getRegionDoc({ key }) {
  if (key != null) {
    const doc_cursor = await db.query(aql`FOR rg IN location_region 
      FILTER rg._key == ${key} RETURN rg`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function getPrefectureDoc({ key }) {
  if (key != null) {
    const doc_cursor = await db.query(aql`FOR pf IN location_prefecture 
      FILTER pf._key == ${key} RETURN pf`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function getCantonDoc({ key }) {
  if (key != null) {
    const doc_cursor = await db.query(aql`FOR c IN location_canton 
      FILTER c._key == ${key} RETURN c`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return null;
    }
  } else {
    return null;
  }
}

export async function getUserDoc({ userKey }) {
  if (userKey != null) {
    const doc_cursor = await db.query(aql`FOR uzr IN user 
    FILTER uzr._key == ${userKey} RETURN uzr`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return {
        ...(doc.roleKey = await getRoleDoc({ roleKey: doc.roleKey })),
        ...doc,
      };
    } else {
      return {};
    }
  } else {
    return {};
  }
}

export async function getUserDocs({ userKeyArr }) {
  if (userKeyArr.length > 0) {
    const docs_cursor = await db.query(aql`FOR uzs IN user 
    FILTER uzs._key IN ${userKeyArr} RETURN uzs`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        // select role
        return {
          ...(doc.roleKey = await getRoleDoc({ roleKey: doc.roleKey })),
          ...doc,
        };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getUserFullName({ userKey }) {
  const doc_cursor = await db.query(aql`FOR uzr IN user 
    FILTER uzr._key == ${userKey} RETURN uzr`);
  if (doc_cursor.hasNext) {
    const doc = await doc_cursor.next();
    return `${doc.lastName} ${doc.firstName}`;
  } else {
    return "";
  }
}

export async function getCompanyDoc({ companyKey }) {
  const doc_cursor = await db.query(aql`FOR compani IN company 
    FILTER compani._key == ${companyKey} RETURN compani`);
  if (doc_cursor.hasNext) {
    const doc = await doc_cursor.next();
    return { ...doc };
  } else {
    return {};
  }
}

export async function getAccessObjDocs({
  companyKey,
  officeKey,
  roleKey,
  projectKey,
  accessLevel,
  externalId,
}) {
  /*console.log(`companyKey: ${companyKey}`);
  console.log(`officeKey: ${officeKey}`);
  console.log(`roleKey: ${roleKey}`);
  console.log(`projectKey: ${projectKey}`);
  console.log(`accessLevel: ${accessLevel}`);*/
  // get company
  const company_doc = companyKey
    ? await db.query(aql`FOR c1 IN company 
    FILTER c1._key == ${companyKey} AND c1.isActive == true RETURN c1`)
    : null;
  const company = company_doc.hasNext ? await company_doc.next() : null;

  // get office
  const office_doc = await db.query(aql`FOR c2 IN office 
    FILTER c2._key == ${officeKey} RETURN c2`);
  const office = office_doc.hasNext ? await office_doc.next() : null;

  // get role
  const role_doc = await db.query(aql`FOR c3 IN role 
    FILTER c3._key == ${roleKey} RETURN c3`);
  const role = role_doc.hasNext ? await role_doc.next() : null;

  // get project
  const project_doc = await db.query(aql`FOR c4 IN project 
    FILTER c4._key == ${projectKey} RETURN c4`);
  const project = project_doc.hasNext ? await project_doc.next() : null;

  return {
    companyKey: company,
    officeKey: office,
    roleKey: role,
    projectKey: project,
    accessLevel: accessLevel,
    externalId: externalId,
  };
}

// get office document
export async function getOfficeDoc({ officeKey }) {
  if (officeKey != null && officeKey != undefined) {
    const doc_cursor = await db.query(aql`FOR o IN office 
    FILTER o._key == ${officeKey} 
    OR o.externalId == ${officeKey} RETURN o`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return {};
    }
  } else {
    return null;
  }
}

// get only office name
export async function getOfficeName({ officeKey }) {
  if (officeKey != null && officeKey != undefined) {
    const doc_cursor = await db.query(aql`FOR o IN office 
    FILTER o._key == ${officeKey} 
    OR o.externalId == ${officeKey} RETURN o`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return doc.officeName;
    } else {
      return "ERREUR";
    }
  } else {
    return null;
  }
}

export async function getOfficeDocs({ officeKeyArr }) {
  if (officeKeyArr.length > 0) {
    const xdoc_cursor = await db.query(aql`FOR offis IN office 
    FILTER offis._key IN ${officeKeyArr} RETURN offis`);
    if (xdoc_cursor.hasNext) {
      const docs = await xdoc_cursor.all();
      return docs.map(async (doc) => {
        return { ...doc };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

export async function getProjectDoc({ projectKey }) {
  if (projectKey != null) {
    const doc_cursor = await db.query(aql`FOR proj IN project 
    FILTER proj._key == ${projectKey} RETURN proj`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return {};
    }
  } else {
    return {};
  }
}

export async function getRoleDoc({ roleKey }) {
  const doc_cursor = await db.query(aql`FOR b IN role 
    FILTER b._key == ${roleKey} RETURN b`);
  if (doc_cursor.hasNext) {
    const doc = await doc_cursor.next();
    return { ...doc };
  } else {
    return {};
  }
}

export async function getRoleDocs({ roleKeys }) {
  const docs_cursor = await db.query(aql`FOR b IN role 
    FILTER b._key IN ${roleKeys} RETURN b`);
  if (docs_cursor.hasNext) {
    const docs = await docs_cursor.all();
    return docs.map(async (doc) => {
      return { ...doc };
    });
  } else {
    return [];
  }
}

export async function getCompaniesByKeys({ keysArr }) {
  const docs_cursor = await db.query(aql`FOR prdx IN company 
    FILTER prdx._key IN ${keysArr} RETURN prdx`);
  if (docs_cursor.hasNext) {
    const docs = await docs_cursor.all();
    return docs.map(async (doc) => {
      return { ...doc };
    });
  } else {
    return [];
  }
}

export async function getCompanyAccessModules({ companyKey }) {
  const docs_cursor = await db.query(aql`FOR m IN module 
    FILTER ${companyKey} IN m.companies RETURN m`);
  if (docs_cursor.hasNext) {
    let accessMod = [];
    const docs = await docs_cursor.all();
    docs.forEach((element) => {
      accessMod.push(element.moduleRef);
    });
    return accessMod;
  } else {
    return [];
  }
}

export async function getPerfectClientCount({
  groupCode,
  companyKey,
  projectKey,
}) {
  const docs_cursor = await db.query(aql`FOR c IN clients_sig 
    FILTER c.groupRef == ${groupCode} AND c.companyKey == ${companyKey}
    AND c.projectKey == ${projectKey} RETURN c`);
  if (docs_cursor.hasNext) {
    const docs = await docs_cursor.all();
    return docs.length;
  } else {
    return 0;
  }
}

export async function getDeviceType({ deviceKey }) {
  if (deviceKey != null) {
    const doc_cursor = await db.query(aql`FOR d IN authorized_devices 
    FILTER d._key == ${deviceKey} RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return {};
    }
  } else {
    return {};
  }
}

export async function getDeviceById({ deviceId }) {
  if (deviceId != null) {
    const doc_cursor = await db.query(aql`FOR d IN authorized_devices 
    FILTER d.deviceId == ${deviceId} RETURN d`);
    if (doc_cursor.hasNext) {
      const doc = await doc_cursor.next();
      return { ...doc };
    } else {
      return {};
    }
  } else {
    return {};
  }
}

// get cautions
export async function getCautionDocs({ laonKey }) {
  if (laonKey != null) {
    const docs_cursor = await db.query(aql`FOR pfc IN loan_cautions 
    FILTER pfc.loanFileKey == ${laonKey} 
    SORT pfc._key ASC RETURN pfc`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return { ...doc };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}

// get gages
export async function getGageDocs({ laonKey }) {
  if (laonKey != null) {
    const docs_cursor = await db.query(aql`FOR pfc IN loan_gages 
    FILTER pfc.loanFileKey == ${laonKey} 
    SORT pfc._key ASC RETURN pfc`);
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return { ...doc };
      });
    } else {
      return [];
    }
  } else {
    return [];
  }
}
