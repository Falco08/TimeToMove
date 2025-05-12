const timeOptions = document.getElementById("timeOptions");
const esercizioDiv = document.getElementById("esercizioDiv");
const aggiungiEsercizio = document.getElementById("aggiungiEsercizio");
const ulEsercizi = document.getElementById("ulEsercizi");
const svegliaInCorso = document.getElementById("svegliaInCorso");
const closeDialog = document.getElementById("closeDialog");
const dialogMessage = document.getElementById("dialogMessage");
const attivaSveglie = document.getElementById("activateAlarms");

const alarmSound = new Audio("assets/sveglia-lofi.mp3");

const svegliePossibili = [
  "00:00",
  "00:15",
  "00:30",
  "00:45",
  "01:00",
  "01:15",
  "01:30",
  "01:45",
  "02:00",
  "02:15",
  "02:30",
  "02:45",
  "03:00",
  "03:15",
  "03:30",
  "03:45",
  "04:00",
  "04:15",
  "04:30",
  "04:45",
  "05:00",
  "05:15",
  "05:30",
  "05:45",
  "06:00",
  "06:15",
  "06:30",
  "06:45",
  "07:00",
  "07:15",
  "07:30",
  "07:45",
  "08:00",
  "08:15",
  "08:30",
  "08:45",
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "10:45",
  "11:00",
  "11:15",
  "11:30",
  "11:45",
  "12:00",
  "12:15",
  "12:30",
  "12:45",
  "13:00",
  "13:15",
  "13:30",
  "13:45",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "15:00",
  "15:15",
  "15:30",
  "15:45",
  "16:00",
  "16:15",
  "16:30",
  "16:45",
  "17:00",
  "17:15",
  "17:30",
  "17:45",
  "18:00",
  "18:15",
  "18:30",
  "18:45",
  "19:00",
  "19:15",
  "19:30",
  "19:45",
  "20:00",
  "20:15",
  "20:30",
  "20:45",
  "21:00",
  "21:15",
  "21:30",
  "21:45",
  "22:00",
  "22:15",
  "22:30",
  "22:45",
  "23:00",
  "23:15",
  "23:30",
  "23:45",
];
const sveglieSalvate = JSON.parse(localStorage.getItem("sveglie")) || [];
const sveglieImpostate = {}; //Traccia le sveeglie già impostate per aggiornare i timeout senza creare ripetizioni ed eliminare i deselezionati
const eserciziSalvati = JSON.parse(localStorage.getItem("esercizi")) || [
  "Piegamenti x15",
  "Piegamenti a braccia larghe x10",
  "Squat x20",
  "Stretching, 2 minuti",
  "Squat gamba singola x10",
];
const esercizi = [...eserciziSalvati];

document.addEventListener("DOMContentLoaded", () => {
  attivaSveglie.addEventListener("click", () => {
    alarmSound.play().then(() => {
      alarmSound.pause();
      alarmSound.currentTime = 0;
      impostaSveglie();
      generaSelectOrari();
      generaListaEsercizi();
      resetMezzanotte();
      document.getElementById("cover").style.display = "none";
    });
  });
});

const orariContainer = document.getElementById("orariContainer");

const generaSelectOrari = () => {
  svegliePossibili.forEach((sveglia) => {
    const timeDiv = document.createElement("div");
    timeDiv.textContent = sveglia;
    timeDiv.classList.add("orarioSveglia");

    if (sveglieImpostate.hasOwnProperty(sveglia)) {
      timeDiv.classList.add("svegliaAttiva");
    }

    //Click per aggiornare l'array sveglie e cambiare il CSS delle sveglie attive e disattive
    timeDiv.addEventListener("click", () => {
      if (!sveglieImpostate.hasOwnProperty(sveglia)) {
        impostaSveglieAggiuntive(sveglia);
        localStorage.setItem("sveglie", JSON.stringify(sveglieImpostate));
        timeDiv.classList.add("svegliaAttiva");
      } else {
        cancellaSveglia(sveglia);
        localStorage.setItem("sveglie", JSON.stringify(sveglieImpostate));
        timeDiv.classList.remove("svegliaAttiva");
      }
    });

    orariContainer.appendChild(timeDiv);
  });
};

aggiungiEsercizio.addEventListener("click", () => {
  if (!esercizioDiv.value) {
    return false;
  }

  esercizi.push(esercizioDiv.value);
  localStorage.setItem("esercizi", JSON.stringify(esercizi));
  generaListaEsercizi();
  esercizioDiv.value = "";
});

const generaListaEsercizi = () => {
  ulEsercizi.innerHTML = "";
  esercizi.forEach((el, index) => {
    const esercizioElem = document.createElement("div");
    esercizioElem.textContent = el;
    esercizioElem.classList.add("esercizio-item");

    const removeButton = document.createElement("button");
    removeButton.textContent = "x";
    removeButton.addEventListener("click", () => {
      esercizi.splice(index, 1);
      localStorage.setItem("esercizi", JSON.stringify(esercizi));
      generaListaEsercizi();
    });

    esercizioElem.appendChild(removeButton);
    ulEsercizi.appendChild(esercizioElem);
  });
};

const openDialog = (exercise) => {
  dialogMessage.textContent =
    exercise === ""
      ? "Alzati e cammina per dieci minuti, Lazzaro!"
      : `È ora di muoversi! Fammi ${exercise.toLowerCase()} e prenditi dieci minuti di pausa per bere e riposarti.`;
  svegliaInCorso.showModal();
  alarmSound.play();
};

closeDialog.addEventListener("click", () => {
  svegliaInCorso.close();
  alarmSound.pause();
  alarmSound.currentTime = 0;
});

function impostaSveglie() {
  for (const sveglia of Object.keys(sveglieSalvate)) {
    impostaSveglieAggiuntive(sveglia);
  }
}

//Quando la funzione viene chiamata da resetMezzanotte le sveglie nel JSON sono tutte impostate a null, CORREGGERE
const impostaSveglieAggiuntive = (orario) => {
  if (sveglieImpostate[orario]) return;

  const now = new Date();
  const [hours, minutes] = orario.split(":").map(Number);
  const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
  let timeToAlarm = alarmTime.getTime() - now.getTime();

  //Se l'orario è passato salva la sveglia ma non fa partire il timer per la giornata
  if (timeToAlarm <= 0) {
    sveglieImpostate[orario] = null;
    return;
  }

  const timeoutId = setTimeout(() => {
    const randomExercise = esercizi.length ? esercizi[Math.floor(Math.random() * esercizi.length)] : "";
    openDialog(randomExercise);
  }, timeToAlarm);

  sveglieImpostate[orario] = timeoutId;
};

function cancellaSveglia(orario) {
  if (sveglieImpostate[orario]) {
    clearTimeout(sveglieImpostate[orario].timeoutId);
  }
  delete sveglieImpostate[orario];
}

function resetMezzanotte() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const tempoAMezzanotte = tomorrow.getTime() - now.getTime();

  setTimeout(() => {
    impostaSveglie();
    resetMezzanotte();
  }, tempoAMezzanotte);
}
