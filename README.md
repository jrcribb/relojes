# Multi Relojes

Aplicación web para controlar varios temporizadores y cronómetros desde una misma vista, con personalización, almacenamiento local y modo oscuro.

## Descripción

Multi Relojes es una mini app frontal desarrollada en HTML, CSS y JavaScript. Permite crear varios relojes simultáneos, cada uno con su propio nombre, tipo, duración inicial y botones rápidos de añadido de minutos. También incluye un cronómetro y una reproducción de sonido al finalizar un temporizador.

## Características

- Múltiples relojes activos en una sola pantalla
- Soporte para dos tipos:
  - Temporizador
  - Cronómetro
- Configuración individual por reloj:
  - Nombre
  - Tipo
  - Duración inicial en minutos
  - Incrementos rápidos (por ejemplo: +1m, +3m, +5m)
  - Activación de sonido
- Botones para iniciar, pausar y reiniciar cada reloj
- Progreso visual circular del temporizador
- Modo oscuro / claro
- Persistencia local con `localStorage` para recordar la configuración y el estado

## Tecnologías

- HTML5
- CSS3
- JavaScript vanilla
- LocalStorage del navegador

## Requisitos

No requiere instalación ni dependencias externas.

Solo necesitas:

- Un navegador moderno (Chrome, Edge, Firefox o Safari)
- Abrir el archivo `relojes.html` en el navegador

## Cómo ejecutar la aplicación

1. Descarga o clona este repositorio.
2. Abre el archivo `relojes.html` en tu navegador.
3. La app se cargará automáticamente y estará lista para usar.

## Uso

### Temporizador

- Haz clic sobre el nombre del reloj para editarlo.
- Define la duración inicial en minutos.
- Usa los botones con incrementos para agregar más tiempo rápidamente.
- Pulsa el botón de reproducción para iniciar.
- Cuando el tiempo llega a cero, suena una alarma y el temporizador se detiene.

### Cronómetro

- Configura el reloj como tipo `Cronómetro`.
- Inicia el conteo con el botón de reproducción.
- El tiempo se acumula hasta detenerlo.
- Puedes reiniciarlo con el botón de parada.

## Persistencia

La interfaz guarda la configuración de los relojes en `localStorage`, por lo que al recargar la página se mantienen los datos cargados.

## Estructura del proyecto

```text
relojes/
├── relojes.html
├── README.md
└── (sin dependencias ni build system)
```

## Personalización

La aplicación usa variables CSS para colores, soportando un tema claro y oscuro. También puede adaptarse fácilmente si deseas cambiar:

- paleta de colores
- tamaños y proporciones
- mensajes de UI
- comportamiento de alarmas

## Nota

Este proyecto está pensado como una herramienta práctica y ligera para uso personal o educativo, sin backend ni servicios externos.
