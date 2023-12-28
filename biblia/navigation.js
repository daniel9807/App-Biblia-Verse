import "../biblia/style.css";
import "../biblia/respon.css";
import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/js/fontawesome.min.js";
import { libros2 } from "../biblia/libros.js";
import { getApi } from "../biblia/biblia.js";

const container = document.querySelector(".container");
const footer = document.querySelector(".footer");
const btnVoz = document.querySelector("#voz");
const modal = document.querySelector("#dialog");
const closeModal = document.querySelector("#hide");
const h2Text = document.querySelector("#texth2");
const pText = document.querySelector(".text-pa");
const startButton = document.getElementById("startButton");
const resultDiv = document.getElementById("result");

btnVoz.addEventListener("click", () => {
  modal.showModal();
});

closeModal.addEventListener("click", () => {
  modal.close();
});

document.addEventListener("DOMContentLoaded", function () {
  btnVoz.addEventListener("click", function (t) {
    t.preventDefault();
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        window.mozSpeechRecognition ||
        window.msSpeechRecognition)();

      let isRecognitionRunning = false;
      let lastSearch = null;
      // Configurar el idioma y otros parámetros (opcional)
      recognition.lang = "es-ES";

      // Evento que se ejecuta cuando se detecta habla
      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          const spokenWord = event.results[i][0].transcript
            .trim()
            .toLowerCase();
          transcript += spokenWord + " ";
        }
        const textoConEspacios = transcript.replace(/(\d)(?=\d)/g, "$1").trim();
        resultDiv.textContent = textoConEspacios;

        // Evita búsquedas repetidas del mismo versículo
        if (textoConEspacios !== lastSearch) {
          lastSearch = textoConEspacios;
          const palabras = textoConEspacios.split(" ");
          if (palabras.length === 3) {
            const texto1 = palabras[0];
            const texto2 = palabras[1];
            const textoUnido = [texto1, texto2].join(" ");
            const txt = textoUnido.replace(/,/g, "");
            const numeros = palabras[2];
            if (numeros.length >= 1) {
              getLibros(txt, numeros);
            }
          }
          if (palabras.length === 2) {
            const texto = palabras[0];
            const numeros = palabras[1];
            if (numeros.length >= 1) {
              getLibros(texto, numeros);
            }
          }
        }
      };

      function getLibros(texto, numeros) {
        libros2.forEach((libro) => {
          if (libro.name == texto) {
            const lo = libro.chapter;
            const numeross = numeros;
            container.style.height = "auto";
            container.style.marginTop = "90px";
            container.innerHTML = " ";
            footer.style.visibility = "hidden";
            footer.style.opacity = "0";
            getApi(lo, numeross, true);
          }
        });
      }

      // Evento que se ejecuta cuando se inicia el reconocimiento de voz
      recognition.onstart = () => {
        const name = " <i class='fa-solid fa-microphone  fa-beat'></i> ";
        startButton.style.color = "#ffffff";
        startButton.style.backgroundColor = " #e55039";
        startButton.innerHTML = name;
        isRecognitionRunning = true;

        h2Text.textContent = "Escuchando...";
        pText.textContent = " ";
      };

      // Evento que se ejecuta cuando se detiene el reconocimiento de voz
      recognition.onend = () => {
        const name2 = " <i class='fa-solid fa-microphone'></i>";
        startButton.style.color = " #000000";
        startButton.style.backgroundColor = " #ececec";
        startButton.innerHTML = name2;

        h2Text.textContent = "Iniciar Búsqueda por Voz";
        pText.textContent = "Toca el micrófono para volver a intentarlo";
        isRecognitionRunning = false;
      };

      startButton.addEventListener("click", () => {
        if (isRecognitionRunning) {
          recognition.stop();
        } else {
          recognition.start();
        }
      });

      // Manejo de errores
      recognition.onerror = (event) => {
        console.error("Error en el reconocimiento de voz:", event.error);
      };
    } else {
      alert("El navegador no admite la API de Reconocimiento de Voz.");
    }
  });
});
