/* ============================================================
Examen UF1842 - script unificado
============================================================
    Descripción:
    Este script implementa las funcionalidades requeridas para 
    varios ejercicios prácticos del módulo, incluyendo validación 
    de formularios, efectos visuales con jQuery, modales accesibles 
    y un juego interactivo de adivinar un número.

  Requisitos:
  - jQuery 3.x o superior cargado antes de este script.
  - Estructura HTML con:
       * Formulario con id="datosPersonales"p
       * Botones con id="enviar_datos" y id="mostrar_datos"
       * Elementos para modal con id="modal-datos" y clase="cerrar"
       * Imagen con clase="zoomable"
       * Texto con id="texto-crece"
       * Elementos del juego con id="intento", id="probar" y id="mensaje-juego"
- Clases CSS adicionales para estilos de resaltado:
       * .mayor  → texto cuando el número secreto es mayor
       * .menor  → texto cuando el número secreto es menor
       * .secreto → para destacar el número secreto en el juego

Funcionalidades:
  - Validación del formulario con manejo de errores por try/catch.
  - Modal accesible: abrir, cerrar con botón, overlay y tecla ESC.
  - Efectos jQuery: hover zoom en imagen, animación de texto al clic.
  - Juego de adivinar número (1-100) con 10 intentos, feedback en vivo y reinicio automático.
  - Código modular organizado en secciones para fácil mantenimiento.
*/

