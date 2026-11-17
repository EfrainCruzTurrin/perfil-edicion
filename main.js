/* =========================================================
   ENLACES Y ARCHIVOS DEL SITIO — CAMBIA SOLO ESTO
   ========================================================= */

// Carpeta de Drive con los recursos gratis
const ENLACE_DRIVE = "https://drive.google.com/drive/folders/1FXDxT6zBFRgM-xHpAlX5bew2_E1DRwOv";

// Google Form de la lista de espera.
// Déjalo vacío ("") mientras no exista: el botón se ve apagado.
// Ejemplo: const ENLACE_LISTA_ESPERA = "https://forms.gle/xxxxxxxx";
const ENLACE_LISTA_ESPERA = "https://forms.gle/Jhf3aMgwKL9ht8q98";

// Perfil de TikTok
const ENLACE_TIKTOK = "https://www.tiktok.com/@perfil_edicion";

// Número de WhatsApp donde llega el formulario de contacto.
// Solo dígitos, con código de país (54) y el 9 de celular de Argentina.
const WHATSAPP = "5493533415352";

// Video de la portada (clip corto vertical, idealmente MP4 de menos de 2 MB).
// Déjalo vacío ("") y se muestra el símbolo animado.
// Ejemplo: const VIDEO_PORTADA = "video/portada.mp4";
const VIDEO_PORTADA = "";
// Imagen que se ve antes de que cargue el video (opcional).
// Ejemplo: const POSTER_PORTADA = "video/portada.webp";
const POSTER_PORTADA = "";

/* =========================================================
   A partir de aquí no hace falta tocar nada
   ========================================================= */

const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Enlaces ---------- */
document.querySelectorAll('[data-enlace="drive"]').forEach((a) => (a.href = ENLACE_DRIVE));
document.querySelectorAll('[data-enlace="tiktok"]').forEach((a) => (a.href = ENLACE_TIKTOK));

// Lista de espera: activa solo si hay enlace
const botonEspera = document.querySelector('[data-enlace="espera"]');
if (botonEspera && ENLACE_LISTA_ESPERA.trim() !== "") {
  botonEspera.href = ENLACE_LISTA_ESPERA;
  botonEspera.target = "_blank";
  botonEspera.rel = "noopener";
  botonEspera.removeAttribute("aria-disabled");
  botonEspera.removeAttribute("role");
  botonEspera.querySelector("[data-texto-boton]").textContent = "Unirme a la lista de espera";
}

/* ---------- Video de portada ---------- */
const marcoVideo = document.querySelector("[data-video-marco]");
if (marcoVideo && VIDEO_PORTADA.trim() !== "") {
  const video = marcoVideo.querySelector("video");
  const botonPausa = marcoVideo.querySelector("[data-video-pausa]");
  if (POSTER_PORTADA) video.poster = POSTER_PORTADA;
  video.src = VIDEO_PORTADA;
  video.preload = "metadata";
  marcoVideo.hidden = false;
  // Es un <svg>: la propiedad .hidden no existe, hay que usar el atributo
  document.querySelector("[data-simbolo]").setAttribute("hidden", "");

  // Con movimiento reducido, el video empieza en pausa
  const actualizarBoton = () => {
    botonPausa.textContent = video.paused ? "Reproducir video" : "Pausar video";
    botonPausa.setAttribute("aria-pressed", String(video.paused));
  };
  if (!sinMovimiento) video.play().catch(() => {});
  video.addEventListener("play", actualizarBoton);
  video.addEventListener("pause", actualizarBoton);
  botonPausa.addEventListener("click", () => (video.paused ? video.play() : video.pause()));
  actualizarBoton();
}

/* ---------- Formulario de contacto → WhatsApp ----------
   No hay servidor: se arma un mensaje con las respuestas y se abre
   WhatsApp con ese texto ya escrito. La persona solo toca "enviar". */
