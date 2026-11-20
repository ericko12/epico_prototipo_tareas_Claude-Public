const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),ts=require('typescript');
const src=ts.transpileModule(fs.readFileSync('features/contactos/domain/contactos.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
const sb={exports:{},Date,Math,Set,console};vm.runInNewContext(src,sb);const m=sb.exports;
const s0=m.INITIAL_STATE;const ids=l=>[...l.map(c=>c.id)];
// Vista de BASE OPERATIVA: decisores primero, sin dirección aparte (clar. 12).
let v=m.addressView(s0,'529','529-BASE');
assert.deepEqual(ids(v.here),['C1','C2']);
assert.deepEqual(ids(v.withoutAddress).sort(),['C3','C4','C6']);
assert.deepEqual(ids(v.elsewhere),['C5']);
// Faltantes del heredado (clar. 6, 11, 19).
assert.deepEqual([...m.missing(s0.contacts.find(c=>c.id==='C4'))],['Área de contacto','Correo']);
// Obligatorios: nombre, área, teléfono y correo en la primera fila (clar. 6, 11, 16).
const bad=m.validate({name:' ',area:'',rows:[{number:'',ext:'',email:''}]});
assert.ok(bad.name&&bad.area&&bad.rows[0].number&&bad.rows[0].email);
assert.equal(m.hasErrors(m.validate({name:'Luis',area:'Compras',rows:[{number:'3312345678',ext:'',email:'a@b.mx'},{number:'',ext:'',email:''}]})),false);
assert.ok(m.validate({name:'Luis',area:'Compras',rows:[{number:'331',ext:'',email:'a@b.mx'}]}).rows[0].number);
// Alta desde la dirección queda asociada; desde el cliente, sin dirección (clar. 10).
let s=m.createContact(s0,'529',{name:'Nuevo',area:'Compras',decides:false,rows:[{number:'3312345678',ext:'',email:'n@x.mx'}]},'529-D1');
const nuevo=s.contacts.at(-1);assert.equal(m.activeFor(s,nuevo.id)[0].addressId,'529-D1');
s=m.createContact(s,'529',{name:'Otro',area:'Compras',decides:false,rows:[{number:'3312345678',ext:'',email:'o@x.mx'}]});
assert.equal(m.activeFor(s,s.contacts.at(-1).id).length,0);
// Asociar no duplica (clar. 15); varias direcciones con los mismos datos (clar. 3, 5).
const before=s.associations.length;s=m.associate(s,'C1','529-BASE');assert.equal(s.associations.length,before);
s=m.associate(s,'C1','529-MTY');assert.equal(m.activeFor(s,'C1').length,3);
// Inactivar deja histórico; volver a asociar crea otro periodo (clar. 13, 14).
const a2=s.associations.find(a=>a.contactId==='C1'&&a.addressId==='529-D1');
s=m.inactivate(s,a2.id,'Cambió de dirección');assert.equal(m.addressView(s,'529','529-D1').history.length,2);
s=m.associate(s,'C1','529-D1');assert.equal(s.associations.filter(a=>a.contactId==='C1'&&a.addressId==='529-D1').length,2);
// Dirección inactiva: vínculos al histórico con motivo del sistema; quien no tenía otra queda sin dirección (clar. 8).
s=m.inactivateAddress(s0,'529-BASE');
assert.ok(s.associations.filter(a=>a.addressId==='529-BASE').every(a=>a.to&&a.reason==='Dirección inactiva'));
assert.ok(m.addressView(s,'529','529-D1').withoutAddress.some(c=>c.id==='C2'));
assert.equal(m.activeFor(s,'C1').length,1);
console.log('16 verificaciones de contactos por dirección: OK');
