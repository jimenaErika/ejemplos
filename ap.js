// Carchi Lácteo · lógica del prototipo
// Las empresas de ejemplo son inventadas. En el sitio real vendrían de una base de datos.

const CANTONES = ['Tulcán', 'San Pedro de Huaca', 'Montúfar', 'Bolívar', 'Espejo', 'Mira'];
const TIPOS = ['Planta procesadora', 'Quesería artesanal', 'Centro de acopio', 'Asociación'];
const PRODUCTOS = ['Leche', 'Queso fresco', 'Queso maduro', 'Yogur', 'Mantequilla', 'Manjar', 'Crema'];

// Posición aproximada de cada cantón en el mapa esquemático (no a escala)
const POSICION = {
  'Tulcán': [300, 70],
  'San Pedro de Huaca': [362, 110],
  'Montúfar': [300, 170],
  'Bolívar': [245, 215],
  'Espejo': [180, 150],
  'Mira': [95, 200]
};

let empresas = [
  { id: 1, nombre: 'Lácteos Páramo Verde', tipo: 'Planta procesadora', canton: 'Tulcán', parroquia: 'Julio Andrade', productos: ['Leche', 'Queso fresco', 'Yogur', 'Mantequilla'], litros: 8000, verificada: true, descripcion: 'Planta con línea de pasteurización y distribución a la Sierra norte.' },
  { id: 2, nombre: 'Quesera Frailejón', tipo: 'Quesería artesanal', canton: 'Espejo', parroquia: 'El Ángel', productos: ['Queso fresco', 'Queso maduro'], litros: 600, verificada: true, descripcion: 'Quesos de receta familiar con leche de la reserva El Ángel.' },
  { id: 3, nombre: 'Asociación Lecheros de Huaca', tipo: 'Asociación', canton: 'San Pedro de Huaca', parroquia: 'Huaca', productos: ['Leche'], litros: 3500, verificada: false, descripcion: 'Reúne a pequeños productores de la parroquia.' },
  { id: 4, nombre: 'Centro de Acopio San Gabriel', tipo: 'Centro de acopio', canton: 'Montúfar', parroquia: 'San Gabriel', productos: ['Leche'], litros: 5000, verificada: true, descripcion: 'Acopio y enfriamiento de leche para plantas de la provincia.' },
  { id: 5, nombre: 'Delicias de Mira', tipo: 'Quesería artesanal', canton: 'Mira', parroquia: 'Mira', productos: ['Queso fresco', 'Manjar'], litros: 300, verificada: false, descripcion: 'Manjar de leche y quesos frescos para tiendas de barrio.' },
  { id: 6, nombre: 'Yogur Estrella del Norte', tipo: 'Planta procesadora', canton: 'Tulcán', parroquia: 'Tulcán', productos: ['Yogur', 'Manjar', 'Crema'], litros: 1500, verificada: true, descripcion: 'Yogur natural y de frutas andinas.' },
  { id: 7, nombre: 'Quesos Bolívar Andino', tipo: 'Quesería artesanal', canton: 'Bolívar', parroquia: 'Bolívar', productos: ['Queso fresco', 'Queso maduro', 'Mantequilla'], litros: 450, verificada: false, descripcion: 'Queso amasado y mantequilla de campo.' },
  { id: 8, nombre: 'Lácteos El Ángel', tipo: 'Planta procesadora', canton: 'Espejo', parroquia: 'El Ángel', productos: ['Leche', 'Queso fresco', 'Yogur', 'Mantequilla', 'Crema'], litros: 4000, verificada: true, descripcion: 'Productos lácteos para supermercados de Ibarra y Quito.' }
];

// Las empresas aprobadas en el prototipo se guardan en este navegador
try {
  const guardadas = JSON.parse(localStorage.getItem('carchi-lacteo-empresas') || '[]');
  if (Array.isArray(guardadas)) empresas = empresas.concat(guardadas);
} catch (e) { /* sin almacenamiento: se usa solo la lista de ejemplo */ }

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const escapar = txt => String(txt).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Tarjeta reutilizable ----------
function tarjeta(e) {
  return `<a class="tarjeta" href="#empresa-${e.id}">
    <div class="cabeza">
      <span class="inicial" aria-hidden="true">${escapar(e.nombre.charAt(0))}</span>
      <div><h3>${escapar(e.nombre)}</h3><span class="lugar">${escapar(e.parroquia)}, ${escapar(e.canton)} · ${escapar(e.tipo)}</span></div>
    </div>
    <ul class="chips">${e.productos.map(p => `<li>${escapar(p)}</li>`).join('')}</ul>
    ${e.verificada ? '<span class="sello">✓ Empresa verificada</span>' : ''}
  </a>`;
}