$(function () {
  /* =========================
    9.5.1 Imagen: zoom al hover
     ========================= */
  $(".zoomable").hover(
    function () {
      $(this).css("transform", "scale(1.35)");
    },
    function () {
      $(this).css("transform", "scale(1)");
    }
  );

  /* =========================
    9.5.2 Texto que crece y vuelve
    ========================= */
  $("#texto-crece").on("click", function () {
    $(this)
      .stop(true)
      .animate({ fontSize: "24px" }, 500)
      .delay(1000)
      .animate({ fontSize: "16px" }, 500);
  });

  /* =========================
    Utilidades de formulario
     ========================= */
  function limpiarErrores() {
    $(".error-msg").text("");
  }

  function validarFormulario() {
    limpiarErrores();
    let ok = true;

    const nombre = $("#nombre").val().trim();
    const apellidos = $("#apellidos").val().trim();
    const estadoCivil = $("#estadoCivil").val();
    const idiomasMarcados = $('input[name="idiomas"]:checked').length;
    const profesionMarcada = $('input[name="profesion"]:checked').length;
    const reNombre = /^(?=.{2,40}$)[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]+$/;

    if (!reNombre.test(nombre)) {
      $("#nombre")
        .closest(".form-field")
        .find(".error-msg")
        .text("Nombre no válido (solo letras y espacios).");
      ok = false;
    }
    if (!apellidos) {
      $("#apellidos")
        .closest(".form-field")
        .find(".error-msg")
        .text("Apellidos obligatorios.");
      ok = false;
    }
    if (!estadoCivil) {
      $("#estadoCivil")
        .closest(".form-field")
        .find(".error-msg")
        .text("Selecciona un estado civil.");
      ok = false;
    }
    if (idiomasMarcados === 0) {
      $("fieldset.group")
        .first()
        .find(".error-msg")
        .text("Selecciona al menos un idioma.");
      ok = false;
    }
    if (profesionMarcada === 0) {
      $("fieldset.group")
        .last()
        .find(".error-msg")
        .text("Selecciona una profesión.");
      ok = false;
    }
    return ok;
  }

  /* Envío y mostrar datos */
  $("#datosPersonales").on("submit", function (e) {
    e.preventDefault();
    if (validarFormulario()) mostrarDatos();
  });
  $("#mostrar_datos").on("click", function () {
    if (validarFormulario()) mostrarDatos();
    $("#datosPersonales")[0].reset(); 
  });

  function mostrarDatos() {
    const nombre = $("#nombre").val().trim();
    const apellidos = $("#apellidos").val().trim();
    const estadoCivil = $("#estadoCivil option:selected").text();
    const idiomas = $('input[name="idiomas"]:checked')
      .map((_, el) => el.value)
      .get()
      .join(", ");
    const profesion =
      $('input[name="profesion"]:checked').val() || "(sin marcar)";
    const comentarios = $("#comentarios").val().trim();

    const html =
      `<p><strong>Nombre:</strong> ${nombre}</p>` +
      `<p><strong>Apellidos:</strong> ${apellidos}</p>` +
      `<p><strong>Estado Civil:</strong> ${estadoCivil}</p>` +
      `<p><strong>Idiomas:</strong> ${idiomas}</p>` +
      `<p><strong>Profesión:</strong> ${profesion}</p>` +
      `<p><strong>Comentarios:</strong> ${comentarios || "(vacío)"}</p>`;

    $("#datos-formulario").html(html);
    abrirModal();
  }

  /* =========================
    Modal (abrir/cerrar)
     ========================= */
  function abrirModal() {
    $("#modal-datos").fadeIn(150).css("display", "flex");
  }
  function cerrarModal() {
    $("#modal-datos").fadeOut(150);
  }

  $(".cerrar").on("click", function () {
    cerrarModal();
    $("#datosPersonales")[0].reset();
    limpiarErrores();
  });
  $("#modal-datos").on("click", function (e) {
    if (e.target === this) cerrarModal();
  });
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") cerrarModal();
  });

  /* =========================
  9.6 Juego: Adivina el número
  ========================= */
  let secreto = Math.floor(Math.random() * 100) + 1;
  let intentosRestantes = 10;

  function feedbackJuego(msg) {
    $("#mensaje-juego").html(msg);
  }

  function resetGame() {
    secreto = Math.floor(Math.random() * 100) + 1;
    intentosRestantes = 10;
    $("#probar").prop("disabled", false);
    $("#intento").val("").focus();
    feedbackJuego("Nuevo número generado. <strong>¡Prueba otra vez!</strong>");
  }

  function probarNumero() {
    const inputVal = $("#intento").val().trim();
    if (inputVal === "")
      return feedbackJuego("Introduce un número del 1 al 100.");
    const val = Number(inputVal);
    if (!Number.isInteger(val) || val < 1 || val > 100) {
      return feedbackJuego("Introduce un número válido del 1 al 100.");
    }

    // Acierto
    if (val === secreto) {
      feedbackJuego(
        `¡Correcto! 🎉 Era <span class="secreto">${secreto}</span>. Reiniciando...`
      );
      $("#probar").prop("disabled", true);
      return setTimeout(resetGame, 4000);
    }

    // Fallo
    intentosRestantes--;
    if (intentosRestantes <= 0) {
      feedbackJuego(
        `Sin intentos el número era <span class="secreto">${secreto}</span>. Reiniciando ...`
      );
      $("#probar").prop("disabled", true);
      return setTimeout(resetGame, 4000);
    }

    // Pista MAYOR/MENOR
    const clase = val < secreto ? "mayor" : "menor";
    const label = val < secreto ? "MAYOR" : "MENOR";
    feedbackJuego(
      `El numero es <span class="${clase}">${label}</span> que <strong>${val}</strong>.  Intentos restantes: ${intentosRestantes}`
    );

    $("#intento").val("").focus();
  }

  // Click y Enter
  $("#probar").on("click", probarNumero);
  $("#intento").on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      probarNumero();
    }
  });
});
/* =========================
    Comentarios finales (9.8)
    =========================
    - Validación de formulario con mensajes de error dinámicos.
    - Modal accesible: cerrar por botón, clic en overlay y tecla ESC.
    - Efectos jQuery:
        * Imagen con zoom al pasar el ratón.
        * Texto que crece al hacer clic y vuelve a su tamaño original.
    - Juego de adivinar número:
        * 10 intentos con feedback dinámico.
        * Palabras clave resaltadas con colores y negritas.
        * Reinicio automático tras acierto o agotar intentos.
    - Código organizado y dividido por secciones temáticas.
    - Uso de .html() para permitir estilos en mensajes del juego.
  */
