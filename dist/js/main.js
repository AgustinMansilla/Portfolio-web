'use strict';
const $ = selector => document.querySelector(selector);
const make = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; };
let content = PortfolioContent.load();
function renderContent() {
  content = PortfolioContent.load();
  const { profile, about, projects } = content;
  const cvPath = `./assets/CV_Mansilla_Agustin_2026_${pageLanguage.toUpperCase()}.pdf`;
  document.querySelectorAll('.resume, [data-cv]').forEach(link => { link.href = cvPath; });
  $('#hero-name').textContent = profile.fullName || profile.name;
  $('#hero-location').textContent = profile.location;
  $('#hero-description').textContent = t(profile.bio);
  $('.identity h3').replaceChildren(document.createTextNode(t(profile.tagline)), document.createElement('br'), make('span','',t(profile.taglineStrong)));
  $('#about .eyebrow').textContent = '01 // ' + t(about.heading).toLocaleUpperCase(pageLanguage);
  $('#about-heading').textContent = `${t(profile.greeting)} ${profile.name}`;
  $('#about-copy').replaceChildren(...about.paragraphs.map(text => make('p', '', t(text))));
  $('#availability').textContent = t(profile.availability);
  $('#location').textContent = profile.location;
  document.querySelectorAll('.github-link').forEach(link => { link.href = profile.github || '#github'; });
  const email = `mailto:${profile.email}`;
  $('#contact-email').href = email;
  $('#contact-email').textContent = `${profile.email} ↗`;
  $('#footer-email').href = email;
  const colors = ['#ff819a', '#99afff', '#ff819a', '#99afff'];
  const orderedProjects = Object.values(projects).sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));
  $('#projects').replaceChildren(...orderedProjects.map((project, index) => {
    const article = make('article', 'project');
    article.style.setProperty('--accent', colors[index]);
    const media = makeProjectMedia(project);
    const body = make('div', 'project-body');
    body.append(make('p','eyebrow',t(project.category).toLocaleUpperCase(pageLanguage)), make('h3','',project.title));
    const firstSentence = t(project.description).match(/^.*?[.!?](?:\s|$)/)?.[0] || t(project.description);
    body.append(make('p','',firstSentence));
    const open = make('button','project-open',t('Ver proyecto ↗'));
    open.type = 'button';
    open.setAttribute('aria-label', `${t('Ver proyecto:')} ${project.title}`);
    open.setAttribute('aria-haspopup','dialog');
    open.addEventListener('click', () => openProject(project));
    body.append(open);
    article.append(body);
    if (project.image) {
      article.classList.add('project-with-image');
      article.append(media);
    }
    return article;
  }));
}

function makeProjectMedia(project) {
  const media = make('div', 'project-media');
  if (!project.image) {
    media.classList.add('project-media-empty');
    media.append(make('span', 'mono', t('Captura pendiente')));
    return media;
  }
  const img = make('img', 'project-screenshot');
  img.src = project.image;
  img.alt = t(project.imageAlt) || project.title;
  img.loading = 'lazy';
  media.append(img);
  return media;
}