// ---------- Inicio ----------
function pintarInicio() {
  $('#cifra-empresas').textContent = empresas.length;
  $('#cifra-cantones').textContent = new Set(empresas.map(e => e.canton)).size;
  $('#cifra-verificadas').textContent = empresas.filter(e => e.verificada).length;
  $('#destacadas').innerHTML = empresas.filter(e => e.verificada).slice(0, 3).map(tarjeta).join('');
}

// ---------- Directorio ----------
const filtro = { texto: '', canton: '', tipo: '', productos: new Set() };

function prepararFiltros() {
  $('#filtro-canton').innerHTML += CANTONES.map(c => `<option>${c}</option>`).join('');
  $('#filtro-tipo').innerHTML += TIPOS.map(t => `<option>${t}</option>`).join('');
  $('#filtro-productos').innerHTML = PRODUCTOS.map((p, i) =>
    `<span class="chip-filtro"><input type="checkbox" id="fp-${i}" value="${p}"><label for="fp-${i}">${p}</label></span>`).join('');

  $('#buscar').addEventListener('input', ev => { filtro.texto = ev.target.value.trim().toLowerCase(); pintarDirectorio(); });
  $('#filtro-canton').addEventListener('change', ev => { filtro.canton = ev.target.value; pintarDirectorio(); });
  $('#filtro-tipo').addEventListener('change', ev => { filtro.tipo = ev.target.value; pintarDirectorio(); });
  $('#filtro-productos').addEventListener('change', ev => {
    ev.target.checked ? filtro.productos.add(ev.target.value) : filtro.productos.delete(ev.target.value);
    pintarDirectorio();
  });
}

function pintarDirectorio() {
  const lista = empresas.filter(e => {
    const texto = `${e.nombre} ${e.canton} ${e.parroquia} ${e.productos.join(' ')}`.toLowerCase();
    return (!filtro.texto || texto.includes(filtro.texto))
      && (!filtro.canton || e.canton === filtro.canton)
      && (!filtro.tipo || e.tipo === filtro.tipo)
      && [...filtro.productos].every(p => e.productos.includes(p));
  });
  $('#contador').textContent = `${lista.length} ${lista.length === 1 ? 'empresa encontrada' : 'empresas encontradas'}`;
  $('#resultados').innerHTML = lista.length
    ? lista.map(tarjeta).join('')
    : '<p class="vacio">No hay empresas con esos filtros. Pruebe quitando alguno.</p>';
  pintarMapa();
}

function pintarMapa() {
  const silueta = '<path d="M40 210 L90 170 L150 120 L230 95 L270 40 L340 30 L395 85 L380 150 L330 200 L280 245 L180 250 L100 245 Z" fill="var(--crema)" stroke="var(--borde)" stroke-width="2"/>';
  const puntos = CANTONES.map(c => {
    const [x, y] = POSICION[c];
    const n = empresas.filter(e => e.canton === c).length;
    const r = 13 + n * 2;
    const activo = filtro.canton === c ? ' stroke="var(--amarillo-queso)" stroke-width="4"' : '';
    return `<g class="canton" tabindex="0" role="button" data-canton="${c}" aria-label="${c}: ${n} empresas">
      <circle cx="${x}" cy="${y}" r="${r}"${activo}/>
      <text class="num" x="${x}" y="${y + 4}" text-anchor="middle">${n}</text>
      <text x="${x}" y="${y + r + 16}" text-anchor="middle">${c === 'San Pedro de Huaca' ? 'Huaca' : c}</text>
    </g>`;
  }).join('');
  $('#mapa').innerHTML = silueta + puntos;
}

function elegirCanton(c) {
  filtro.canton = filtro.canton === c ? '' : c;
  $('#filtro-canton').value = filtro.canton;
  pintarDirectorio();
}

