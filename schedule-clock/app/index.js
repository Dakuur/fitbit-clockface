import clock from "clock";
import * as document from "document";
import { preferences } from "user-settings";
import { HeartRateSensor } from "heart-rate";
import { battery } from "power";
import { readFileSync } from "fs";


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
  
	for (let i = 0; i < classes.length; i++) {
	  const classDetails = classes[i];
	  const currentDate = new Date(`1970-01-01T${currentTime}:00`);
	  const classStartDate = new Date(`1970-01-01T${classDetails.start}:00`);
	  const classEndDate = new Date(`1970-01-01T${classDetails.end}:00`);
  
	  // Si la clase actual está en curso
	  if (currentDate >= classStartDate && currentDate < classEndDate) {
		// Verificamos si la próxima clase empieza justo cuando termina la actual
		const nextClassDetails = classes[i + 1];
		if (nextClassDetails && classEndDate.getTime() === new Date(`1970-01-01T${nextClassDetails.start}:00`).getTime()) {
		  // Si quedan 15 minutos o menos para que termine la clase actual
		  const remainingTime = classEndDate - currentDate;
		  if (remainingTime <= 15 * 60 * 1000) {
			return nextClassDetails;  // Mostrar información de la próxima clase
		  }
		}
		return classDetails;  // Clase en curso
	  }
  
	  // Si la clase actual ya ha terminado, buscamos la siguiente clase
	  if (currentDate < classStartDate) {
		return classDetails;  // Próxima clase
	  }
	}
  
	return null;  // Si no hay más clases en el día
  }
  

// Update the clock every minute
clock.granularity = "minutes";

// Initial data
const labelHora = document.getElementById("labelHora");
const labelBPM = document.getElementById("labelBPM");
const labelBattery = document.getElementById("labelBattery");
const nextClass = document.getElementById("nextClass");
const nextRoomTime = document.getElementById("nextRoomTime");
const nextClassType = document.getElementById("nextClassType");

// Schedule data
let schedule = readFileSync("./resources/schedule.json", "utf-8");
schedule = JSON.parse(schedule);

// Actualizamos el evento del reloj para mostrar la próxima clase
clock.ontick = (evt) => {
	let today = evt.date;
	let hours = today.getHours();
	hours = correctHour(preferences, hours);
	let mins = zeroPad(today.getMinutes());
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
	const currentTime = `${zeroPad(hours)}:${mins}`;
  
	// Obtener la próxima clase del horario
	const nextClassInfo = getNextClass(currentTime, currentDay);
	if (nextClassInfo) {
	  nextClass.text = `${nextClassInfo.subject}`;
	  nextClassType.text = `${nextClassInfo.type}`;
	  nextRoomTime.text = `${nextClassInfo.location}, ${nextClassInfo.start}`;
	}
	else {
	  nextClass.text = "No more classes";
	  nextClassType.text = "";
	  nextRoomTime.text = "";
	}
  
	// Actualización del sensor de ritmo cardíaco
	if (HeartRateSensor) {
	  const hrm = new HeartRateSensor({ frequency: 1 });
	  hrm.addEventListener("reading", () => {
		labelBPM.text = `${hrm.heartRate} ❤️`;
	  });
	  hrm.start();
	}
  
	// Actualización del nivel de batería
	let battery_level = Math.floor(battery.chargeLevel);
	labelBattery.text = `${battery_level}%`;
  };