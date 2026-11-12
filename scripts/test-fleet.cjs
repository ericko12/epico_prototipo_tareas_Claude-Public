// Pruebas del dominio de Parque vehicular (spec SDD 2026-11-06-parque-vehicular). Uso: node scripts/test-fleet.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');
const path = require('node:path');
const filename = path.resolve(__dirname, '../features/parqueVehicular/domain/fleet.ts');
const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true, resolveJsonModule: true } });
const mod = new Module(filename, module);
mod.filename = filename;
mod.paths = Module._nodeModulePaths(path.dirname(filename));
mod._compile(compiled.outputText, filename);
const f = mod.exports;
const today = new Date('2026-11-12T12:00:00Z');
const F = (x) => ({ ...f.EMPTY_FORM, ...x });

// Catálogo de la matriz (clar. 23, 26, 27)
assert.equal(f.TYPES.length, 27, '27 tipos de Salesforce');
assert.ok(f.TYPES.includes('MC V - Combustión interna, llanta neumática'));
assert.equal(f.MOTORS.length, 110, '111 motores de la matriz menos OTRO');
assert.equal(f.brandsFor('REMOLQUE - JAULA').length, 0, 'Tipo sin catálogo verificado');
// Carrocería solo en autobús y por tipo; modelo de carrocería por carrocería (clar. 21, 25)
assert.equal(f.bodiesFor('Servicio pesado').length, 0);
assert.equal(f.bodiesFor('Autobús- Transporte foráneo o de turismo').length, 14);
assert.ok(f.bodyModelsFor('Autobús- Transporte foráneo o de turismo', 'MARCOPOLO').includes('PARADISO G8 1200'));
// Modelo por tipo y marca (clar. 24)
assert.ok(f.modelsFor('Autobús- Transporte foráneo o de turismo', 'VOLVO').includes('B11R'));
assert.ok(!f.modelsFor('Autobús- Transporte foráneo o de turismo', 'VOLVO').includes('FH460'), 'Un autobús no ofrece tractocamiones');
assert.ok(f.modelsFor('Servicio pesado', 'VOLVO').includes('FH460'));

// Universo por rol (clar. 9, 34, 43)
assert.deepEqual(f.universe('asesor', '529').map(a => a.id), ['529-BASE', '529-D1']);
assert.deepEqual(f.universe('gerente', '529').map(a => a.id), ['529-BASE', '529-D1'], 'Gerente: Direcciones de sus asesores y ninguna otra');
assert.equal(f.universe('kam', '529').length, 3);
assert.equal(f.universe('soporte', '529').length, 3);
const mty = f.ADDRESSES.find(a => a.id === '529-MTY'), base = f.ADDRESSES.find(a => a.id === '529-BASE');
assert.equal(f.canRegister('asesor', base), true);
assert.equal(f.canRegister('admin', base), false, 'Solo el asesor registra');
assert.equal(f.canRegister('asesor', mty), false);
assert.equal(f.canEdit('admin', mty), true);
assert.equal(f.canEdit('kam', base), false);

// Validación (clar. 3, 7, 44)
const bus = F({ type: 'Autobús- Transporte foráneo o de turismo', brand: 'VOLVO', model: 'B11R', body: 'MARCOPOLO', bodyModel: 'PARADISO G8 1200', units: '8' });
assert.deepEqual(f.validateFleet(bus, today), {});
assert.deepEqual(f.validateFleet({ ...bus, body: '', bodyModel: '' }, today), {}, 'Carrocería opcional');
for (const units of ['', '0', '-3', '2.5', 'abc']) assert.ok(f.validateFleet({ ...bus, units }, today).units, `unidades ${units}`);
assert.ok(f.validateFleet({ ...bus, from: '218' }, today).from, 'Año de tres dígitos');
assert.ok(f.validateFleet({ ...bus, to: '2027' }, today).to, 'Año futuro');
assert.deepEqual(f.validateFleet({ ...bus, from: '1018' }, today), {}, 'Sin año mínimo');
assert.ok(f.validateFleet({ ...bus, from: '2020', to: '2015' }, today).from, 'Inicial posterior al final');
assert.ok(f.validateFleet({ ...bus, brand: f.OTRO, brandText: '  ', model: f.OTRO, modelText: 'X' }, today).brandText, '«Otro» sin texto');
assert.deepEqual(f.validateFleet({ ...bus, brand: f.OTRO, brandText: 'Fruehauf', model: f.OTRO, modelText: 'X' }, today), {});
assert.ok(f.validateFleet({ ...bus, brand: 'KENWORTH' }, today).brand, 'Marca de otro tipo');

