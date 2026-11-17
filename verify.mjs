import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const html=await readFile('index.html','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate element IDs');
assert.equal([...html.matchAll(/<h1\b/g)].length,1,'One primary heading');
for(const m of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(m[1]),`Missing anchor ${m[1]}`);
for(const file of ['index.html','credits.html','styles.css','fonts.css']){
 const content=await readFile(file,'utf8');
 const refs=[...content.matchAll(/(?:src|href)="(\.\/[^"#]+)"|url\(['"]?(\.\/[^)'" ]+)/g)].map(m=>m[1]||m[2]);
 for(const ref of refs)assert((await stat(resolve(dirname(file),ref))).isFile(),`${file}: missing ${ref}`);
 for(const m of content.matchAll(/srcset="([^"]+)"/g))for(const source of m[1].split(','))await stat(source.trim().split(/\s/)[0]);
}
assert.equal([...html.matchAll(/data-service=/g)].length,6,'Six service actions');
for(const match of html.matchAll(/data-photo="([^"]+)"/g))await stat(`assets/${match[1]}-${match[1]==='hero'?1800:1200}.jpg`);
const app=await readFile('app.js','utf8');
assert(!/\b(fetch|XMLHttpRequest|sendBeacon|localStorage|sessionStorage)\s*[.(]/.test(app),'Demo must not transmit or persist data');
assert(/type="submit" disabled/.test(html),'No-JS form submission must be disabled');
const functionSource=app.slice(app.indexOf('function fieldError('),app.indexOf('function validateField('));
const context=vm.createContext({});vm.runInContext(functionSource,context);
const validate=(id,value)=>context.fieldError({id,value});
assert(validate('name','  '));assert(validate('name','A'));assert.equal(validate('name','Тест'),'');
for(const phone of ['123','abcdef1234567890','+7 (000) 000-00','1234567890123456'])assert(validate('phone',phone),phone);
for(const phone of ['+7 (000) 000-00-00','8 000 000 00 00','+44 0000 000000'])assert.equal(validate('phone',phone),'',phone);
assert(validate('car',' '));assert.equal(validate('car','Porsche 911'),'');assert(validate('service',''));
assert.equal(validate('service','Комплексный детейлинг'),'');
for(const m of html.matchAll(/<img\b[^>]+>/g))assert(/\balt="/.test(m[0]),'Image needs alt');
console.log('PASS: local assets, anchors, IDs, heading, service/gallery targets, no-data boundary, validation cases.');
console.log('Browser layout, focus, menu and dialog interaction remain separate manual checks.');

