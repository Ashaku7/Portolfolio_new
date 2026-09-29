import {chromium} from 'playwright';
import {readFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const buildDir=process.env.PORTFOLIO_BUILD_DIR||'.next';
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2','.wasm':'application/wasm','.glb':'model/gltf-binary','.hdr':'application/octet-stream','.mp3':'audio/mpeg','.mp4':'video/mp4'};
export async function makePreview(browser,options={}){
 const page=await browser.newPage({viewport:{width:1440,height:1000},...options});
 await page.route('http://room.preview/**',async route=>{
  const u=new URL(route.request().url());let name=decodeURIComponent(u.pathname);
  if(name==='/icon.svg')name='/app/icon.svg';else if(name==='/')name='/'+buildDir+'/server/app/index.html';else if(name.startsWith('/_next/static/'))name='/'+buildDir+'/static/'+name.slice(14);else if(name==='/_next/image')name='/public'+u.searchParams.get('url');else name='/public'+name;
  const file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)){return route.fulfill({status:403,body:'Forbidden'});}
  try{const body=await readFile(file);await route.fulfill({body,contentType:mime[path.extname(file)]??'application/octet-stream'});}catch{console.log('MISSING',name);await route.fulfill({status:404,body:'Not found'});}
 });return page;
}
if(process.argv.includes('--inspect')){
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{const page=await makePreview(browser);page.on('pageerror',e=>console.log('ERROR',e.message));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});await page.goto('http://room.preview/',{waitUntil:'networkidle',timeout:90000});await page.getByRole('button',{name:'STEP INSIDE'}).waitFor({timeout:60000});await page.waitForTimeout(4000);await page.screenshot({path:'artifacts/room-welcome.png'});console.log('CANVAS',await page.locator('canvas').count());await page.getByRole('button',{name:'STEP INSIDE'}).click();await page.waitForTimeout(4000);await page.screenshot({path:'artifacts/room-overview.png'});await page.getByRole('button',{name:'Projects',exact:true}).click();await page.waitForTimeout(3500);await page.screenshot({path:'artifacts/room-project.png'});console.log('BODY',await page.locator('body').innerText());}finally{await browser.close();}
}
