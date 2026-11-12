# Portfolio de Agustín Mansilla

Portfolio de desarrollo con una portada de auras rojo intenso y azul eléctrico, fichas de proyectos, CV y formulario de contacto. Hecho con **HTML, CSS y JavaScript**, sin framework ni compilación. El fondo estrellado y los detalles del stack usan SVG. Los iconos del stack son de [Devicon](https://github.com/devicons/devicon); su licencia está en `dist/assets/tech/`.

## Abrir en tu equipo

Abrí esta carpeta en VS Code. Usá Live Server sobre `dist/index.html` o ejecutá:

```bash
python3 -m http.server 5500 --directory dist
```

Entrá a http://localhost:5500.

## Qué editar

| Archivo | Qué contiene |
| --- | --- |
| `dist/index.html` | Estructura del sitio |
| `dist/css/styles.css` y `dist/css/identity.css` | Estilos, auras, tarjetas del stack y vista móvil |
| `dist/js/content.js` | Datos personales, textos y proyectos |
| `dist/js/main.js` | Menú, fichas, animaciones y formulario |
| `dist/editor.html` | Editor visual de contenido y capturas |

Podés editar los datos directamente o abrir `dist/editor.html` en tu servidor local. El editor guarda una vista previa local. Para que los cambios aparezcan online, exportá `content.js`, reemplazalo en `dist/js/` y subilo al repositorio.

Las tarjetas están preparadas para capturas reales. El formulario arma un correo con nombre, email y descripción; la persona revisa y envía el mensaje desde su aplicación de correo. El CV descargable está en `dist/assets/`.

## Publicar en GitHub Pages

1. Creá un repositorio y subí el contenido de esta carpeta, incluyendo `.github/`, a la rama `main`.
2. En **Settings → Pages → Build and deployment → Source**, elegí **GitHub Actions**.
3. En **Actions**, ejecutá **Publicar portfolio** si no arrancó solo. El flujo publica `dist/` y vuelve a correr con cada push a `main`.
