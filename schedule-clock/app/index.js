import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";
import { readFileSync, listDirSync } from "fs";
import { BodyPresenceSensor } from "body-presence";

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

function getNextClass(currentTime, day) {
  // Obtenemos las clases del día actual
  const classes = schedule[day];

  // Verificamos si hay clases para el día especificado
  if (!classes || classes.length === 0) {
    return null; // No hay clases en este día
  }

  for (let i = 0; i < classes.length; i++) {
    const classDetails = classes[i];
    const currentDate = new Date(`1970-01-01T${currentTime}:00`);
    const classStartDate = new Date(`1970-01-01T${classDetails.start}:00`);
    const classEndDate = new Date(`1970-01-01T${classDetails.end}:00`);

    // Si la clase actual está en curso
    if (currentDate >= classStartDate && currentDate < classEndDate) {
      // Verificamos si han pasado 15 minutos desde que comenzó la clase actual
      const elapsedTime = currentDate - classStartDate;
      if (elapsedTime >= 15 * 60 * 1000) {
        const nextClassDetails = classes[i + 1];
        return nextClassDetails; // Mostrar información de la próxima clase
      }
      return classDetails; // Clase en curso
    }

    // Si la clase actual ya ha terminado, buscamos la siguiente clase
    if (currentDate < classStartDate) {
      return classDetails; // Próxima clase
    }
  }

  return null; // Si no hay más clases en el día
}

// Update the clock every minute
clock.granularity = "minutes";

// Initial data
const backgroundImage = document.getElementById("backgroundImage");
const labelHora = document.getElementById("labelHora");
const labelBPM = document.getElementById("labelBPM");
const labelBattery = document.getElementById("labelBattery");
const nextClass = document.getElementById("nextClass");
const nextRoomTime = document.getElementById("nextRoomTime");
const nextClassType = document.getElementById("nextClassType");

// Schedule data
let schedule = readFileSync("./resources/schedule.json", "utf-8");
schedule = JSON.parse(schedule);

// Special background data
const specials = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 23, 24,
  33, 55,
];

// Actualizamos el evento del reloj para mostrar la próxima clase
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  hours = correctHour(preferences, hours);
  let tmp_minutes = today.getMinutes();
  let mins = zeroPad(tmp_minutes);
  labelHora.text = `${hours}:${mins}`;

  // Obtener el nombre del día actual
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const currentDay = dayNames[today.getDay()];
  const currentTime = `${hours}:${mins}`;

  // Obtener la próxima clase del horario
  const nextClassInfo = getNextClass(currentTime, currentDay);

  const currentDate = new Date();
  const startDate = new Date(currentDate.getFullYear(), 1, 10); // February 10
  const endDate = new Date(currentDate.getFullYear(), 5, 1); // June 1

  if (nextClassInfo && currentDate > startDate && currentDate < endDate) {
    nextClass.text = `${nextClassInfo.subject}`;
    nextClassType.text = `${nextClassInfo.type}`;
    nextRoomTime.text = `${nextClassInfo.location}, ${nextClassInfo.start}`;
  } else {
    nextClass.text = "";
    nextClassType.text = "";
    nextRoomTime.text = "";
  }

  // ver si mins esta en specials
  let found = false;
  for (let i = 0; i < specials.length; i++) {
    if (specials[i] == mins) {
      found = true;
      break;
    }
  }

  if (found) {
    // Actualización de la imagen de fondo
    backgroundImage.href = `./resources/specials/${tmp_minutes}.jpg`;
    labelHora.text = `${hours}h             #${tmp_minutes}`;
    labelHora.style.fontSize = 50;
    labelHora.y = 130;
  } else {
    backgroundImage.href = "";
    labelHora.style.fontSize = 121;
    labelHora.y = 161;
  }

  // Actualización del sensor de ritmo cardíaco
  if (BodyPresenceSensor) {
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