function makeZoomableProjectPhoto(project) {
  const section = make('div', 'project-photo');
  const media = makeProjectMedia(project);
  const photo = media.querySelector('img');
  photo.loading = 'eager';
  photo.draggable = false;
  const zoomRegion = make('div', 'photo-scroll');
  zoomRegion.tabIndex = 0;
  zoomRegion.setAttribute('role', 'region');
  zoomRegion.setAttribute('aria-label', t('Captura ampliable del proyecto'));
  const zoomButton = make('button', 'photo-trigger');
  zoomButton.type = 'button';
  zoomButton.setAttribute('aria-label', t('Acercar imagen'));
  zoomButton.append(photo);
  zoomRegion.append(zoomButton);
  const controls = make('div', 'photo-controls');
  const makeControl = (caption, label) => {
    const button = make('button', 'photo-control', caption);
    button.type = 'button';
    button.setAttribute('aria-label', t(label));
    return button;
  };
  const decrease = makeControl('−', 'Alejar imagen');
  const increase = makeControl('+', 'Acercar imagen');
  const fit = makeControl(t('Ajustar'), 'Ajustar imagen');
  const amount = make('output', 'photo-amount', '100%');
  amount.setAttribute('aria-live', 'polite');
  controls.append(decrease, amount, increase, fit);
  section.append(zoomRegion, controls);
  let zoom = 1;
  let fitWidth = 0;
  function setZoom(level) {
    if (!photo.naturalWidth) return;
    const next = Math.max(1, Math.min(3, level));
    if (next === zoom) return;
    const oldWidth = photo.offsetWidth;
    const oldHeight = photo.offsetHeight;
    const oldLeft = zoomButton.offsetLeft;
    const x = oldWidth ? (zoomRegion.scrollLeft + zoomRegion.clientWidth / 2 - oldLeft) / oldWidth : .5;
    const y = oldHeight ? (zoomRegion.scrollTop + zoomRegion.clientHeight / 2) / oldHeight : .5;
    if (zoom === 1) {
      fitWidth = oldWidth;
      zoomRegion.style.setProperty('--photo-height', `${Math.max(180, zoomRegion.clientHeight)}px`);
    }
    zoom = next;
    section.classList.toggle('photo-is-zoomed', zoom > 1);
    if (zoom > 1) {
      zoomButton.style.width = `${Math.round(fitWidth * zoom)}px`;
      zoomRegion.scrollLeft = zoomButton.offsetLeft + photo.offsetWidth * x - zoomRegion.clientWidth / 2;
      zoomRegion.scrollTop = photo.offsetHeight * y - zoomRegion.clientHeight / 2;
    } else {
      zoomButton.style.removeProperty('width');
      zoomRegion.style.removeProperty('--photo-height');
      zoomRegion.scrollTo(0, 0);
    }
    amount.textContent = `${Math.round(zoom * 100)}%`;
    zoomButton.setAttribute('aria-label', t(zoom === 1 ? 'Acercar imagen' : 'Ajustar imagen'));
    zoomButton.classList.toggle('photo-trigger-active', zoom > 1);
    decrease.disabled = fit.disabled = zoom === 1;
    increase.disabled = zoom === 3;
  }
  decrease.disabled = fit.disabled = true;
  decrease.addEventListener('click', () => setZoom(zoom - .5));
  increase.addEventListener('click', () => setZoom(zoom + .5));
  fit.addEventListener('click', () => setZoom(1));
  let pan = null;
  let suppressClick = false;
  zoomButton.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick = false;
    if (zoom === 1) return;
    pan = {
      id: event.pointerId, x: event.clientX, y: event.clientY,
      left: zoomRegion.scrollLeft, top: zoomRegion.scrollTop,
    };
    zoomButton.setPointerCapture(event.pointerId);
  });
  zoomButton.addEventListener('pointermove', event => {
    if (pan?.id !== event.pointerId) return;
    const dx = event.clientX - pan.x;
    const dy = event.clientY - pan.y;
    if (!suppressClick && Math.hypot(dx, dy) < 5) return;
    suppressClick = true;
    section.classList.add('photo-is-panning');
    zoomRegion.scrollLeft = pan.left - dx;
    zoomRegion.scrollTop = pan.top - dy;
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    zoomButton.addEventListener(type, event => {
      if (pan?.id !== event.pointerId) return;
      pan = null;
      section.classList.remove('photo-is-panning');
    });
  }
  zoomButton.addEventListener('click', event => {
    if (event.detail && suppressClick) return;
    setZoom(zoom === 1 ? 1.5 : 1);
  });
  return section;
}

const projectDialog = $('#project-dialog');
function openProject(project) {
  const body = make('div', 'dialog-body');
  const title = make('h2','',project.title);
  title.id = 'project-dialog-title';
  body.append(make('p','eyebrow',t(project.category).toLocaleUpperCase(pageLanguage)), title, make('p','project-description',t(project.description)));
  const tags = make('div','tags');
  tags.append(...project.tags.map(tag => make('span','',t(tag))));
  body.append(tags);
  if (project.url) {
    const link = make('a','button',t('Abrir enlace del proyecto ↗'));
    link.href = project.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    body.append(link);
  }
  $('#project-dialog-content').replaceChildren(...(project.image ? [makeZoomableProjectPhoto(project), body] : [body]));
  projectDialog.showModal();
}
$('.project-close').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', event => {
  if (event.target === projectDialog) projectDialog.close();
});

