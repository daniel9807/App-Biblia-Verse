import "../src/styles/style.css";
import "../src/styles/respon.css";
import { libros } from "../src/libros.js";
import { obtenerVersiculos, baseURL } from "../src/main.js";

const btnLibros = document.querySelector("#selector-theme");
const cajaLibros = document.querySelector(".caja-libros");
const cajaCapitulos = document.querySelector(".caja-capitulos");
const cajaVersiculos = document.querySelector(".caja-versiculos");
const closeModalButtons = [
  document.querySelector("#hides"),
  document.querySelector("#hides2"),
  document.querySelector("#hides3"),
];
const backButtons = [
  document.querySelector("#back"),
  document.querySelector("#back2"),
];
const ul = document.querySelector(".ul");
const ul2 = document.querySelector(".ul2");
const ul3 = document.querySelector(".ul3");

document.addEventListener("DOMContentLoaded", function () {
  btnLibros.addEventListener("click", function (b) {
    b.preventDefault();
    containerLibros();
    cajaLibros.style.visibility = "visible";
    cajaLibros.style.opacity = "1";
    btnLibros.style.transform = "none";
  });
});

closeModalButtons.forEach((closeButton, index) => {
  closeButton.addEventListener("click", () => {
    const modal =
      index === 0 ? cajaLibros : index === 1 ? cajaCapitulos : cajaVersiculos;
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
    btnLibros.style.transition = "transform 0.8s ease-out";
    btnLibros.style.transform = "translateX(-110px)";
  });
});

backButtons.forEach((backButton, index) => {
  backButton.addEventListener("click", () => {
    const currentModal = index === 0 ? cajaLibros : cajaCapitulos;
    const nextModal = index === 0 ? cajaCapitulos : cajaVersiculos;
    currentModal.style.visibility = "visible";
    currentModal.style.opacity = "1";
    nextModal.style.visibility = "hidden";
    nextModal.style.opacity = "0";
  });
});

function iteraciones(cantidad) {
  return Array.from({ length: cantidad }, (_, i) => i + 1);
}

async function getCapitulos() {
  try {
    const res = await fetch(`${baseURL}/books/`);
    const data = await res.json();
    containerCapitulos(data);
  } catch (error) {
    console.error("Error fetching chapters:", error);
  }
}

let isFetching = false;

export async function getApis(books, verses) {
  try {
    if (isFetching) {
      return;
    }
    isFetching = true;
    const res = await fetch(`${baseURL}/books/${books}/verses/${verses}`);
    const data = await res.json();
    obtenerVersiculos(data, true);
  } catch (error) {
    console.error("Error al obtener versículos:", error);
  } finally {
    isFetching = false;
  }
}

function containerLibros() {
  const bookNames = libros.map((libro) => libro.name);

  const suggestions = [];

  if (bookNames) {
    for (let i = 0; i < bookNames.length; i++) {
      if (bookNames[i].toLowerCase()) {
        suggestions.push(bookNames[i]);
      }
    }
    displaySuggestions(suggestions);

    ul.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        cajaLibros.value = e.target.textContent;
        if (cajaLibros.value === cajaLibros.value) {
          cajaLibros.style.visibility = "hidden";
          cajaLibros.style.opacity = "0";

          cajaCapitulos.style.visibility = "visible";
          cajaCapitulos.style.opacity = "1";

          containerCapitulos();
          getCapitulos();
        }
      }
    });
  }

  function displaySuggestions(suggestions) {
    clearSuggestions();

    suggestions.forEach((suggestion) => {
      const listItem = document.createElement("li");
      listItem.textContent = suggestion;
      listItem.className = "listas";

      ul.appendChild(listItem);
    });
  }

  function clearSuggestions() {
    while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
    }
  }
}

function containerCapitulos(data) {
  const selectedLibro = libros.find((libro) => libro.name === cajaLibros.value);
  const capi = selectedLibro?.posicion;
  if (data && capi !== undefined) {
    const info = data[capi];
    const chap = info.chapters;
    const ite = iteraciones(chap.length);
    displaySuggestions(ite, ul2);
  }
  ul2.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      cajaCapitulos.value = e.target.textContent;
      if (cajaCapitulos.value === cajaCapitulos.value) {
        cajaCapitulos.style.visibility = "hidden";
        cajaCapitulos.style.opacity = "0";
        cajaVersiculos.style.visibility = "visible";
        cajaVersiculos.style.opacity = "1";
        containerVersiculos(data);
      }
    }
  });

  function displaySuggestions(suggestions) {
    clearSuggestions();
    suggestions.forEach((suggestion) => {
      const listItem = document.createElement("li");
      listItem.textContent = suggestion;
      listItem.className = "listas2";
      ul2.appendChild(listItem);
    });
  }
  function clearSuggestions() {
    while (ul2.firstChild) {
      ul2.removeChild(ul2.firstChild);
    }
  }
}

function containerVersiculos(data) {
  const selectedLibro = libros.find((libro) => libro.name === cajaLibros.value);
  const capi = selectedLibro?.posicion;
  if (data && capi !== undefined) {
    let found = null;
    const info = data[capi];
    const chaps = info.chapters;
    const numer = cajaCapitulos.value;

    chaps.forEach((chapter) => {
      const textos = [chapter];
      const encontre = textos.find((el) => el.chapter == numer);
      if (encontre) {
        found = encontre.osis_end;
      }
    });
    let ultimosDosDigitoss = found.slice(-2);
    if (ultimosDosDigitoss && ultimosDosDigitoss.includes(".")) {
      const ultimosDosDigitos = found.slice(-1);
      const num = parseInt(ultimosDosDigitos);
      displaySuggestions(iteraciones(num), ul3);
    } else {
      const num = parseInt(ultimosDosDigitoss);
      displaySuggestions(iteraciones(num), ul3);
    }
    ul3.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        cajaVersiculos.value = e.target.textContent;
        libros.forEach((libro) => {
          const li = cajaLibros.value;
          if (libro.name == li) {
            const lo = libro.chapter;
            const union = cajaCapitulos.value + ":" + cajaVersiculos.value;
            console.log(union);
            getApis(lo, union);
          }
        });
      }
    });

    function displaySuggestions(suggestions) {
      clearSuggestions();

      suggestions.forEach((suggestion) => {
        const listItem = document.createElement("li");
        listItem.textContent = suggestion;
        listItem.className = "listas2";

        ul3.appendChild(listItem);
      });
    }

    function clearSuggestions() {
      while (ul3.firstChild) {
        ul3.removeChild(ul3.firstChild);
      }
    }
  }
}
