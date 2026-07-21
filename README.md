# FirmaLiga — demo interactiva

Demo visual y funcional de una plataforma para gestionar jugadores, generar documentos y completar un flujo de firma electrónica.

La primera vez que se abre cada experiencia aparece una guía interactiva. El panel administrativo y el enlace del firmante tienen recorridos adaptados, y la guía puede repetirse desde el botón de ayuda `?`.

## Cómo abrirla

Abrí `index.html` con Chrome, Edge o Firefox. No requiere instalación, servidor ni dependencias.

Para entrar directamente en la experiencia del firmante, abrí:

```text
index.html?flow=sign
```

## Recorrido recomendado

1. Seleccioná **Nueva solicitud** desde la barra superior o desde Documentos.
2. Elegí el firmante y el documento; el enlace personal se enviará por correo electrónico.
3. Revisá la vista previa y seleccioná **Enviar solicitud**.
4. Usá **Ver como lo recibe el firmante** para abrir su enlace personal.
5. Cargá el documento demo y aceptá el tratamiento de datos.
6. En el paso de OTP, usá el código `246810` o el botón para completarlo.
7. Revisá el PDF, dibujá la firma y finalizá.

El enlace que copia la demo apunta a la misma aplicación con un token ficticio:

```text
index.html?flow=sign&token=FL-8H4K2D
```

## Alcance

La demo funciona únicamente en el navegador y no transmite ni persiste datos reales. Los controles secundarios muestran una notificación explicando que se conectarán al backend en una versión productiva.
