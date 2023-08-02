import { aql, db } from "../../../../db/arangodb.js";

// SOCKET

const loanSessionChatResolver = {
  /*loanSessionChatCreate: async ({
    companyKey,
    projectKey,
    userKey,
    userFullName,
    sessionKey,
    loanFileKey,
    message,
    action,
    messageType,
    audioFile,
    childUser,
    childStamp,
    childMessageType,
    childMessage,
    childAudioFile,
  }) => {
    const emptyDoc = {
      timeStamp: null,
      companyKey: null,
      projectKey: null,
      userKey: null,
      userFullName: null,
      sessionKey: null,
      loanFileKey: null,
      message: null,
      action: null,
      messageType: null,
      audioFile: null,
      childUser: null,
      childStamp: null,
      childMessageType: null,
      childMessage: null,
      childAudioFile: null,
    };
    if (userKey != null && userFullName) {
      const obj = {
        timeStamp: Date.now(),
        companyKey: companyKey,
        projectKey: projectKey,
        userKey: userKey,
        userFullName: userFullName,
        sessionKey: sessionKey,
        loanFileKey: loanFileKey,
        message: message,
        action: action,
        messageType: messageType,
        audioFile: audioFile,
        childUser: childUser,
        childStamp: childStamp,
        childMessageType: childMessageType,
        childMessage: childMessage,
        childAudioFile: childAudioFile,
      };

      // make sure the session is still active
      const session_cursor = await db.query(aql`FOR s IN loan_session 
      FILTER s._key == ${sessionKey} RETURN s`);
      if (session_cursor.hasNext) {
        const session = await session_cursor.next();
        // make sure the session is active
        if (session.status == "OUVERT") {
          if (
            action == "CHAT_WELCOME" ||
            action == "CHAT_EXIT" ||
            action == "SESSION_CLOSE"
          ) {
            // make sure the message does not exist
            const exists_cursor = await db.query(aql`FOR m IN loan_session_chat 
            FILTER m.sessionKey == ${sessionKey} AND m.userKey == ${userKey} 
            AND m.action == ${action} RETURN m`);
            if (exists_cursor.hasNext) {
              return { ...emptyDoc };
            } else {
              const doc_cursor = await db.query(aql`INSERT ${obj} 
              INTO loan_session_chat RETURN NEW`);
              if (doc_cursor.hasNext) {
                const doc = await doc_cursor.next();
                return { ...doc };
              } else {
                return `Erreur lors de la sauvegarde de la conversation`;
              }
            }
          } else {
            // other type of messages do not need verification
            const doc_cursor = await db.query(aql`INSERT ${obj} 
            INTO loan_session_chat RETURN NEW`);
            if (doc_cursor.hasNext) {
              const doc = await doc_cursor.next();
              return { ...doc };
            } else {
              return `Erreur lors de la sauvegarde de la conversation`;
            }
          }
        } else {
          return `Désolé, cette session n'est pas active. Statut actuel: ${session.status}`;
        }
      } else {
        return `Désolé, cette session n'est pas active. Statut actuel: ${session.status}`;
      }
    } else {
      return { ...emptyDoc };
    }
  },*/

  loanSessionChatBySessionKey: async ({
    companyKey,
    projectKey,
    sessionKey,
  }) => {
    const docs_cursor = await db.query(
      aql`FOR s IN loan_session_chat 
      FILTER s.companyKey == ${companyKey} 
      AND s.projectKey == ${projectKey} 
      AND s.sessionKey == ${sessionKey} 
      SORT s.timeStamp ASC LIMIT 0, 1000 RETURN s`,
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
};

export default loanSessionChatResolver;
