import { aql, db } from "../../../../db/arangodb.js";

const deviceIdResolver = {
  devices: async ({ projectKey, companyKey, fullName, skip, perPage }) => {
    const toSearch = `${fullName.toUpperCase()}%`;
    const docs_cursor =
      fullName == ""
        ? await db.query(
            aql`FOR r IN authorized_devices FILTER 
            r.companyKey == ${companyKey} 
            AND r.projectKey == ${projectKey} 
            SORT r.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN r`,
            { fullCount: true },
            { count: true }
          )
        : await db.query(
            aql`FOR r IN authorized_devices FILTER 
            r.companyKey == ${companyKey} 
            AND r.projectKey == ${projectKey} 
            AND r.fullName LIKE ${toSearch}
            SORT r.timeStamp DESC LIMIT ${skip}, ${perPage} RETURN r`,
            { fullCount: true },
            { count: true }
          );
    if (docs_cursor.hasNext) {
      const docs = await docs_cursor.all();
      return docs.map(async (doc) => {
        return {
          ...(doc.fullCount = await docs_cursor.extra.stats.fullCount),
          ...doc,
        };
      });
    } else {
      return [];
    }
  },

  deviceIdCreate: async ({
    deviceId,
    fullName,
    authBy,
    isActive,
    companyKey,
    projectKey,
    deviceType,
  }) => {
    const obj = {
      timeStamp: Date.now(),
      deviceId: deviceId,
      deviceType: deviceType,
      fullName: fullName.toUpperCase().trim(),
      authBy: authBy,
      isActive: isActive,
      companyKey: companyKey,
      projectKey: projectKey,
      lastConnectStamp: 0,
    };
    // check if country already exists
    const already_doc = await db.query(aql`FOR d IN authorized_devices 
    FILTER d.deviceId == ${deviceId} RETURN d`);
    if (already_doc.hasNext == false) {
      const doc_cursor = await db.query(aql`INSERT ${obj} 
      INTO authorized_devices RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "TRUE";
      } else {
        return `Erreur lors de l'autorisation du terminal`;
      }
    } else {
      return `Désolé, la référence du terminal < ${deviceId} > existe déjà dans la base`;
    }
  },

  deviceIdUpdate: async ({
    deviceId,
    deviceType,
    fullName,
    authBy,
    isActive,
    key,
  }) => {
    // check if country already exists
    const already_doc = await db.query(aql`FOR d IN authorized_devices 
    FILTER d._key == ${key} RETURN d`);
    if (already_doc.hasNext) {
      const obj = {
        deviceId: deviceId,
        deviceType: deviceType,
        fullName: fullName.toUpperCase().trim(),
        authBy: authBy,
        isActive: isActive,
        updateStamp: Date.now(),
      };

      const doc_cursor = await db.query(aql`UPDATE ${key} 
      WITH ${obj} IN authorized_devices RETURN NEW`);
      if (doc_cursor.hasNext) {
        return "TRUE";
      } else {
        return `Erreur lors de la mise a jour de l'autorisation du terminal`;
      }
    } else {
      return `Désolé, la référence du terminal < ${deviceId} > n'existe pas dans la base`;
    }
  },
};

export default deviceIdResolver;
