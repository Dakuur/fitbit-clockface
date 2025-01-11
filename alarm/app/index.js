import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";
import { readFileSync, listDirSync } from "fs";
import { BodyPresenceSensor } from "body-presence";
import { vibration } from "haptics";

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
const labelHora = document.getElementById("labelHora");
const labelBPM = document.getElementById("labelBPM");
const labelBattery = document.getElementById("labelBattery");
let timeout;

// Actualizamos el evento del reloj para mostrar la próxima clase
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  hours = correctHour(preferences, hours);
  let tmp_minutes = today.getMinutes();
  let mins = zeroPad(tmp_minutes);
  labelHora.text = `${hours}:${mins}`;

  // Wake up
  const wakeHour = 18;
  const wakeMinutes = 23;

  // Actualización del sensor de ritmo cardíaco
  if (BodyPresenceSensor) {
    if (hours === wakeHour && tmp_minutes === wakeMinutes) {
      vibration.start("ring");
      timeout = setTimeout(() => {
        vibration.stop();
      }, 10000);
    }

    const bodyPresence = new BodyPresenceSensor();
    bodyPresence.addEventListener("reading", () => {
      if (bodyPresence.present) {
        if (HeartRateSensor) {
          const hrm = new HeartRateSensor({ frequency: 1 });
          hrm.addEventListener("reading", () => {
            labelBPM.text = `${hrm.heartRate} ❤️`;
          });
          hrm.start();
        }
      } else {
        labelBPM.text = "--❤️";
      }
    });
    bodyPresence.start();
  }

  // Actualización del nivel de batería
  let battery_level = Math.floor(battery.chargeLevel);
  labelBattery.text = `${battery_level}%`;

  // Cambiar el color del texto según el nivel de batería
  if (battery_level > 30) {
    labelBattery.style.fill = "#10AC87";
  } else if (battery_level > 10) {
    labelBattery.style.fill = "#E16E25";
  } else {
    labelBattery.style.fill = "#CF1625";
  }
};
