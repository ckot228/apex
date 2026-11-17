import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('assets',{recursive:true});
const images={hero:'https://images.unsplash.com/photo-1762314907955-b7c1e11a8782',sedan:'https://images.unsplash.com/photo-1555215695-3004980ad54e',interior:'https://images.pexels.com/photos/6873103/pexels-photo-6873103.jpeg',wash:'https://images.pexels.com/photos/6873090/pexels-photo-6873090.jpeg',polish:'https://images.pexels.com/photos/14908957/pexels-photo-14908957.jpeg',care:'https://images.pexels.com/photos/20051453/pexels-photo-20051453.jpeg'};
for(const [name,url] of Object.entries(images)){
 const widths=name==='hero'?[800,1800]:[700,1200];
 for(const width of widths){const u=url+(url.includes('unsplash')?`?fit=crop&w=${width}&q=82&fm=jpg`:`?auto=compress&cs=tinysrgb&w=${width}`);const r=await fetch(u);if(!r.ok)throw Error(`${name}: ${r.status}`);await writeFile(`assets/${name}-${width}.jpg`,Buffer.from(await r.arrayBuffer()));console.log(name,width);}
}

