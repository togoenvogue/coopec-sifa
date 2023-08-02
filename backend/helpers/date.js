const today = new Date(1681246240000);
const dateShortCut =
  today.getDate() +
  "/" +
  (today.getMonth() + 1) +
  "/" +
  today.getFullYear() +
  " " +
  today.getHours() +
  ":" +
  today.getMinutes() +
  ":" +
  today.getSeconds();

export async function dateShotCut({ timeStamp }) {
  const today = new Date(timeStamp);
  const dateShortCut =
    today.getDate() + "/" + (today.getMonth() + 1) + "/" + today.getFullYear();
  return dateShortCut;
}

// date de remboursement (tableau d'amortissement)
export async function dateShotCutAmortissement({
  timeStamp,
  nextPaymentStamp,
}) {
  // 4 fois par mois (chaque semaine) = "Hebdomadaire"
  // 2 fois par mois (chaque 2 semaine) = "Bimensuelle"
  // tous les mois = "Mensuelle"
  // tous les 2 mois  = "Bimestrielle"
  // tous les 3 mois  = "Trimestrielle"
  // tous les 4 mois = "Quadrimestrielle"
  // tous les 6 mois  = "Semestrielle"
  // tous les 12 mois  = "Annuelle"
  // 1 seule fois  = "In-fine"

  const fixedDateToPay = new Date(timeStamp);
  const today = new Date(timeStamp + nextPaymentStamp);
  const dateShortCut =
    fixedDateToPay.getDate() +
    "/" +
    (today.getMonth() + 1) +
    "/" +
    today.getFullYear();

  return dateShortCut;
}

export async function customFullDate({ timeStamp }) {
  if (timeStamp != 0 && timeStamp > 0) {
    return new Date(timeStamp).toLocaleString("fr-FR", {
      month: "short",
      day: "numeric",
      year: "numeric",
      weekday: "long",
    });
  } else {
    return "--/--/----";
  }
}

export async function customFullDateWithHour({ timeStamp }) {
  if (timeStamp != 0 && timeStamp > 0) {
    return new Date(timeStamp).toLocaleString("fr-FR", {
      month: "long",
      day: "numeric",
      year: "numeric",
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
  } else {
    return "--/--/----";
  }
}

export function filterStampsArray({ timeStampArray, monthInt }) {
  // monthInt : 1 to 12
  let monthsArray = [];
  if (timeStampArray.length > 0) {
    for (let i = 0; i < timeStampArray.length; i++) {
      const date = new Date(timeStampArray[i]);
      if (date.getMonth() + 1 === monthInt) {
        monthsArray.push(timeStampArray[i]);
      }
    }
    return monthsArray;
  } else {
    return [];
  }
}
