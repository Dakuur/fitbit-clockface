import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";

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
const foregroundImage = document.getElementById("foregroundImage");

// Array of image paths (alternating between two images)
const backPaths = ["fondobudi.png", "fondolujazo.png", "fondoferrari.png"];
const forePaths = ["budi.png", "sasel.png", "ferrari.png"];

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();

  hours = correctHour(preferences, hours);

  let mins = zeroPad(today.getMinutes());

  // Determina el índice para las imágenes basado en la hora
  const hourIndex = today.getHours() % backPaths.length; // Esto dará un número entre 0 y 2

  // Cambia el fondo y la imagen de primer plano basado en la hora
  if (mins == 33) {
    // ALONSO
    backgroundImage.href = "fondoalonso.png";
    foregroundImage.href = "alonso.png";
    labelHora.x = 168;
    labelHora.y = 148;
  } else {
    // Comportamiento normal basado en la hora
    switch (hourIndex) {
      case 0:
        backgroundImage.href = backPaths[0];
        foregroundImage.href = forePaths[0];
        labelHora.style.fontSize = 120;
        labelHora.x = 188;
        labelHora.y = 148;
        break;
      case 1:
        backgroundImage.href = backPaths[1];
        foregroundImage.href = forePaths[1];
        labelHora.style.fontSize = 110;
        labelHora.x = 128;
        labelHora.y = 148;
        break;
      case 2:
        backgroundImage.href = backPaths[2];
        foregroundImage.href = forePaths[2];
        labelHora.x = 168;
        labelHora.y = 253;
        break;
    }
  }

  labelHora.text = `${hours}:${mins}`;
};
