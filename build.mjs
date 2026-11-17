import {mkdir,copyFile,cp,readFile,writeFile,rm} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','styles.css','fonts.css','app.js','credits.html','.nojekyll'])await copyFile(file,`dist/${file}`);
await cp('assets','dist/assets',{recursive:true});
// Only derive absolute SEO URLs from an explicitly supplied real deployment URL.
if(process.env.SITE_URL){
 const site=new URL(process.env.SITE_URL.endsWith('/')?process.env.SITE_URL:process.env.SITE_URL+'/');
 if(site.protocol!=='https:'||site.search||site.hash)throw Error('SITE_URL must be an HTTPS site URL without query or hash');
 const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const url=escape(site.href),image=escape(new URL('assets/hero-1800.jpg',site).href);
 const html=await readFile('dist/index.html','utf8');
 await writeFile('dist/index.html',html.replace('</head>',`  <link rel="canonical" href="${url}">\n  <meta property="og:url" content="${url}">\n  <meta property="og:image" content="${image}">\n  <meta name="twitter:card" content="summary_large_image">\n</head>`));
 await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${url}</loc></url></urlset>\n`);
 console.log('Canonical and sitemap:',site.href);
} else {
 await rm('dist/sitemap.xml',{force:true});
 console.log('SITE_URL not set: canonical and sitemap omitted until the real URL is known.');
}
console.log('Готово: dist/ — статический сайт для GitHub Pages.');