// ---------- Ficha ----------
function pintarFicha(id) {
  const e = empresas.find(x => x.id === id);
  if (!e) { $('#ficha').innerHTML = '<p class="vacio">No encontramos esa empresa. <a href="#directorio">Volver al directorio</a></p>'; return; }
  document.title = `${e.nombre} · Carchi Lácteo`;
  $('#ficha').innerHTML = `
    <p><a href="#directorio">← Volver al directorio</a></p>
    <div class="ficha" style="margin-top:16px">
      <div class="panel">
        <div class="cabeza" style="display:flex;gap:12px;align-items:center">
          <span class="inicial" aria-hidden="true">${escapar(e.nombre.charAt(0))}</span>
          <div><h1>${escapar(e.nombre)}</h1><span class="lugar">${escapar(e.tipo)}</span></div>
        </div>
        ${e.verificada ? '<span class="sello">✓ Empresa verificada</span>' : ''}
        <p>${escapar(e.descripcion || 'Sin descripción.')}</p>
        <h2>Productos</h2>
        <ul class="chips">${e.productos.map(p => `<li>${escapar(p)}</li>`).join('')}</ul>
      </div>
      <aside class="panel">
        <h2>Datos</h2>
        <dl class="datos">
          <dt>Cantón</dt><dd>${escapar(e.canton)}</dd>
          <dt>Parroquia</dt><dd>${escapar(e.parroquia)}</dd>
          ${e.litros ? `<dt>Capacidad</dt><dd>${Number(e.litros).toLocaleString('es-EC')} litros al día</dd>` : ''}
          <dt>Contacto</dt><dd>${escapar(e.telefono || 'Dato de ejemplo')}</dd>
        </dl>
        <button class="boton" type="button" id="boton-whatsapp">Contactar por WhatsApp</button>
        <p class="lugar" id="nota-whatsapp" hidden>En el sitio real este botón abre WhatsApp con la empresa.</p>
      </aside>
    </div>`;
  $('#boton-whatsapp').addEventListener('click', () => { $('#nota-whatsapp').hidden = false; });
}

// ---------- Registro en pasos ----------
let paso = 1;
let pendiente = null;

function prepararRegistro() {
  $('#r-tipo').innerHTML += TIPOS.map(t => `<option>${t}</option>`).join('');
  $('#r-canton').innerHTML += CANTONES.map(c => `<option>${c}</option>`).join('');
  $('#r-productos').innerHTML = PRODUCTOS.map((p, i) =>
    `<label for="rp-${i}"><input type="checkbox" id="rp-${i}" name="productos" value="${p}">${p}</label>`).join('');

  $('#r-siguiente').addEventListener('click', () => { if (pasoValido()) irAPaso(paso + 1); });
  $('#r-atras').addEventListener('click', () => irAPaso(paso - 1));
  $('#form-registro').addEventListener('submit', enviarRegistro);
  $('#r-productos').addEventListener('change', () => { $('#error-productos').style.display = ''; });
  $('#r-aprobar').addEventListener('click', aprobar);
  $('#r-otro').addEventListener('click', reiniciarRegistro);
  irAPaso(1);
}

function pasoValido() {
  const grupo = $(`fieldset[data-paso="${paso}"]`);
  const campos = Array.from(grupo.querySelectorAll('input, select, textarea'));
  let ok = campos.every(c => c.checkValidity());
  if (paso === 3) {
    const alguno = grupo.querySelector('input[name="productos"]:checked');
    $('#error-productos').style.display = alguno ? '' : 'block';
    ok = ok && !!alguno;
  }
  grupo.classList.toggle('mostrar-errores', !ok);
  if (!ok) { const malo = grupo.querySelector(':invalid'); if (malo) malo.focus(); }
  return ok;
}

function irAPaso(n) {
  paso = Math.min(Math.max(n, 1), 4);
  $$('#form-registro fieldset').forEach(f => { f.hidden = Number(f.dataset.paso) !== paso; });
  $$('#progreso li').forEach((li, i) => {
    li.className = i + 1 < paso ? 'hecho' : i + 1 === paso ? 'actual' : '';
    if (i + 1 === paso) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
  });
  $('#r-atras').disabled = paso === 1;
  $('#r-siguiente').hidden = paso === 4;
  $('#r-enviar').hidden = paso !== 4;
  if (paso === 4) pintarResumen();
}

function leerFormulario() {
  const f = $('#form-registro');
  return {
    nombre: f.nombre.value.trim(),
    ruc: f.ruc.value.trim(),
    tipo: f.tipo.value,
    canton: f.canton.value,
    parroquia: f.parroquia.value.trim(),
    telefono: f.telefono.value.trim(),
    correo: f.correo.value.trim(),
    productos: Array.from(f.querySelectorAll('input[name="productos"]:checked')).map(i => i.value),
    litros: Number(f.litros.value) || 0,
    arcsa: f.arcsa.value.trim(),
    descripcion: f.descripcion.value.trim()
  };
}

