import { aql, db } from "../db/arangodb.js";

/* 
REMOVE members of the groups
FOR c IN clients_sig 
FILTER c.groupRef != "00" 
AND c.cityKey == null 
REMOVE {_key: c._key} IN clients_sig RETURN OLD
*/

const ip = "192.168.0.111";
const updaterResolver = {
  appendOfficeIds: async () => {
    return "OK";
    // update offices
    const offices_docs = await db.query(aql`FOR c IN office 
     SORT c._key ASC RETURN c`);
    if (offices_docs.hasNext) {
      const offices = await offices_docs.all();
      for (let i = 0; i < offices.length; i++) {
        const office = offices[i];

        const officeObj = {
          externalId: `10${office.externalId}`,
          sigDBUser: "dogakaba_sifa",
          sigDBName: "BASESIFA",
          sigDBPort: 1433,
          sigDBIp: ip,
          sigDBPass: "dogAsiFA2023",
          requestSkip: 0,
          requestBatch: 10,
          dbtestUrl: `http://${ip}:5556/dbtest`,
        };

        // update office
        await db.query(
          aql`UPDATE ${office._key} WITH ${officeObj} IN office RETURN NEW`
        );
      }
    }

    // remove group members
    await db.query(aql`FOR c IN clients_sig 
    FILTER c.groupRef != "00" 
    AND c.cityKey == null 
    REMOVE {_key: c._key} IN clients_sig RETURN OLD`);

    // select clients
    const clients_docs = await db.query(aql`FOR c IN clients_sig 
     SORT c._key ASC RETURN c`);
    if (clients_docs.hasNext) {
      const clients = await clients_docs.all();
      for (let i = 0; i < clients.length; i++) {
        const client = clients[i];
        // select office
        const office_cursor = await db.query(aql`FOR o IN office 
            FILTER o._key == ${client.officeKey} RETURN o`);
        if (office_cursor.hasNext) {
          const office = await office_cursor.next();

          const clientObj = {
            codeSig: `${office.externalId}${client.codeSig}`,
          };
          console.log(
            `oldClient: ${
              client.codeSig
            } > new: ${`${office.externalId}${client.codeSig}`}`
          );
          // update client
          await db.query(
            aql`UPDATE ${client._key} WITH ${clientObj} IN clients_sig RETURN NEW`
          );
        }
      }
    }

    // groups
    const groups_docs = await db.query(aql`FOR c IN groupes_sig 
     SORT c._key ASC RETURN c`);
    if (groups_docs.hasNext) {
      const groups = await groups_docs.all();
      for (let i = 0; i < groups.length; i++) {
        const group = groups[i];
        // select office
        const office_cursor = await db.query(aql`FOR o IN office 
            FILTER o._key == ${group.officeKey} RETURN o`);
        if (office_cursor.hasNext) {
          const office = await office_cursor.next();
          const groupObj = {
            groupCode: `${office.externalId}${group.groupCode}`,
          };
          console.log(
            `oldGroup: ${
              group.groupCode
            } > new: ${`${office.externalId}${group.groupCode}`}`
          );
          // update group
          await db.query(
            aql`UPDATE ${group._key} WITH ${groupObj} IN groupes_sig RETURN NEW`
          );
        }
      }
    }
  },
};

export default updaterResolver;
