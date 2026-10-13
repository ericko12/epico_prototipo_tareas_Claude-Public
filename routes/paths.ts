// Subconjunto de routes/paths.ts de Épico. Los módulos que no existen en la versión
// sintética apuntan a /Modulo/<clave> (pantalla "no incluida en el prototipo").
export const PATH_PAGE = {
  agenda: { root: "/Agenda", listadoRuta: "/Modulo/rutas-lista", nuevaRuta: "/Modulo/rutas-nueva" },
  modulo: (key: string) => `/Modulo/${key}`,
};
