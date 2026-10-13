/** Exportación estática: se puede publicar en GitHub Pages.
 *  Para un subdirectorio (p. ej. /epico-sintetico) define NEXT_PUBLIC_BASE_PATH al hacer build. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export default {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
};
