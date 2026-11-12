/* Datos compartidos por el portfolio y el editor local. */
'use strict';
window.PortfolioContent = (() => {
  const key = 'gasuos-content-v3';
  const clone = value => JSON.parse(JSON.stringify(value));
  const defaults = clone(window.PORTFOLIO_CONTENT);
  const projectKeys = ['chaski', 'agencia', 'vida', 'control'];
  const text = (value, fallback, limit = 5000) => typeof value === 'string' ? value.slice(0, limit) : fallback;
  function safeLink(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try { const url = new URL(value); return url.protocol === 'https:' ? url.href : ''; }
    catch { return ''; }
  }
  function safeImage(value) {
    if (typeof value !== 'string') return '';
    if (/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length <= 1600000) return value;
    if (/^\.\/assets\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp)$/i.test(value) && !value.includes('..')) return value;
    return '';
  }
  function normalize(source) {
    const result = clone(defaults);
    if (!source || typeof source !== 'object' || Array.isArray(source)) return result;
    Object.keys(result.profile).forEach(name => {
      result.profile[name] = text(source.profile?.[name], result.profile[name], name === 'bio' ? 1500 : 350);
    });
    // Replace the old default while preserving custom editor content.
    if (result.profile.bio === 'Soy técnico universitario en Programación por la UTN Resistencia. Desarrollo aplicaciones para negocios y sitios web.') {
      result.profile.bio = defaults.profile.bio;
    }
    result.profile.github = safeLink(result.profile.github);
    result.profile.email = /^[a-z0-9._+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(result.profile.email) ? result.profile.email : '';
    result.about.heading = text(source.about?.heading, result.about.heading, 500);
    result.about.paragraphs = result.about.paragraphs.map((fallback, index) => text(source.about?.paragraphs?.[index], fallback));
    // Refresh the old stock bio even in browsers with an older saved preview.
    const hobbyBio = result.about.paragraphs[2];
    if (hobbyBio === 'Además del desarrollo, me gustan la tecnología, los juegos de PC y los juegos de mesa. En 2026 empecé a estudiar Seguridad Informática en UCASAL.' ||
        hobbyBio === 'La tecnología, los videojuegos y las ganas de seguir aprendiendo son parte de mi mundo. Este escritorio es una pequeña muestra de eso.' ||
        hobbyBio === 'Además del desarrollo, me interesan la tecnología y los videojuegos. En 2026 empecé a estudiar Seguridad Informática en UCASAL.') {
      result.about.paragraphs[2] = defaults.about.paragraphs[2];
    }
    projectKeys.forEach(id => {
      const project = source.projects?.[id];
      if (!project || typeof project !== 'object') return;
      ['title', 'subtitle', 'category', 'description', 'imageAlt'].forEach(name => {
        result.projects[id][name] = text(project[name], result.projects[id][name], name === 'description' ? 5000 : 350);
      });
      result.projects[id].tags = Array.isArray(project.tags) ? project.tags.filter(tag => typeof tag === 'string').slice(0, 12).map(tag => tag.slice(0, 80)) : result.projects[id].tags;
      result.projects[id].url = safeLink(project.url);
      result.projects[id].image = safeImage(project.image);
    });
    return result;
  }
  function load() {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return clone(defaults);
      const source = JSON.parse(saved);
      const result = normalize(source);
      // Restore newly published project photos in older saved previews.
      for (const id of projectKeys) {
        if (source?.publishedPhotos && id !== 'vida') continue;
        if (result.projects[id].image || !defaults.projects[id].image) continue;
        result.projects[id].image = defaults.projects[id].image;
        result.projects[id].imageAlt = defaults.projects[id].imageAlt;
      }
      return result;
    }
    catch { return clone(defaults); }
  }
  function save(value) {
    const clean = normalize(value);
    localStorage.setItem(key, JSON.stringify({ ...clean, publishedPhotos: true }));
    return clean;
  }
  function reset() { localStorage.removeItem(key); }
  return { key, defaults, clone, normalize, load, save, reset, safeLink, projectKeys };
})();