translatePage();
renderContent();
window.addEventListener('storage',event => { if (event.key === PortfolioContent.key) renderContent(); });
$('#year').textContent = new Date().getFullYear();
const menu = $('#menu'), toggle = $('#menu-toggle');
function setMenu(open) { document.body.classList.toggle('menu-open',open); toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',t(open?'Cerrar menú':'Abrir menú')); menu.inert = !open; $('#scrim').hidden = !open; if(open)menu.querySelector('a').focus(); else toggle.focus(); }
toggle.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
$('#scrim').addEventListener('click',()=>setMenu(false));
menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{ if(toggle.getAttribute('aria-expanded')!=='true')return; if(event.key==='Escape')setMenu(false); if(event.key==='Tab'){const items=[...menu.querySelectorAll('a'),toggle];const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}} });
try { document.body.classList.toggle('light',localStorage.getItem('agustin-theme')==='light'); } catch {}
function updateThemeButton(){ $('#theme').textContent=document.body.classList.contains('light')?'☀':'☾'; $('#theme').setAttribute('aria-label',t(document.body.classList.contains('light')?'Activar tema oscuro':'Activar tema claro')); }
updateThemeButton();
$('#theme').addEventListener('click',()=>{document.body.classList.toggle('light');updateThemeButton();try{localStorage.setItem('agustin-theme',document.body.classList.contains('light')?'light':'dark');}catch{}});
const chapters=[
 {label:'FORMACIÓN',title:'El comienzo',subtitle:'Técnico Universitario en Programación',date:'UTN · RESISTENCIA',text:'Me recibí en la UTN Resistencia. Esa formación es la base con la que desarrollo aplicaciones web y de escritorio.',tags:['Programación','Bases de datos','Desarrollo de software']},
 {label:'PROYECTOS',title:'De la idea al uso',subtitle:'Aplicaciones para negocios y comunidades',date:'DESARROLLO DE PROYECTOS',text:'Trabajo en sistemas de gestión, portales y herramientas para organizar ventas, distribución y turnos. Cada proyecto parte de una necesidad concreta.',tags:['Chaski Breñas','Agencia San Gabriel','Maxikiosco Vi-Da','Control Kiosco']},
 {label:'ACTUALIDAD',title:'Seguir aprendiendo',subtitle:'Seguridad Informática · UCASAL',date:'2026 · EN CURSO',text:'Complemento mi formación como desarrollador con estudios de Seguridad Informática. Me interesa entender mejor cómo construir y mantener software seguro.',tags:['Desarrollo','Seguridad','Formación continua']}
];
function selectChapter(index){const chapter=chapters[index];const panel=$('#chapter-content');const tags=make('div','tags');tags.append(...chapter.tags.map(tag=>make('span','',t(tag))));panel.replaceChildren(make('span','mono',t(chapter.label)),make('h3','',t(chapter.title)),make('div','',t(chapter.subtitle)),make('p','',t(chapter.text)),make('span','mono',t(chapter.date)),tags);panel.setAttribute('aria-labelledby',`chapter-${index}`);document.querySelectorAll('[data-chapter]').forEach((button,i)=>{button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;});}
document.querySelectorAll('[data-chapter]').forEach((button,index)=>{button.addEventListener('click',()=>selectChapter(index));button.addEventListener('keydown',event=>{let next=index;if(event.key==='ArrowDown'||event.key==='ArrowRight')next=(index+1)%3;else if(event.key==='ArrowUp'||event.key==='ArrowLeft')next=(index+2)%3;else if(event.key==='Home')next=0;else if(event.key==='End')next=2;else return;event.preventDefault();selectChapter(next);$(`#chapter-${next}`).focus();});});selectChapter(0);
const contactForm = $('#contact-form');
contactForm.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = data.get('name').trim();
  const email = data.get('email').trim();
  const message = data.get('message').trim();
  if (!name || !message) {
    const field = name ? $('#contact-message') : $('#contact-name');
    field.setCustomValidity(t('Completá este campo.'));
    field.reportValidity();
    return;
  }
  const subject = encodeURIComponent(`${t('Consulta desde el portfolio')} — ${name.replace(/[\r\n]/g, ' ')}`);
  const body = encodeURIComponent(`${message}\n\n${t('Nombre')}: ${name}\nEmail: ${email}`);
  $('#contact-note').textContent = t('Revisá y enviá el mensaje desde tu correo. Si no se abrió, usá el enlace de email.');
  window.location.href = `mailto:${content.profile.email}?subject=${subject}&body=${body}`;
});
contactForm.addEventListener('input', event => event.target.setCustomValidity(''));
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.06});document.querySelectorAll('.section h2,.about-grid,.project,.feature-grid,.journey,.github-grid').forEach(node=>{node.classList.add('reveal');observer.observe(node);});}

