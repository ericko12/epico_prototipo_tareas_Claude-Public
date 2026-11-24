// Genera el catálogo del prototipo de Parque vehicular a partir de las listas de Salesforce.
// Uso: node scripts/catalogo-desde-salesforce.cjs <salesforce-listas-parque-vehicular.json>
// La entrada es la extracción de solo lectura de las listas de Parque_Vehicular__c (anexo del cambio
// 2026-11-06-parque-vehicular en epico-movil). En Salesforce el Modelo depende solo de la Marca: aquí se
// repite la lista de cada marca en todos los tipos donde aparece esa marca.
const fs = require('node:fs');
const path = require('node:path');

const entrada = process.argv[2];
if (!entrada) { console.error('Falta la ruta del JSON de Salesforce.'); process.exit(1); }
const sf = JSON.parse(fs.readFileSync(entrada, 'utf8'));
const esOtro = v => /^otro$/i.test(String(v).trim());
const sinOtro = a => (a || []).filter(v => !esOtro(v));
// Salesforce guarda valores con entidades HTML (53&#39;) y algunas marcas con etiqueta distinta del valor.
const ETIQUETAS = { Italika: 'ITALIKA', Hangcha: 'HANGCHA', Heli: 'HELI', Hyster: 'HYSTER', Jungheinrich: 'JUNGHEINRICH', Linde: 'LINDE', Raymond: 'RAYMOND', Yale: 'YALE', Komatsu: 'KOMATSU', DUCATO: 'Ducato', LONESTAR: 'Lonestar', ZAFIRO: 'Zafiro' };
const etiqueta = v => ETIQUETAS[v] || v;

// Orden de los tipos: el de Salesforce con MC VI antes que MC VII (clarificación 47).
const tipos = [...sf.Tipo__c.values];
const vi = tipos.findIndex(t => t.startsWith('MC VI ')), vii = tipos.findIndex(t => t.startsWith('MC VII '));
if (vii >= 0 && vi > vii) { const [t] = tipos.splice(vi, 1); tipos.splice(vii, 0, t); }

const marcas = {}, modelos = {}, carrocerias = {}, modelosCarroceria = {};
for (const t of tipos) {
  const ms = sinOtro(sf.Marca__c.byController[t]);
  marcas[t] = ms.map(etiqueta);
  for (const m of ms) {
    const lista = sinOtro(sf.Modelo__c.byController[m]).map(etiqueta);
    if (lista.length) modelos[`${t}|${etiqueta(m)}`] = lista;
  }
  const cs = sinOtro(sf.Carroceria__c.byController[t]);
  if (cs.length) {
    carrocerias[t] = cs;
    for (const c of cs) {
      const lista = sinOtro(sf.Modelo_Carroceria__c.byController[c]);
      if (lista.length) modelosCarroceria[`${t}|${c}`] = lista;
    }
  }
}

const catalogo = {
  fuente: 'Listas de Salesforce (Parque_Vehicular__c, «Crear Parque Vehicular»), extraídas el 24-nov-2026 de solo lectura. Etiquetas exactas. Sin la opción OTRO de Salesforce: el prototipo la ofrece como «Otro (no está en la lista)» con texto.',
  notaRelacionModeloTipo: 'En Salesforce el Modelo depende solo de la Marca: cada marca ofrece todos sus modelos en cualquier tipo. La clarificación 24 pide filtrar por tipo y marca; queda pendiente de que Empresas clasifique los modelos por tipo.',
  tipos,
  sinCatalogo: tipos.filter(t => !marcas[t].length),
  marcas, carrocerias, modelos, modelosCarroceria,
  motores: sinOtro(sf.Motor__c.values),
  ordenTipos: 'Por familia, en el orden de Salesforce con MC VI antes que MC VII (clarificación 47).',
};
const raiz = path.resolve(__dirname, '..');
for (const destino of ['features/parqueVehicular/domain/catalog.json', 'public/parque-vehicular-catalog.json'])
  fs.writeFileSync(path.join(raiz, destino), JSON.stringify(catalogo, null, 2) + '\n');
console.log(`Tipos ${tipos.length} · sin marcas ${catalogo.sinCatalogo.length} · combinaciones tipo|marca con modelos ${Object.keys(modelos).length} · tipo|carrocería con modelos ${Object.keys(modelosCarroceria).length} · motores ${catalogo.motores.length}`);
