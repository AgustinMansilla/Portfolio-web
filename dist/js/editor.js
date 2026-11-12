/* Editor visual estático. Guardar = vista previa local. Exportar = archivo publicable. */
'use strict';
let draft = PortfolioContent.load();
const form = document.getElementById('editor-form');
const status = document.getElementById('editor-status');
let busyUploads = 0;
function notify(message, error = false) {
  status.textContent = message;
  status.dataset.error = String(error);
}
function readPath(path) { return path.split('.').reduce((value, key) => value?.[key], draft); }
function setPath(path, value) {
  const keys = path.split('.');
  let object = draft;
  keys.slice(0, -1).forEach(key => { object = object[key]; });
  object[keys.at(-1)] = value;
}
function field(path, title, { multiline = false, full = false, hint = '', type = 'text' } = {}) {
  const label = document.createElement('label');
  label.className = `field${full ? ' full' : ''}`;
  const caption = document.createElement('span');
  caption.textContent = title;
  const input = document.createElement(multiline ? 'textarea' : 'input');
  if (!multiline) input.type = type;
  input.dataset.path = path;
  input.value = Array.isArray(readPath(path)) ? readPath(path).join(', ') : readPath(path) ?? '';
  input.maxLength = multiline ? 5000 : 350;
  if (path === 'profile.greeting' || path === 'profile.name') input.maxLength = 60;
  input.addEventListener('input', () => {
    setPath(path, path.endsWith('.tags') ? input.value.split(',').map(tag => tag.trim()).filter(Boolean) : input.value);
    updatePreview();
    notify('Cambios pendientes. Guardá la vista previa o descargá el archivo para publicar.');
  });
  label.append(caption, input);
  if (hint) { const help = document.createElement('small'); help.textContent = hint; label.append(help); }
  return label;
}
const profileFields = [
  ['greeting', 'Saludo de Sobre mí', {}], ['name', 'Nombre en la portada', {}],
  ['fullName', 'Nombre completo', {}], ['role', 'Profesión / título', {}],
  ['availability', 'Disponibilidad', {}], ['tagline', 'Título de Sobre mí · primera línea', {}],
  ['taglineStrong', 'Título de Sobre mí · segunda línea', {}],
  ['bio', 'Presentación breve', { multiline: true, full: true }],
  ['location', 'Ubicación', { full: true }],
  ['email', 'Correo de contacto', { type: 'email' }], ['github', 'Enlace a tu GitHub', { type: 'url' }],
  ['tools', 'Herramientas de la ficha de perfil', { full: true }],
];
function updatePreview() {
  document.getElementById('greeting-preview').textContent = draft.profile.greeting;
  document.getElementById('name-preview').textContent = draft.profile.name;
}
function capturePreview(container, project) {
  container.replaceChildren();
  if (project.image) {
    const img = document.createElement('img'); img.src = project.image; img.alt = project.imageAlt || project.title; container.append(img);
  } else container.textContent = 'Todavía no cargaste una captura real.';
}
async function optimizeCapture(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Elegí una imagen PNG, JPG o WebP.');
  if (file.size > 12 * 1024 * 1024) throw new Error('La imagen supera 12 MB. Elegí una captura más liviana.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1800 / bitmap.width, 1400 / bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let image = canvas.toDataURL('image/webp', .9);
    if (image.length > 1100000) image = canvas.toDataURL('image/webp', .75);
    if (image.length > 1500000) throw new Error('La captura sigue siendo muy pesada. Probá con una resolución menor.');
    return image;
  } finally { bitmap.close(); }
}
function renderForm() {
  const profile = document.getElementById('profile-fields'); profile.replaceChildren();
  profileFields.forEach(([key, label, options]) => profile.append(field(`profile.${key}`, label, options)));
  const about = document.getElementById('about-fields'); about.replaceChildren();
  about.append(field('about.heading', 'Nombre de la sección', { full: true, multiline: true }));
  draft.about.paragraphs.forEach((_, index) => about.append(field(`about.paragraphs.${index}`, `Párrafo ${index + 1}`, { full: true, multiline: true })));
  const list = document.getElementById('project-fields'); list.replaceChildren();
  PortfolioContent.projectKeys.forEach(key => {
    const project = draft.projects[key];
    const article = document.createElement('article'); article.className = 'project-editor';
    const heading = document.createElement('h3'); heading.textContent = project.title;
    const fields = document.createElement('div'); fields.className = 'fields';
    [['title', 'Nombre'], ['subtitle', 'Subtítulo de la tarjeta'], ['category', 'Categoría'], ['url', 'Enlace al repositorio (opcional)']].forEach(([name, label]) => fields.append(field(`projects.${key}.${name}`, label, { type: name === 'url' ? 'url' : 'text' })));
    fields.append(field(`projects.${key}.description`, 'Descripción del proyecto', { multiline: true, full: true }));
    fields.append(field(`projects.${key}.tags`, 'Tecnologías / etiquetas', { full: true, hint: 'Separalas con comas.' }));
    fields.append(field(`projects.${key}.imageAlt`, 'Descripción accesible de la captura', { full: true }));
    const capture = document.createElement('div'); capture.className = 'capture-editor';
    const preview = document.createElement('div'); preview.className = 'capture-preview'; capturePreview(preview, project);
    const actions = document.createElement('div'); actions.className = 'capture-actions';
    const label = document.createElement('label'); label.className = 'file-button'; label.textContent = 'Subir captura';
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/png,image/jpeg,image/webp'; input.setAttribute('aria-label', `Captura de ${project.title}`);
    input.addEventListener('change', async () => {
      const file = input.files[0]; if (!file) return;
      busyUploads++;
      notify('Preparando la captura…');
      try {
        project.image = await optimizeCapture(file);
        capturePreview(preview, project);
        notify(`Captura de ${project.title} lista. Guardá la vista previa para aplicarla.`);
      } catch (error) { notify(error.message || 'No se pudo leer la imagen.', true); }
      finally { busyUploads--; input.value = ''; }
    });
    label.append(input);
    const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'text-button'; clear.textContent = 'Quitar captura';
    clear.addEventListener('click', () => { project.image = ''; capturePreview(preview, project); notify('Captura quitada del borrador. Guardá para aplicar.'); });
    actions.append(label, clear);
    const help = document.createElement('small'); help.textContent = 'PNG, JPG o WebP. La imagen se incluye en content.js al descargarlo. No se recorta.';
    capture.append(preview, actions, help); article.append(heading, fields, capture); list.append(article);
  });
  updatePreview();
}
function ready() {
  if (busyUploads) { notify('Esperá a que termine de prepararse la captura.', true); return false; }
  if (!form.reportValidity()) { notify('Revisá el correo o los enlaces marcados.', true); return false; }
  if (draft.profile.github && !PortfolioContent.safeLink(draft.profile.github)) { notify('El enlace de GitHub debe comenzar con https://.', true); return false; }
  for (const project of Object.values(draft.projects)) {
    if (project.url && !PortfolioContent.safeLink(project.url)) { notify(`El enlace de ${project.title} debe comenzar con https://.`, true); return false; }
  }
  return true;
}
function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
form.addEventListener('submit', event => {
  event.preventDefault(); if (!ready()) return;
  try { PortfolioContent.save(draft); notify('Vista previa guardada en este navegador. Para publicar para todos, descargá content.js y subilo a tu proyecto.'); }
  catch { notify('No se pudo guardar: el navegador bloquea el almacenamiento o no tiene espacio. Podés descargar content.js para conservar los cambios.', true); }
});
document.getElementById('export-button').addEventListener('click', () => {
  if (!ready()) return;
  const clean = PortfolioContent.normalize(draft);
  download('content.js', '// Generado desde el editor del portfolio. Reemplazar dist/js/content.js.\nwindow.PORTFOLIO_CONTENT = ' + JSON.stringify(clean, null, 2) + ';\n', 'text/javascript');
  notify('content.js descargado. Reemplazá dist/js/content.js y subí el cambio a GitHub para publicarlo.');
});
document.getElementById('backup-button').addEventListener('click', () => {
  if (!ready()) return;
  download('portfolio-respaldo.json', JSON.stringify(PortfolioContent.normalize(draft), null, 2), 'application/json');
  notify('Respaldo JSON descargado. Incluye los textos y las capturas.');
});
document.getElementById('import-backup').addEventListener('change', async event => {
  const input = event.target; const file = input.files[0]; if (!file) return;
  try {
    if (file.size > 8 * 1024 * 1024) throw new Error('El respaldo supera 8 MB.');
    const data = JSON.parse(await file.text());
    if (!data.profile || !data.projects || !data.about) throw new Error('El archivo no es un respaldo válido de este portfolio.');
    draft = PortfolioContent.normalize(data); renderForm(); notify('Respaldo cargado. Revisalo y pulsá Guardar vista previa para aplicarlo.');
  } catch (error) { notify(error.message || 'No se pudo importar el respaldo.', true); }
  finally { input.value = ''; }
});
document.getElementById('reset-button').addEventListener('click', () => {
  draft = PortfolioContent.clone(PortfolioContent.defaults); renderForm(); notify('Contenido publicado cargado en el formulario. Pulsá Guardar para aplicarlo al navegador.');
});
renderForm();
