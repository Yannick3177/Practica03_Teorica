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
// ====== F1 + F2: DIBUJAR LA RULETA ======
function dibujarRuleta() {
  const activos = obtenerElementosActivos();
  contexto.clearRect(0, 0, lienzo.width, lienzo.height);

  if (activos.length === 0) {
    contexto.beginPath();
    contexto.arc(radio, radio, radio - 2, 0, 2 * Math.PI);
    contexto.fillStyle = "#ddd";
    contexto.fill();
    return;
  }

  const anguloPorSector = (2 * Math.PI) / activos.length;

  activos.forEach((elemento, indice) => {
    const anguloInicio = anguloActual + indice * anguloPorSector;
    const anguloFin = anguloInicio + anguloPorSector;

    // sector
    contexto.beginPath();
    contexto.moveTo(radio, radio);
    contexto.arc(radio, radio, radio - 2, anguloInicio, anguloFin);
    contexto.closePath();
    contexto.fillStyle = coloresBasicos[indice % coloresBasicos.length];
    contexto.fill();
    contexto.strokeStyle = "#fff";
    contexto.lineWidth = 2;
    contexto.stroke();

    // texto
    contexto.save();
    contexto.translate(radio, radio);
    contexto.rotate(anguloInicio + anguloPorSector / 2);
    contexto.textAlign = "right";
    contexto.fillStyle = "#222";
    contexto.font = "bold 20px Arial";
    contexto.fillText(elemento, radio - 20, 8);
    contexto.restore();
  });
}
// ====== F1: DETERMINAR EL ELEMENTO BAJO EL TRIÁNGULO (lado derecho = ángulo 0) ======
function calcularSeleccionado() {
  const activos = obtenerElementosActivos();
  if (activos.length === 0) return "";
  const anguloPorSector = (2 * Math.PI) / activos.length;
  // normalizar el ángulo actual a [0, 2π)
  let anguloNormalizado = anguloActual % (2 * Math.PI);
  if (anguloNormalizado < 0) anguloNormalizado += 2 * Math.PI;
  // el indicador está a la derecha (ángulo 0). Sector = cuánto retrocede desde 0
  const indice = Math.floor(
    ((2 * Math.PI - anguloNormalizado) % (2 * Math.PI)) / anguloPorSector
  );
  return activos[indice];
}

// ====== F3: GIRAR LA RULETA ALEATORIAMENTE ======
function girarRuleta() {
  if (estaGirando) return;
  const activos = obtenerElementosActivos();
  if (activos.length === 0) return;

  estaGirando = true;
  const vueltasExtra = 5 + Math.random() * 5;   // entre 5 y 10 vueltas
  const anguloFinal = anguloActual + vueltasExtra * 2 * Math.PI;
  const anguloInicial = anguloActual;
  const duracion = 4000;
  const tiempoInicio = performance.now();

  function animar(tiempoActual) {
    const transcurrido = tiempoActual - tiempoInicio;
    const progreso = Math.min(transcurrido / duracion, 1);
    // easing para desacelerar
    const suavizado = 1 - Math.pow(1 - progreso, 3);
    anguloActual = anguloInicial + (anguloFinal - anguloInicial) * suavizado;
    dibujarRuleta();

    if (progreso < 1) {
      requestAnimationFrame(animar);
    } else {
      estaGirando = false;
      ultimoSeleccionado = calcularSeleccionado();
      cajaRespuesta.textContent = ultimoSeleccionado;
    }
  }
  requestAnimationFrame(animar);
}
// ====== F7: OCULTAR EL ÚLTIMO SELECCIONADO (tecla S) ======
function ocultarSeleccionado() {
  if (!ultimoSeleccionado) return;
  if (!elementosOcultos.includes(ultimoSeleccionado)) {
    elementosOcultos.push(ultimoSeleccionado);
  }
  resaltarEnTextarea(ultimoSeleccionado);
  dibujarRuleta();
}

// Resalta en gris (selección) el último sorteado dentro del textarea
function resaltarEnTextarea(texto) {
  const contenido = areaElementos.value;
  const inicio = contenido.indexOf(texto);
  if (inicio >= 0) {
    areaElementos.focus();
    areaElementos.setSelectionRange(inicio, inicio + texto.length);
  }
}
// ====== F8: REINICIAR (tecla R o botón) ======
function reiniciar() {
  elementosOcultos = [];
  ultimoSeleccionado = "";
  cajaRespuesta.textContent = "RESPUESTA";
  dibujarRuleta();
}

// ====== F9: PANTALLA COMPLETA (tecla F) ======
function alternarPantallaCompleta() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
// ====== EVENTOS ======
// Click sobre la ruleta -> girar
lienzo.addEventListener("click", girarRuleta);
document.getElementById("botonIniciar").addEventListener("click", girarRuleta);
document.getElementById("botonReiniciar").addEventListener("click", reiniciar);

// F4 + F6: editar textarea -> guardar y actualizar ruleta automáticamente
areaElementos.addEventListener("input", function () {
  guardarDatos();
  actualizarListaDesdeTexto();
});

// Botón editar / click en textarea -> enfocar para edición
document.getElementById("botonEditar").addEventListener("click", () => areaElementos.focus());

// Botón esconder -> oculta el seleccionado
document.getElementById("botonEsconder").addEventListener("click", ocultarSeleccionado);

// Botón título -> agrega una cabecera al textarea
document.getElementById("botonTitulo").addEventListener("click", function () {
  const titulo = prompt("Título de la ruleta:");
  if (titulo) {
    cajaRespuesta.textContent = titulo;
  }
});
// Teclas: SPACE gira, S oculta, R reinicia, E edita, F pantalla completa
document.addEventListener("keydown", function (evento) {
  // si estás escribiendo en el textarea, solo respetamos ediciones
  const escribiendo = document.activeElement === areaElementos;

  if (evento.code === "Space" && !escribiendo) {
    evento.preventDefault();
    girarRuleta();
  } else if ((evento.key === "s" || evento.key === "S") && !escribiendo) {
    ocultarSeleccionado();
  } else if ((evento.key === "r" || evento.key === "R") && !escribiendo) {
    reiniciar();
  } else if (evento.key === "e" || evento.key === "E") {
    if (!escribiendo) {
      evento.preventDefault();
      areaElementos.focus();
    }
  } else if ((evento.key === "f" || evento.key === "F") && !escribiendo) {
    alternarPantallaCompleta();
  }
});

// ====== INICIO ======
recuperarDatos();