// Limpieza por rama (clar. 25, 39)
const changed = f.applyChange(bus, 'brand', 'SCANIA');
assert.equal(changed.model, '');
assert.equal(changed.body, 'MARCOPOLO', 'Cambiar la marca conserva la carrocería');
assert.equal(f.applyChange(bus, 'body', 'IRIZAR').bodyModel, '');
assert.equal(f.applyChange(bus, 'brand', f.OTRO).model, f.OTRO, 'Marca «Otro» lleva modelo «Otro»');
assert.equal(f.applyChange(bus, 'type', 'Servicio pesado').body, '');

// Coincidencias (clar. 2, 16, 35)
const k = F({ type: 'Servicio pesado', brand: 'VOLVO', model: 'FH460', from: '2018', to: '2021', units: '12' });
assert.equal(f.coincide(k, { ...k, from: '2020', to: '2023' }), true, 'Años que se cruzan');
assert.equal(f.coincide(k, { ...k, from: '2022', to: '2024' }), false, 'Rangos seguidos o separados');
assert.equal(f.coincide(k, { ...k, from: '', to: '' }), true, 'Sin años cuenta como posible coincidencia');
assert.equal(f.coincide({ ...k, motor: 'D13' }, k), true, 'Motor vacío en uno');
assert.equal(f.coincide({ ...k, motor: 'D13' }, { ...k, motor: 'D11' }), false);
const o1 = F({ type: 'REMOLQUE - JAULA', brand: f.OTRO, brandText: 'Fruehauf', model: f.OTRO, modelText: 'Jaula', units: '1' });
assert.equal(f.coincide(o1, { ...o1, brandText: ' fruehauf ' }), true, '«Otro» sin mayúsculas ni espacios');
const drafts = [{ ...k, tempId: 'S1', justification: '' }, { ...k, tempId: 'S2', justification: '' }];
const conflicts = f.reviewConflicts(drafts, []);
assert.equal(f.needsResolution(conflicts[0]), false);
assert.equal(f.needsResolution(conflicts[1]), true, 'Coincidencia dentro de la sesión');
assert.equal(f.needsResolution(f.reviewConflicts([{ ...drafts[1], justification: 'son nuevas' }], [])[0]), false);

// Guardado parcial y folio (clar. 1)
const saved = f.saveDrafts([{ ...k, tempId: 'S1', justification: '' }, { ...k, units: '0', tempId: 'S2', justification: '' }], f.INITIAL_FLEETS, '529-BASE', 'Pedro', today);
assert.equal(saved.results[0].ok, true);
assert.equal(saved.results[1].ok, false);
assert.equal(saved.results[0].group.id, '00129');
assert.equal(saved.groups.length, f.INITIAL_FLEETS.length + 1);

// Reporte de «Otro» y reasignación (clar. 31, 42, 44)
const report = f.otroReport(f.INITIAL_FLEETS);
const fr = report.find(r => r.field === 'brand' && r.type === 'REMOLQUE - CAJA SECA');
assert.equal(fr.count, 2, '«Hyundai» y «hyundai » en una fila');
assert.ok(f.reassignOptions(fr).includes('Hyndai'), 'Se reasigna a la etiqueta de Salesforce');
const reassigned = f.reassign(f.INITIAL_FLEETS, fr, 'Hyndai', 'Carla', today);
const g = reassigned.find(x => x.id === '00125');
assert.equal(g.brand, 'Hyndai');
assert.equal(g.originals[0].value, 'Otro · Hyundai');
assert.equal(g.lastSurvey, f.INITIAL_FLEETS.find(x => x.id === '00125').lastSurvey, 'Reasignar no renueva el levantamiento');

// Modificar: solo el asesor renueva el levantamiento (clar. 37)
const g0 = f.INITIAL_FLEETS[1];
assert.notEqual(f.editGroup(g0, { ...g0, units: '8' }, 'vendió 2', 'asesor', today).lastSurvey, g0.lastSurvey);
assert.equal(f.editGroup(g0, { ...g0, units: '8' }, 'corrección', 'admin', today).lastSurvey, g0.lastSurvey);

assert.equal(f.validStoredFleets(f.INITIAL_FLEETS), true);
assert.equal(f.validStoredFleets([{ id: 'incompleto' }]), false);
console.log('Pruebas de Parque vehicular aprobadas: catálogo, roles, validación, limpieza, coincidencias, guardado, reporte y modificación.');

// Orden de los 27 tipos por familia, con MC VI antes que MC VII (clar. 47)
const i6 = f.TYPES.findIndex(t => t.startsWith('MC VI ')), i7 = f.TYPES.findIndex(t => t.startsWith('MC VII'));
assert.ok(i6 >= 0 && i6 + 1 === i7, 'MC VI va justo antes que MC VII');
assert.equal(JSON.stringify(require('../public/parque-vehicular-catalog.json').tipos), JSON.stringify(f.TYPES), 'Escritorio y móvil con el mismo orden');
console.log('Orden de tipos verificado.');
