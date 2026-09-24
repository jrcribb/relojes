# Multi Relojes

Seis temporizadores o cronómetros en una sola pantalla, sin desplazamiento. Aplicación local sin servidor, instalación ni dependencias de ejecución.

## Abrir

Abrí `relojes.html` en un navegador moderno. Conservá `styles.css`, `clock-core.js` y `app.js` en la misma carpeta.

## Uso

- Tocá el nombre de un reloj para configurar su nombre, tipo y duración.
- Elegí de uno a tres incrementos enteros de minutos y una alarma: sin sonido, corta (un beep) o larga (tres beeps).
- Usá **Probar sonido** para escuchar la selección. Los beeps se generan internamente con Web Audio, sin archivos externos ni conexión.
- **Iniciar**, **Pausar** y **Reiniciar** controlan cada reloj. Al finalizar se muestra **Finalizado** y **Repetir** inicia otra cuenta.
- Los incrementos aumentan tanto el tiempo restante como el total; el porcentaje nunca supera el 100 %.
- Cambiar duración o tipo reinicia ese reloj en pausa. Cambiar solamente nombre, alarma o incrementos conserva la marcha.
- La duración y los incrementos admiten entre 1 y 5999 minutos enteros, con una duración total máxima de 5999 minutos.

La distribución mantiene seis relojes: dos columnas en vertical y tres en horizontal. Se adapta a la altura disponible. Se verificaron pantallas de 320 × 568, 360 × 640, 390 × 844, 568 × 320, 844 × 390, 1280 × 720 y 1920 × 1080, incluyendo el diálogo sin scroll.

## Guardado y accesibilidad

Los relojes y el tema se guardan en el navegador. Los datos anteriores compatibles se recuperan automáticamente. Si el almacenamiento no está disponible o los datos son inválidos, se muestra un aviso. Sin una preferencia guardada, el tema sigue la preferencia del sistema.

Los controles tienen etiquetas accesibles y foco visible. La configuración se maneja con teclado, se cierra con Escape y devuelve el foco al reloj. Los estados se indican con texto y color.

El tiempo se calcula a partir de marcas horarias, por lo que se recupera correctamente al volver a la pestaña. Un navegador puede suspender una página en segundo plano o con el dispositivo bloqueado: en ese caso, la señal se procesa al reanudarla. Para alarmas puntuales, mantené la página activa y el sonido habilitado. Una recarga puede requerir una interacción para habilitar nuevamente el audio.

## Archivos y pruebas

- `relojes.html`: estructura y formulario.
- `styles.css`: diseño adaptable y temas.
- `clock-core.js`: cálculo, estados y recuperación de relojes.
- `app.js`: interfaz, almacenamiento y generación de sonido.
- `tests/clock-core.test.js`: pruebas de lógica sin dependencias (`node --test tests/clock-core.test.js`).
- `tests/browser.cjs`: comprobación de tamaños y comportamiento con Playwright y Chromium disponibles (`node tests/browser.cjs`). Estas herramientas son solo para desarrollo.

## Grupos por color

En la configuración de cada reloj, elegí **Grupo por color**. Los relojes del mismo color son excluyentes: al iniciar uno, los demás se pausan conservando su tiempo. Los de otros colores y los que están **Sin grupo** siguen funcionando independientemente. También funciona con temporizadores y grupos de más de dos relojes. Para alternar dos cronómetros como en ajedrez, asignales el mismo color e iniciá el que debe contar.

Los grupos se guardan al recargar. Cambiar el grupo de un reloj en marcha pausa a sus nuevos compañeros. La vista móvil agrega 16 píxeles de separación arriba, además del espacio seguro del dispositivo.
