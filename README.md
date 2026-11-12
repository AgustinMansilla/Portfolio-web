# Agustín Mansilla — Portfolio de desarrollo

Portfolio profesional de Agustín Mansilla, técnico universitario en Programación por la UTN Resistencia. Reúne sitios web y aplicaciones de gestión desarrollados para negocios y comunidades.

[Ver el portfolio publicado](https://agustin-mansilla-portfolio.elgasumansilla.chatgpt.site)

---

## 📁 Proyectos destacados

| Proyecto | Qué resuelve | Enlace |
|---|---|---|
| **Chaski Breñas** | Portal de noticias locales de Las Breñas, Chaco, con radio y servicios para la comunidad. | [Sitio oficial](https://chaskibreñas.com.ar/) |
| **Agencia San Gabriel** | Aplicación de escritorio para gestionar distribución de diarios, publicidad y pagos. | [Repositorio demo](https://github.com/AgustinMansilla/Agencia-San-Gabriel-Demo) |
| **Maxikiosco Vi-Da** | Sistema de punto de venta con gestión de productos, stock y caja. | [Repositorio](https://github.com/AgustinMansilla/Maxikiosco-Vida) |
| **Control Kiosco** | Aplicación web para registrar turnos, calcular horas trabajadas y llevar el control de cobros por empleado. | [Repositorio demo](https://github.com/AgustinMansilla/Control-Kiosco-Demo) |

---

## 🏛️ Arquitectura del portfolio

El sitio publicado es estático. La navegación, las fichas de proyectos y el formulario de contacto funcionan en el navegador.

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura de las secciones, fichas y enlaces. |
| **CSS3** | Diseño adaptable a pantallas de escritorio y móviles. |
| **JavaScript** | Navegación e interacciones de la página. |
| **SVG** | Iconos y elementos gráficos. |

El código de cada proyecto se consulta en los repositorios enlazados arriba, cuando está disponible públicamente.

---

## 🚀 Cómo recorrerlo

1. Abrí el [portfolio publicado](https://agustin-mansilla-portfolio.elgasumansilla.chatgpt.site).
2. Entrá a **Proyectos** para ver las fichas y capturas.
3. Usá **Descargar CV** para consultar mi formación y experiencia. En **Contacto** podés preparar un correo desde tu aplicación de correo habitual.

---

## 🛠️ Estructura y ejecución local

```text
Portfolio-web/
├── dist/
│   ├── index.html    # Página principal
│   ├── editor.html   # Editor de contenido con vista previa local
│   ├── css/          # Estilos del sitio y del editor
│   ├── js/           # Contenido, traducciones e interacciones
│   └── assets/       # Capturas, iconos y CV en español e inglés
└── .github/workflows/pages.yml
```

Abrí la carpeta del proyecto en VS Code. Desde la terminal integrada, ejecutá lo siguiente con Python 3:

```bash
python3 -m http.server 5500 --directory dist
```

Abrí [el portfolio local](http://localhost:5500/). El [editor local](http://localhost:5500/editor.html) guarda la vista previa en el navegador. Para incorporar sus cambios al código, exportá el contenido y reemplazá `dist/js/content.js`.

---

## ✉️ Contacto

- [GitHub](https://github.com/AgustinMansilla)
- [LinkedIn](https://www.linkedin.com/in/agustin-mansilla-a2285b239/)
- [agustinmansillajob@gmail.com](mailto:agustinmansillajob@gmail.com)

