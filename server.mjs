import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
const root=resolve('.');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.jpg':'image/jpeg','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
createServer(async(req,res)=>{
 try {
  let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname==='/apex-detailing') {res.writeHead(302,{Location:'/apex-detailing/'});res.end();return;}
  if(pathname.startsWith('/apex-detailing/'))pathname=pathname.slice('/apex-detailing'.length);
  let file=resolve(root,'.'+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  if((await stat(file)).isDirectory())file=resolve(file,'index.html');
  const content=await readFile(file);
  res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(content);
 }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Файл не найден');}
}).listen(4185,'127.0.0.1',()=>console.log('APEX: http://127.0.0.1:4185/apex-detailing/'));
