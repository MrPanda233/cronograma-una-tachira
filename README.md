# Cronograma de Entregas · Estudiantes C.L. Táchira

Portal hecho por estudiantes, para estudiantes del Centro Local Táchira. **No es un sitio oficial** de la Universidad Nacional Abierta (UNA) ni del Centro Local Táchira.

Por ahora reúne las carreras 281 (TSU Higiene y Seguridad Industrial) y 280 (Ingeniería Industrial): pensum por semestre, planes de curso, cronograma general, directorio de asesores y una sección de ayuda.

## Ejecución local

**Requisito:** Node.js. Para ver solo la web no hace falta ningún archivo `.env`.

```bash
npm install
npm run dev
```

## Comentarios

Los atiende el Worker de `worker/index.ts` con la base D1 `cronograma-comentarios` (esquema en `worker/schema.sql`).

- El captcha es propio (`worker/captcha.ts`): operaciones y letras al azar dibujadas como imagen. No necesita claves externas; la clave de firmas la genera el Worker en la tabla `settings`.
- Para probarlos en local: `npm run dev:worker`.
- Los emojis son imágenes de [Twemoji](https://github.com/jdecked/twemoji) (CC-BY 4.0) en `public/emoji/`, para que se vean igual en todos los dispositivos. Si agregas uno a la lista, copia su SVG ahí.
- `COMMENTS_OPEN: "false"` en `wrangler.jsonc` cierra los comentarios.
- Quién es quién: una cookie firmada por navegador decide de quién es cada comentario. La IP y el dispositivo se guardan cifrados, nunca la IP real.
- Reportes: `REPORT_LIMIT` en `wrangler.jsonc` fija cuántas personas distintas retiran un comentario. Para verlos: `SELECT * FROM reportes;` en la consola de D1. Lo automático queda en `moderation_log`.
- Para retirar un comentario a mano: `UPDATE comments SET status = 'hidden' WHERE id = '...'`. Para devolverlo: `status = 'visible'`.

## Publicación

Cada push a `main` lo publica Cloudflare Workers automáticamente. Las cabeceras de seguridad están en `public/_headers`.

## Actualizar el cronograma

No hace falta tocar los componentes para cambiar datos. Todo está en `src/data/`:

- `schedule.ts`: entregas del semestre. En un TSP, `dateStr` es la fecha de **publicación**; la entrega se calcula sola con `TSP_HOURS`.
- `careers.ts`: pensum por semestre y planes de curso. Al empezar otro semestre, cambia `ACTIVE_SEMESTER` y `ACTIVE_LAPSO`.
- `people.ts`: asesores y correctores. Un asesor sin `email` aparece como "correo por confirmar".
- `links.ts`: enlaces oficiales y de WhatsApp.
