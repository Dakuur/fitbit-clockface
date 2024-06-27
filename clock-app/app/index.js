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

// Get a handle on the <text> element
const labelHora = document.getElementById("labelHora");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();

  hours = correctHour(preferences, hours);
  
  let mins = zeroPad(today.getMinutes());
  labelHora.text = `${hours}:${mins}`;
}