function pintarResumen() {
  const d = leerFormulario();
  const filas = [['Nombre', d.nombre], ['RUC', d.ruc], ['Tipo', d.tipo], ['Cantón', d.canton], ['Parroquia', d.parroquia],
    ['Celular', d.telefono], ['Correo', d.correo], ['Productos', d.productos.join(', ')],
    ['Litros al día', d.litros || '—'], ['ARCSA', d.arcsa || '—']];
  $('#r-resumen').innerHTML = filas.map(([k, v]) => `<dt>${k}</dt><dd>${escapar(v)}</dd>`).join('');
}

function enviarRegistro(ev) {
  ev.preventDefault();
  const d = leerFormulario();
  pendiente = { ...d, id: Date.now(), verificada: !!d.arcsa };
  $('#form-registro').hidden = true;
  $('#r-listo').hidden = false;
  $('#r-estado').textContent = 'En revisión';
  $('#r-aprobar').hidden = false;
  $('#r-listo-titulo').textContent = '¡Gracias! Recibimos su registro';
  $('#r-listo-texto').textContent = `El equipo de Carchi Lácteo revisará los datos de ${d.nombre}. Le avisaremos a ${d.correo} cuando su ficha esté publicada.`;
}

function aprobar() {
  if (!pendiente) return;
  empresas.push(pendiente);
  try {
    const guardadas = JSON.parse(localStorage.getItem('carchi-lacteo-empresas') || '[]');
    guardadas.push(pendiente);
    localStorage.setItem('carchi-lacteo-empresas', JSON.stringify(guardadas));
  } catch (e) { /* sin almacenamiento: queda solo en esta sesión */ }
  $('#r-estado').textContent = 'Aprobada';
  $('#r-listo-titulo').textContent = 'Su empresa ya está publicada';
  $('#r-listo-texto').innerHTML = `Ya aparece en el directorio. <a href="#empresa-${pendiente.id}">Ver la ficha</a>`;
  $('#r-aprobar').hidden = true;
  pendiente = null;
  pintarInicio();
  pintarDirectorio();
}

function reiniciarRegistro() {
  $('#form-registro').reset();
  $$('#form-registro fieldset').forEach(f => f.classList.remove('mostrar-errores'));
  $('#form-registro').hidden = false;
  $('#r-listo').hidden = true;
  pendiente = null;
  irAPaso(1);
}

// ---------- Contacto ----------
function prepararContacto() {
  $('#form-contacto').addEventListener('submit', ev => {
    ev.preventDefault();
    const f = ev.target;
    const ok = f.checkValidity();
    f.classList.toggle('mostrar-errores', !ok);
    $('#c-ok').hidden = !ok;
    if (ok) f.reset();
  });
}

// ---------- Navegación por #ancla ----------
function mostrarVista() {
  const hash = location.hash.replace('#', '') || 'inicio';
  let vista = hash;
  if (hash.startsWith('empresa-')) { vista = 'ficha'; pintarFicha(Number(hash.slice(8))); }
  else document.title = 'Carchi Lácteo';
  if (!$(`[data-vista="${vista}"]`)) vista = 'inicio';
  $$('[data-vista]').forEach(s => { s.hidden = s.dataset.vista !== vista; });
  $$('.menu a').forEach(a => {
    const destino = a.getAttribute('href').slice(1);
    if (destino === vista || (vista === 'ficha' && destino === 'directorio')) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  $('#menu').classList.remove('abierto');
  $('#boton-menu').setAttribute('aria-expanded', 'false');
  window.scrollTo(0, 0);
}

// ---------- Arranque ----------
function iniciar() {
  prepararFiltros();
  prepararRegistro();
  prepararContacto();
  pintarInicio();
  pintarDirectorio();

  $('#mapa').addEventListener('click', ev => { const g = ev.target.closest('.canton'); if (g) elegirCanton(g.dataset.canton); });
  $('#mapa').addEventListener('keydown', ev => {
    const g = ev.target.closest('.canton');
    if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); elegirCanton(g.dataset.canton); }
  });
  $('#boton-menu').addEventListener('click', () => {
    const abierto = $('#menu').classList.toggle('abierto');
    $('#boton-menu').setAttribute('aria-expanded', String(abierto));
  });
  window.addEventListener('hashchange', mostrarVista);
  mostrarVista();
}

iniciar();
