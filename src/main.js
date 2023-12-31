import "../src/styles/style.css";
import "../src/styles/respon.css";
import { libros } from "../src/libros";
import "/img/transistor-404.png";

const container = document.querySelector(".container");
const form = document.querySelector(".form");
const input = document.querySelector(".buscador");
const lists = document.querySelector(".list");
export const cajaBtn = document.createElement("div");
cajaBtn.className = "btn-caja";

let currentVerses = 1;
let concurreBooks = "";
let vozNum;
var numerVer = 0;
var numerCap = 0;
export const baseURL =
  "https://ajphchgh0i.execute-api.us-west-2.amazonaws.com/dev/api";

export function obtenerVersiculos(data, clean = true) {
  if (clean) {
    container.innerHTML = "";
    cajaBtn.innerHTML = "";
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
    container.append(cajaBtn, libro, ...itemsChapter);
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
    currentVerses = parseInt(verses.split(":")[1], 10);
    concurreBooks = books;
    vozNum = verses;
    await getCapitulos();
    updateVerseButtons(numerVer, numerCap);
  } catch (error) {
    console.error("Error al obtener versículos:", error);
  } finally {
    isFetching = false;
  }
}

export async function getCapitulos() {
  try {
    const res = await fetch(`${baseURL}/books/`);
    const data = await res.json();
    const selectedLibro = libros.find(
      (libro) => libro.chapter === concurreBooks
    );
    const capi = selectedLibro?.posicion;
    if (data && capi !== undefined) {
      let found = null;
      const info = data[capi];
      const cha2 = info.chapters;
      if (input.value && input.value.includes(",")) {
        const [nom, num] = input.value.split(",");
        var [num1, num2] = num.split(":");
        numerCap = num1;
      }
      if (vozNum == vozNum) {
        var [num1, num2] = vozNum.split(":");
        numerCap = num1;
      }
      cha2.forEach((chapter) => {
        const textos = [chapter];
        const encontre = textos.find((el) => el.chapter == parseInt(num1));
        if (encontre && encontre.osis_end) {
          found = encontre.osis_end;
        }
      });
      if (found) {
        let ultimosDosDigitoss = found.slice(-2);
        if (ultimosDosDigitoss && ultimosDosDigitoss.includes(".")) {
          const ultimosDosDigitos = found.slice(-1);
          const numV = parseInt(ultimosDosDigitos);
          numerVer = numV;
        } else {
          const numV = parseInt(ultimosDosDigitoss);
          numerVer = numV;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching chapters:", error);
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

function updateVerseButtons(totalVerses, capitulo) {
  // Eliminar botones anteriores si existen
  const existingButtons = document.querySelectorAll(
    ".chapter-button-previous, .chapter-button-next"
  );
  existingButtons.forEach((button) => button.remove());

  const previousButton = document.createElement("button");
  const btnPre = '<i class="fa-solid fa-circle-chevron-left ;"></i>';
  previousButton.innerHTML = btnPre;
  previousButton.addEventListener("click", async () => {
    if (currentVerses > 1) {
      currentVerses = currentVerses - 1;
      getApi(concurreBooks, `${capitulo}:${currentVerses}`);
    }
  });

  const nextButton = document.createElement("button");
  const btnNext = '<i class="fa-solid fa-circle-chevron-right ;"></i>';
  nextButton.innerHTML = btnNext;
  nextButton.addEventListener("click", async () => {
    if (currentVerses < totalVerses) {
      currentVerses = currentVerses + 1;
      getApi(concurreBooks, `${capitulo}:${currentVerses}`);
    }
  });

  // Agregar los nuevos botones al contenedor
  cajaBtn.appendChild(previousButton).className = "chapter-button-previous";
  cajaBtn.appendChild(nextButton).className = "chapter-button-next";
}
