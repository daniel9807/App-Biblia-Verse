import "../biblia/style.css";
import "../biblia/respon.css";
import { libros } from "../biblia/libros";
import "/img/transistor-404.png";

const container = document.querySelector(".container");
const form = document.querySelector(".form");
const footer = document.querySelector(".footer");
const input = document.querySelector(".buscador");
const lists = document.querySelector(".list");
export const cajaBtn = document.createElement("div");
cajaBtn.className = "btn-caja";

let currentChapter = 1;
let concurreBooks = "";

export const baseURL =
  "https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api";

export function obtenerVersiculos(data, clean = true) {
  if (clean) {
    container.innerHTML = "";
    cajaBtn.innerHTML = "";
  }
  try {
    const libro = document.createElement("h1");
    libro.className = "title";

    const apiError = document.createElement("img");
    apiError.src = "/img/transistor-404.png";
    apiError.alt = "Logo Error de Búsqueda";

    const itemsChapter = [];

    data.forEach((item) => {
      const cajaTexto = document.createElement("p");
      cajaTexto.className = "caja-texto";

      const libros = document.createElement("h1");
      const title = item.reference;
      libro.textContent = title.replace(/[:.]\d+$/, "");

      const parrafos = document.createElement("p");
      const textoVersiculo =
        item && item.cleanText.replace(/^(\d+)(.*)/, "$1 $2").trim();
      parrafos.textContent = textoVersiculo;
      parrafos.className = "parrafo";

      footer.style.visibility = "visible";
      footer.style.opacity = "1";

      cajaTexto.append(libros, parrafos);
      itemsChapter.push(cajaTexto);
    });
    const itemsChapterOrdenados = itemsChapter.sort((a, b) => {
      const numeroA = parseInt(a.textContent.match(/^\d+/)[0]);
      const numeroB = parseInt(b.textContent.match(/^\d+/)[0]);
      return numeroA - numeroB;
    });

    container.append(cajaBtn, libro, ...itemsChapterOrdenados);
  } catch (error) {
    console.error("Error al obtener versículos:", error);
    const apiError = document.createElement("img");
    apiError.src = "/img/transistor-404.png";
    apiError.alt = "Logo Error de Búsqueda";
    const apiError2 = document.createElement("h1");
    apiError2.textContent = "Error al buscar";
    apiError2.className = "title";
    container.append(apiError2, apiError);
  }
}

let isFetching = false;

export async function getApi(books, verses) {
  try {
    if (isFetching) {
      return;
    }
    isFetching = true;
    const res = await fetch(`${baseURL}/books/${books}/verses/${verses}`);
    const data = await res.json();
    obtenerVersiculos(data, true);

    // Actualizar el capítulo actual después de obtener los versículos
    currentChapter = parseInt(verses, 10);
    concurreBooks = books;
    updateChapterButtons(data.length);
  } catch (error) {
    console.error("Error al obtener versículos:", error);
  } finally {
    isFetching = false;
  }
}

//  Busqueda por texto
document.addEventListener("DOMContentLoaded", function () {
  form.addEventListener("submit", function (b) {
    b.preventDefault();
    const query = input.value.replace(/\s/g, "");
    const [bi = "", ca = ""] = query.split(",");

    libros.forEach((libro) => {
      if (libro.name == bi) {
        const lo = libro.chapter;
        if (ca.length >= 1) {
          container.style.height = "auto";
          container.style.margin = "90px 0px 40px 0px";
          container.innerHTML = " ";
          footer.style.visibility = "hidden";
          footer.style.opacity = "0";
          getApi(lo, ca);
        }
      }
    });
  });

  input.addEventListener("keyup", function (e) {
    e.preventDefault();
    const bookNames = libros.map((libro) => libro.name);
    const inputValue = input.value.toLowerCase();
    const suggestions = [];
    if (inputValue.trim() === "") {
      clearSuggestions();
    } else {
      for (let i = 0; i < bookNames.length; i++) {
        if (bookNames[i].toLowerCase().startsWith(inputValue)) {
          suggestions.push(bookNames[i]);
        }
      }
      displaySuggestions(suggestions);
    }

    lists.addEventListener("click", (e) => {
      if (e.target.tagName === "LI") {
        input.value = e.target.textContent;
        clearSuggestions();
      }
    });

    function displaySuggestions(suggestions) {
      clearSuggestions();

      suggestions.forEach((suggestion) => {
        const listItem = document.createElement("li");
        listItem.textContent = suggestion;
        listItem.className = "listas";

        lists.appendChild(listItem);
      });
    }

    function clearSuggestions() {
      while (lists.firstChild) {
        lists.removeChild(lists.firstChild);
      }
    }
  });
});

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
      getApi(concurreBooks, currentChapter - 1);
    }
  });

  const nextButton = document.createElement("button");
  const btnNext = '<i class="fa-solid fa-circle-chevron-right ;"></i>';
  nextButton.innerHTML = btnNext;
  nextButton.addEventListener("click", () => {
    if (currentChapter < totalChapters) {
      getApi(concurreBooks, currentChapter + 1);
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
    getApi(concurreBooks, currentChapter - 1);
  }
}

function nextButtonClickHandler(totalChapters) {
  if (currentChapter < totalChapters) {
    getApi(concurreBooks, currentChapter + 1);
  }
}
