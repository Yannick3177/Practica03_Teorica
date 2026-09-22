// ====== VARIABLES GLOBALES ======
const areaParticipantes = document.getElementById("areaParticipantes");
const contadorParticipantes = document.getElementById("contadorParticipantes");
const selectorCantidad = document.getElementById("selectorCantidad");
const campoTitulo = document.getElementById("campoTitulo");
const pantallaConfig = document.getElementById("pantallaConfig");
const pantallaResultados = document.getElementById("pantallaResultados");
const gridEquipos = document.getElementById("gridEquipos");

const MAXIMO_PARTICIPANTES = 100;
const MAXIMO_CARACTERES = 50;
let equiposGenerados = [];

// ====== F1: RECUPERAR / GUARDAR EN LOCAL STORAGE ======
function recuperarParticipantes() {
  const guardado = localStorage.getItem("participantesSorteo");
  if (guardado !== null) areaParticipantes.value = guardado;
  actualizarContador();
}
function guardarParticipantes() {
  localStorage.setItem("participantesSorteo", areaParticipantes.value);
}

// Obtener lista limpia de participantes (respeta límites)
function obtenerParticipantes() {
  return areaParticipantes.value
    .split("\n")
    .map((linea) => linea.trim().substring(0, MAXIMO_CARACTERES))
    .filter((linea) => linea.length > 0)
    .slice(0, MAXIMO_PARTICIPANTES);
}

function actualizarContador() {
  contadorParticipantes.textContent = obtenerParticipantes().length;
}

// ====== F2: LLENAR LISTA DESPLEGABLE SEGÚN EL MODO ======
function llenarSelector() {
  const modo = document.querySelector('input[name="modo"]:checked').value;
  selectorCantidad.innerHTML = "";
  if (modo === "equipos") {
    for (let i = 2; i <= 20; i++) {
      const opcion = document.createElement("option");
      opcion.value = i;
      opcion.textContent = i + " equipos";
      selectorCantidad.appendChild(opcion);
    }
  } else {
    for (let i = 2; i <= 20; i++) {
      const opcion = document.createElement("option");
      opcion.value = i;
      opcion.textContent = i + " participantes por equipo";
      selectorCantidad.appendChild(opcion);
    }
  }
}

// ====== MEZCLAR ALEATORIAMENTE (algoritmo Fisher-Yates) ======
function mezclar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// ====== F3: GENERAR EQUIPOS ALEATORIAMENTE ======
function generarEquipos() {
  const participantes = mezclar(obtenerParticipantes());
  if (participantes.length < 2) {
    alert("Ingresa al menos 2 participantes.");
    return;
  }

  const modo = document.querySelector('input[name="modo"]:checked').value;
  const valor = parseInt(selectorCantidad.value, 10);

  let cantidadEquipos;
  if (modo === "equipos") {
    cantidadEquipos = valor;
  } else {
    cantidadEquipos = Math.ceil(participantes.length / valor);
  }

  // crear los equipos vacíos
  equiposGenerados = [];
  for (let i = 0; i < cantidadEquipos; i++) equiposGenerados.push([]);

  // repartir uno a uno (distribución equilibrada)
  participantes.forEach((persona, indice) => {
    equiposGenerados[indice % cantidadEquipos].push(persona);
  });

  mostrarResultados();
}

// ====== MOSTRAR PANTALLA 2 CON LOS EQUIPOS ======
function mostrarResultados() {
  const titulo = campoTitulo.value.trim() || "Equipos";
  document.getElementById("tituloResultados").textContent = titulo;

  gridEquipos.innerHTML = "";
  equiposGenerados.forEach((integrantes, indice) => {
    const divEquipo = document.createElement("div");
    divEquipo.className = "equipo";

    const subtitulo = document.createElement("h3");
    subtitulo.textContent = "Equipo " + (indice + 1);
    divEquipo.appendChild(subtitulo);

    const lista = document.createElement("ul");
    integrantes.forEach((persona) => {
      const item = document.createElement("li");
      item.textContent = persona;
      lista.appendChild(item);
    });
    divEquipo.appendChild(lista);
    gridEquipos.appendChild(divEquipo);
  });

  pantallaConfig.style.display = "none";
  pantallaResultados.style.display = "block";
}

// ====== F4: DESCARGAR COMO JPG (canvas puro, sin librerías) ======
function descargarJPG() {
  const anchoCol = 220,
    alto =
      60 +
      equiposGenerados.reduce((max, e) => Math.max(max, e.length), 0) * 26 +
      40;
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.max(equiposGenerados.length * anchoCol + 40, 400);
  lienzo.height = alto;
  const ctx = lienzo.getContext("2d");

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.fillStyle = "#c0286b";
  ctx.font = "bold 18px Arial";
  ctx.fillText(document.getElementById("tituloResultados").textContent, 20, 30);

  equiposGenerados.forEach((integrantes, i) => {
    const x = 20 + i * anchoCol;
    ctx.fillStyle = "#c0286b";
    ctx.font = "bold 15px Arial";
    ctx.fillText("Equipo " + (i + 1), x, 60);
    ctx.fillStyle = "#222";
    ctx.font = "14px Arial";
    integrantes.forEach((persona, j) => {
      ctx.fillText(persona, x, 85 + j * 24);
    });
  });

  const enlace = document.createElement("a");
  enlace.download = "equipos.jpg";
  enlace.href = lienzo.toDataURL("image/jpeg", 0.95);
  enlace.click();
}

// ====== F4: COPIAR AL PORTAPAPELES (texto plano) ======
function copiarTexto() {
  let texto = document.getElementById("tituloResultados").textContent + "\n\n";
  equiposGenerados.forEach((integrantes, i) => {
    texto += "Equipo " + (i + 1) + ":\n";
    integrantes.forEach((p) => (texto += "  - " + p + "\n"));
    texto += "\n";
  });
  navigator.clipboard.writeText(texto).then(() => alert("¡Equipos copiados!"));
}

// ====== F4: COPIAR POR COLUMNAS (separado por tabulaciones) ======
function copiarPorColumnas() {
  const maxFilas = equiposGenerados.reduce(
    (max, e) => Math.max(max, e.length),
    0,
  );
  let texto =
    equiposGenerados.map((_, i) => "Equipo " + (i + 1)).join("\t") + "\n";
  for (let fila = 0; fila < maxFilas; fila++) {
    texto += equiposGenerados.map((e) => e[fila] || "").join("\t") + "\n";
  }
  navigator.clipboard
    .writeText(texto)
    .then(() => alert("¡Copiado por columnas!"));
}

// ====== EVENTOS ======
areaParticipantes.addEventListener("input", function () {
  guardarParticipantes();
  actualizarContador();
});
document
  .querySelectorAll('input[name="modo"]')
  .forEach((radio) => radio.addEventListener("change", llenarSelector));
document
  .getElementById("botonGenerar")
  .addEventListener("click", generarEquipos);
document.getElementById("botonLimpiar").addEventListener("click", function () {
  areaParticipantes.value = "";
  campoTitulo.value = "";
  guardarParticipantes();
  actualizarContador();
});
document.getElementById("botonVolver").addEventListener("click", function () {
  pantallaResultados.style.display = "none";
  pantallaConfig.style.display = "block";
});
document
  .getElementById("botonDescargar")
  .addEventListener("click", descargarJPG);
document.getElementById("botonCopiar").addEventListener("click", copiarTexto);
document
  .getElementById("botonCopiarColumnas")
  .addEventListener("click", copiarPorColumnas);

// ====== INICIO ======
llenarSelector();
recuperarParticipantes();
