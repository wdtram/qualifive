# QualiFive · Transporte V3

Primera integración del módulo **Recomendaciones + explorador de recorridos** dentro de la página de pacientes.

## Probar

1. Abre `index.html` desde GitHub Pages (mejor que abrirlo directamente desde `file://`).
2. En **Inicio**, selecciona la cita ficticia o registra una nueva.
3. Abre **Centro de ayuda → Transporte**.
4. Marca tu origen haciendo clic sobre el mapa. Selecciona **E01** o **E02**.
5. Pulsa **Consultar recorridos del mapa** para intentar obtener trazados que estén registrados en OpenStreetMap.
6. Si se devuelve geometría, se dibujará; si no hay datos o falla la API, mostrará el aviso pertinente sin inventar rutas.
7. Puedes guardar la línea elegida en **Mi plan**, planificar una hora de salida manual y registrar si resolviste tu dificultad.

## Información importante

- La descripción general de E01 y E02 se fundamenta en el Ministerio de Transportes, Transporte Informa (06-02-2025): https://coquimbo.transporteinforma.cl/noticias/recorrido-de-buses-electricos-coquimbo-la-serena/
- Mapa de recorridos oficial (referencia, no datos GeoJSON): https://coquimbo.transporteinforma.cl/wp-content/uploads/sites/3/2024/10/Trazados-Buses-Electricos-Coquimbo-La-Serena.pdf
- La cartografía utiliza OpenFreeMap y MapLibre, sin clave de API. El trazado de líneas se solicita a OpenStreetMap vía Overpass únicamente si existe una relación registrada con `ref=E01` o `ref=E02`; **no se garantiza que exista**.
- No existe seguimiento en tiempo real en esta versión. Tampoco se muestra una recomendación de transporte no sustentada en geometría.
- Los datos de las citas permanecen solo en este navegador, mediante `localStorage`. No se guarda RUT ni se envían recordatorios cuando la página está cerrada.
- Las rutas OSM son comunitarias y pueden quedar obsoletas; antes de utilizar el mapa para una atención real, contrastar con aplicaciones y fuentes oficiales.
- Se conserva toda la lógica de citas, reconfirmaciones, ayudas, historial y accesibilidad del prototipo anterior.
