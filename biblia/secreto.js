import "../biblia/style.css";
import "../biblia/respon.css";
import { libros } from "../biblia/libros.js";
import { obtenerVersiculos, baseURL, cajaBtn } from "../biblia/biblia.js";

const btnLibros = document.querySelector("#selector-theme");
const cajaLibros = document.querySelector(".caja-libros");
const cajaCapitulos = document.querySelector(".caja-capitulos");
const footer = document.querySelector(".footer");
const container = document.querySelector(".container");

const closeModalButtons = [
  document.querySelector("#hides"),
  document.querySelector("#hides2"),
];
const backButtons = document.querySelector("#back");

const ul = document.querySelector(".ul");
const ul2 = document.querySelector(".ul2");

let currentChapter = 1;
let concurreBooks = "";

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
    const modal = index === 0 ? cajaLibros : index === 1 ? cajaCapitulos : "";
    modal.style.visibility = "hidden";
    modal.style.opacity = "0";
    btnLibros.style.transition = "transform 0.8s ease-out";
    btnLibros.style.transform = "translateX(-110px)";
  });
});

backButtons.addEventListener("click", () => {
  cajaLibros.style.visibility = "visible";
  cajaLibros.style.opacity = "1";
  cajaCapitulos.style.visibility = "hidden";
  cajaCapitulos.style.opacity = "0";
});

function iteraciones(cantidad) {
  return Array.from({ length: cantidad }, (_, i) => i + 1);
}
let isFetching = false;
async function getCapitulos() {
  try {
    if (isFetching) {
      return;
    }
    const res = await fetch(`${baseURL}/books/`);
    const data = await res.json();
    containerCapitulos(data);
  } catch (error) {
    console.error("Error fetching chapters:", error);
  } finally {
    isFetching = false;
  }
}

export async function getApis(books, verses) {
  try {
    if (isFetching) {
      return;
    }
    isFetching = true;
    const res = await fetch(`${baseURL}/books/${books}/verses/${verses}`);
    const data = await res.json();
    obtenerVersiculos(data, true);

    currentChapter = parseInt(verses, 10);
    concurreBooks = books;

    await getCapitulos();

    updateChapterButtons(data.length);
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

          container.style.height = "auto";
          container.style.margin = "90px 0px 40px 0px";
          container.innerHTML = " ";
          footer.style.visibility = "hidden";
          footer.style.opacity = "0";
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
        libros.forEach((libro) => {
          const li = cajaLibros.value;
          if (libro.name == li) {
            const lo = libro.chapter;
            const numero = cajaCapitulos.value;
            getApis(lo, numero);
          }
        });
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

function updateChapterButtons(totalChapters) {
  // Eliminar botones anteriores si existen
  const existingButtons = document.querySelectorAll(
    ".chapter-button-previous, .chapter-button-next"
  );
  existingButtons.forEach((button) => button.remove());

  const previousButton = document.createElement("button");
  const btnPre = '<i class="fa-solid fa-circle-chevron-left ;"></i>';
  previousButton.innerHTML = btnPre;
  previousButton.addEventListener("click", () => {
    if (currentChapter > 1) {
      getApis(concurreBooks, currentChapter - 1);
    }
  });

  const nextButton = document.createElement("button");
  const btnNext = '<i class="fa-solid fa-circle-chevron-right ;"></i>';
  nextButton.innerHTML = btnNext;
  nextButton.addEventListener("click", () => {
    if (currentChapter < totalChapters) {
      getApis(concurreBooks, currentChapter + 1);
    }
  });

  // Eliminar manejadores de eventos anteriores
  previousButton.removeEventListener("click", previousButtonClickHandler);
  nextButton.removeEventListener("click", nextButtonClickHandler);

  // Agregar los nuevos manejadores de eventos
  previousButton.addEventListener("click", () =>
    previousButtonClickHandler(totalChapters)
  );
  nextButton.addEventListener("click", () =>
    nextButtonClickHandler(totalChapters)
  );

  // Agregar los nuevos botones al contenedor
  cajaBtn.appendChild(previousButton).className = "chapter-button-previous";
  cajaBtn.appendChild(nextButton).className = "chapter-button-next";
}

function previousButtonClickHandler(totalChapters) {
  if (currentChapter > 1) {
    getApis(concurreBooks, currentChapter - 1);
  }
}

function nextButtonClickHandler(totalChapters) {
  if (currentChapter < totalChapters) {
    getApis(concurreBooks, currentChapter + 1);
  }
}
