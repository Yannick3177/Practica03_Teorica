// ====== VARIABLES GLOBALES (nombres descriptivos en español) ======
const lienzo = document.getElementById("lienzoRuleta");
const contexto = lienzo.getContext("2d");
const areaElementos = document.getElementById("areaElementos");
const cajaRespuesta = document.getElementById("respuesta");

const coloresBasicos = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6"]; // F2: 5 colores
const radio = lienzo.width / 2;

let listaElementos = [];        // todos los elementos del textarea
let elementosOcultos = [];      // elementos ocultos para el sorteo (tecla S)
let anguloActual = 0;           // rotación actual de la ruleta
let estaGirando = false;
let ultimoSeleccionado = "";
// ====== F5: RECUPERAR DESDE LOCAL STORAGE ======
function recuperarDatos() {
  const guardado = localStorage.getItem("elementosRuleta");
  areaElementos.value = guardado !== null
    ? guardado
    : "1\n2\n3\n4\n5\n6\n7\n8\n9\n10\n11\n12";
  actualizarListaDesdeTexto();
}

// ====== F5: GUARDAR EN LOCAL STORAGE ======
function guardarDatos() {
  localStorage.setItem("elementosRuleta", areaElementos.value);
}

// ====== F3 + F6: obtener elementos del textarea y redibujar ======
function actualizarListaDesdeTexto() {
  listaElementos = areaElementos.value
    .split("\n")
    .map((linea) => linea.trim())
    .filter((linea) => linea.length > 0);
  dibujarRuleta();
}

// Elementos que sí participan (no ocultos)
function obtenerElementosActivos() {
  return listaElementos.filter((el) => !elementosOcultos.includes(el));
}