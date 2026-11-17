import {writeFile} from 'node:fs/promises';
const css=await (await fetch('https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap',{headers:{'User-Agent':'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}})).text();
let output=css;let index=0;
for(const match of css.matchAll(/url\((https:[^)]+)\)/g)){
 const ext=match[1].includes('.woff2')?'woff2':'ttf';const name=`manrope-${index++}.${ext}`;
 const response=await fetch(match[1]);if(!response.ok)throw Error('Font download failed');
 await writeFile(`assets/${name}`,Buffer.from(await response.arrayBuffer()));output=output.replace(match[1],`./assets/${name}`);
}
await writeFile('fonts.css',output);console.log('Local fonts:',index);