const orbitControl = $('#orbit-control');
const reduceOrbitMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clampOrbit = (value, max = 1) => Math.max(-max, Math.min(max, value));
let orbitDrag = null;
let orbitPulseTimer;

function guideOrbit(dx, dy) {
  orbitControl.style.setProperty('--ring-turn', `${dx * 14}deg`);
  orbitControl.style.setProperty('--ring-tilt', `${dy * 8}deg`);
}
function relaxOrbit() {
  orbitControl.removeAttribute('data-grabbed');
  orbitControl.style.removeProperty('--ring-turn');
  orbitControl.style.removeProperty('--ring-tilt');
}
function resetOrbitTilt() {
  orbitControl.style.removeProperty('--orbit-x');
  orbitControl.style.removeProperty('--orbit-y');
}

orbitControl.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0) return;
  clearTimeout(orbitPulseTimer);
  orbitDrag = { id: event.pointerId, x: event.clientX, y: event.clientY };
  orbitControl.setPointerCapture(event.pointerId);
  orbitControl.dataset.grabbed = '';
  guideOrbit(0, 0);
});
orbitControl.addEventListener('pointermove', event => {
  if (orbitDrag?.id === event.pointerId) {
    const distance = Math.max(80, orbitControl.clientWidth * .35);
    guideOrbit(clampOrbit((event.clientX - orbitDrag.x) / distance),
      clampOrbit((event.clientY - orbitDrag.y) / distance));
  }
  if (event.pointerType !== 'mouse' || reduceOrbitMotion.matches) return;
  const rect = orbitControl.getBoundingClientRect();
  orbitControl.style.setProperty('--orbit-x', `${clampOrbit(0.5 - (event.clientY - rect.top) / rect.height, .5) * 18}deg`);
  orbitControl.style.setProperty('--orbit-y', `${clampOrbit((event.clientX - rect.left) / rect.width - 0.5, .5) * 18}deg`);
});
function releaseOrbit(event) {
  if (orbitDrag?.id !== event.pointerId) return;
  orbitDrag = null;
  relaxOrbit();
  resetOrbitTilt();
}
for (const event of ['pointerup', 'pointercancel', 'lostpointercapture']) {
  orbitControl.addEventListener(event, releaseOrbit);
}
orbitControl.addEventListener('pointerleave', resetOrbitTilt);
orbitControl.addEventListener('click', event => {
  if (event.detail !== 0 || orbitDrag) return;
  clearTimeout(orbitPulseTimer);
  orbitControl.dataset.grabbed = '';
  guideOrbit(.4, -.2);
  orbitPulseTimer = setTimeout(relaxOrbit, 280);
});

for (const button of document.querySelectorAll('[data-lang]')) {
  button.addEventListener('click', () => {
    if (button.dataset.lang === pageLanguage) return;
    pageLanguage = button.dataset.lang;
    try { localStorage.setItem(languageKey, pageLanguage); } catch {}
    translatePage();
    renderContent();
    selectChapter(Number($('.chapters [aria-selected="true"]').dataset.chapter));
    updateThemeButton();
    toggle.setAttribute('aria-label', t(toggle.getAttribute('aria-expanded') === 'true' ? 'Cerrar menú' : 'Abrir menú'));
    $('#contact-note').textContent = t('Se abre tu aplicación de correo para revisar y enviar el mensaje.');
    for (const field of contactForm.querySelectorAll('input, textarea')) field.setCustomValidity('');
  });
}
