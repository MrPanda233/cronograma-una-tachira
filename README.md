# Cronograma de Entregas · Estudiantes C.L. Táchira

Portal hecho por estudiantes, para estudiantes del Centro Local Táchira. **No es un sitio oficial** de la Universidad Nacional Abierta (UNA) ni del Centro Local Táchira.

Por ahora reúne el Semestre I de las carreras 281 (TSU Higiene y Seguridad Industrial) y 280 (Ingeniería Industrial).

## Ejecución local

**Requisito:** Node.js. No hace falta ningún archivo `.env`: el sitio no usa claves ni servicios externos.

```bash
npm install
npm run dev
```

## Publicación

Cada push a `main` lo publica Cloudflare Workers automáticamente. Las cabeceras de seguridad están en `public/_headers`.

## Actualizar el cronograma

Las entregas, asesores y enlaces están en `src/data.ts` (`EVALUATIONS`, `ADVISORS`, `OFFICIAL_LINKS`). No hace falta tocar `src/App.tsx` para cambiar fechas.
