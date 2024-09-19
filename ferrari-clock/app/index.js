import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";

function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

function correctHour(preferences, hours) {
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = zeroPad(hours);
  }
  return hours;
}

// Update the clock every minute
clock.granularity = "minutes";

// Initial data
const backgroundImage = document.getElementById("backgroundImage");
const labelHora = document.getElementById("labelHora");
const labelBPM = document.getElementById("labelBPM");
const foregroundImage = document.getElementById("foregroundImage");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();

  hours = correctHour(preferences, hours);

  let mins = zeroPad(today.getMinutes());

  // Cambia el fondo y la imagen de primer plano basado en la hora
  if (mins == 33) {
    // ALONSO
    backgroundImage.href = "fondoalonso.png";
    labelHora.x = 168;
    labelHora.y = 148;
    foregroundImage.href = "alonso.png";
  } else {
    backgroundImage.href = "fondoferrari.png";
    labelHora.x = 168;
    labelHora.y = 238;
    foregroundImage.href = "ferrari.png";
  }

  if (HeartRateSensor) {
    const hrm = new HeartRateSensor({ frequency: 1 });
    hrm.addEventListener("reading", () => {
      labelBPM.text = `${hrm.heartRate} km/h`;
    });
    hrm.start();
  }

  labelHora.text = `${hours}:${mins}`;
};