const formulario = document.querySelector("[data-formulario]");
if (formulario) {
  const error = formulario.querySelector("[data-formulario-error]");
  // Cómo se llama cada campo dentro del mensaje (en este orden)
  const ROTULOS = [
    ["nombre", "Nombre"],
    ["marca", "Negocio o marca"],
    ["rubro", "Rubro"],
    ["cuenta", "Cuenta"],
    ["servicio", "Necesito"],
    ["cantidad", "Videos al mes"],
    ["camara", "En cámara"],
    ["presupuesto", "Presupuesto mensual"],
    ["cuando", "Para empezar"],
    ["mensaje", "Además"],
  ];

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    // El navegador ya sabe qué falta (atributo required): se avisa del primero
    if (!formulario.checkValidity()) {
      const falta = formulario.querySelector(":invalid");
      const grupo = falta.closest("fieldset");
      const nombre = grupo ? grupo.querySelector("legend").textContent
                           : formulario.querySelector(`label[for="${falta.id}"]`).firstChild.textContent;
      error.textContent = `Falta responder: ${nombre.trim()}`;
      falta.focus();
      return;
    }
    error.textContent = "";

    const datos = new FormData(formulario);
    const lineas = ["Hola, vengo de tu web. Quiero videos para mi negocio.", ""];
    ROTULOS.forEach(([campo, rotulo]) => {
      const valor = (datos.get(campo) || "").toString().trim();
      if (valor) lineas.push(`${rotulo}: ${valor}`);
    });

    const enlace = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lineas.join("\n"))}`;
    // En una pestaña nueva; si el navegador la bloquea, en la misma.
    // (Con "noopener" window.open siempre devuelve null y no se sabría
    // si se abrió, por eso se corta el vínculo a mano con opener = null.)
    const ventana = window.open(enlace, "_blank");
    if (ventana) ventana.opener = null;
    else window.location.href = enlace;
  });
}

/* ---------- Trabajos: uno a la vez ----------
   Si alguien pone play en un video, los demás se pausan
   (si no, se pisan los sonidos). */
const videosTrabajos = document.querySelectorAll("[data-trabajos] video");
videosTrabajos.forEach((video) => {
  video.addEventListener("play", () => {
    videosTrabajos.forEach((otro) => { if (otro !== video) otro.pause(); });
  });
});

/* ---------- Barra de progreso del scroll ----------
   Si el navegador soporta animaciones por scroll en CSS, lo hace styles.css.
   Si no, este respaldo hace lo mismo con JavaScript. */
const barra = document.querySelector(".progreso__barra");
if (barra && !(window.CSS && CSS.supports("animation-timeline: scroll()"))) {
  let pendiente = false;
  const pintar = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    pendiente = false;
  };
  window.addEventListener("scroll", () => {
    if (!pendiente) { pendiente = true; requestAnimationFrame(pintar); }
  }, { passive: true });
  pintar();
}

/* ---------- Números que cuentan hacia arriba ---------- */
function contar(el) {
  const final = parseFloat(el.dataset.contar);
  const pre = el.dataset.prefijo || "";
  const suf = el.dataset.sufijo || "";
  const dec = parseInt(el.dataset.decimales || "0", 10);
  const duracion = 1200;
  const inicio = performance.now();
  const paso = (ahora) => {
    const t = Math.min((ahora - inicio) / duracion, 1);
    const suave = 1 - Math.pow(1 - t, 3); // frena al final
    const valor = t < 1 ? (final * suave).toFixed(dec) : String(final);
    el.textContent = pre + valor + suf;
    if (t < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}

/* ---------- Entradas escalonadas al hacer scroll ---------- */
if (!sinMovimiento && "IntersectionObserver" in window) {
  document.documentElement.classList.add("con-animacion");

  // Cada hijo de un bloque .escalonado entra un poco después que el anterior
  document.querySelectorAll(".escalonado").forEach((lista) => {
    [...lista.children].forEach((hijo, i) => hijo.style.setProperty("--i", i));
  });

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      if (e.target.hasAttribute("data-contadores")) {
        e.target.querySelectorAll("[data-contar]").forEach(contar);
      }
      observador.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".aparecer").forEach((el) => observador.observe(el));
}

/* ---------- Candado que se sacude al tocar (en celular no hay hover) ---------- */
if (!sinMovimiento) {
  document.querySelectorAll("[data-bloqueada]").forEach((tarjeta) => {
    tarjeta.addEventListener("click", () => {
      tarjeta.classList.remove("sacudir");
      void tarjeta.offsetWidth; // reinicia la animación
      tarjeta.classList.add("sacudir");
    });
    tarjeta.addEventListener("animationend", () => tarjeta.classList.remove("sacudir"));
  });
}

/* ---------- Compartir esta página ---------- */
const botonCompartir = document.querySelector("[data-compartir]");
const estadoCompartir = document.querySelector("[data-compartir-estado]");
if (botonCompartir) {
  botonCompartir.addEventListener("click", async () => {
    const datos = { title: document.title, url: location.href };
    try {
      if (navigator.share) {
        await navigator.share(datos); // menú nativo del celular
      } else {
        await navigator.clipboard.writeText(datos.url);
        estadoCompartir.textContent = "Enlace copiado. Ya puedes pegarlo donde quieras.";
      }
    } catch (error) {
      // Si la persona cierra el menú, no pasa nada
      if (error && error.name !== "AbortError") {
        estadoCompartir.textContent = "No se pudo copiar. Copia la dirección desde la barra del navegador.";
      }
    }
  });
}
