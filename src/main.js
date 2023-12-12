import "../src/styles/style.css";
import "../src/styles/respon.css";
import { libros } from "../src/libros";
import "/img/transistor-404.png";

const container = document.querySelector(".container");
const form = document.querySelector(".form");
const input = document.querySelector(".buscador");
const lists = document.querySelector(".list");

export const baseURL =
  "https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api";

export function obtenerVersiculos(data, clean = true) {
  if (clean) {
    container.innerHTML = "";
  }
  const remplaNum = /\d/g;
  try {
    const libro = document.createElement("h1");
    const bibleIcon =
      "Libro  <i class='fa-solid fa-book-bible style=color: #292929'></i>";
    libro.innerHTML = bibleIcon;
    libro.className = "title";
    const apiError = document.createElement("img");
    apiError.src = "/img/transistor-404.png";
    apiError.alt = "Logo Error de Búsqueda";

    const itemsChapter = [];
    data.forEach((item) => {
      const cajaTexto = document.createElement("div");
      cajaTexto.className = "caja-texto";

      const capitulo = document.createElement("h3");
      capitulo.textContent =
        item && item.reference ? item.reference : "Referencia no disponible";
      capitulo.className = "capitulos";

      const parrafos = document.createElement("p");
      parrafos.textContent = ((item && item.cleanText) || apiError).replace(
        remplaNum,
        ""
      );
      parrafos.className = "parrafo";

      cajaTexto.append(capitulo, parrafos);
      itemsChapter.push(cajaTexto);
    });
    container.append(libro, ...itemsChapter);
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
    const [bi, ve] = query.split(",");
    libros.forEach((libro) => {
      if (libro.name == bi) {
        const lo = libro.chapter;
        if (ve.length > 1) {
          getApi(lo, ve);
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
