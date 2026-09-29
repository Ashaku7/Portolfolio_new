import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {makePreview} from './preview-built-room.mjs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
try{
 for(const width of [1440,390]){
  const page=await makePreview(browser,{viewport:{width,height:width===390?844:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://room.preview/',{waitUntil:'networkidle',timeout:90000});await page.getByRole('button',{name:'STEP INSIDE'}).click({timeout:60000});
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.settled==='room');
  await page.getByRole('button',{name:'To the pitch PLAY / CELEBRATE',exact:true}).click();
  await page.getByRole('button',{name:'Start challenge'}).waitFor();await page.waitForFunction(()=>!document.querySelector('.arcade-start')?.disabled,{timeout:60000});
  await page.waitForTimeout(700);await page.screenshot({path:`artifacts/pitch-lobby-${width}.png`});assert.equal(await page.locator('canvas').count(),1);
  await page.getByRole('button',{name:'Start challenge'}).click();await page.waitForFunction(()=>document.querySelector('.pitch-experience').dataset.state==='playing');
  await page.screenshot({path:`artifacts/pitch-game-${width}.png`});
  await page.getByRole('heading',{name:'End of the run.'}).waitFor({timeout:10000});assert.match(await page.locator('.pitch-result').innerText(),/Missed left foot/);
  await page.getByRole('button',{name:'Try again'}).click();
  await page.waitForFunction(()=>document.querySelector('.pitch-target[data-target=leftFoot]')?.dataset.ready==='true');
  const spot=await page.locator('[data-target=leftFoot]').boundingBox();assert.ok(spot.x>width*.2&&spot.x<width*.8,'ring follows the body, not viewport origin');assert.ok(spot.y>150);
  await page.mouse.click(spot.x+spot.width/2,spot.y+spot.height/2);
  await page.waitForFunction(()=>document.querySelector('.pitch-experience').dataset.score==='1');
  await page.screenshot({path:`artifacts/pitch-contact-${width}.png`});
  await page.getByRole('heading',{name:'End of the run.'}).waitFor({timeout:10000});
  await page.getByRole('button',{name:'Try again'}).click();
  // Exercise the real DOM pointer handlers at each animated contact, including press/hold/release.
  const result=await page.evaluate(()=>new Promise(resolve=>{
   let pressed=-1,holding=false;let previous=0;const timer=setInterval(()=>{
    const root=document.querySelector('.pitch-experience'),state=root.dataset.state,score=Number(root.dataset.score);
    if(state==='gameover'){clearInterval(timer);resolve({state,score,reason:document.querySelector('.pitch-result').innerText});return;}
    if(score>=34){clearInterval(timer);resolve({state,score});return;}
    const target=document.querySelector('.pitch-target[data-active="true"]');
    if(holding&&!target?.classList.contains('is-holding')){window.dispatchEvent(new PointerEvent('pointerup',{pointerId:1,bubbles:true}));holding=false;}
    if(target?.dataset.ready==='true'&&score!==pressed){target.dispatchEvent(new PointerEvent('pointerdown',{pointerId:1,button:0,bubbles:true}));pressed=score;holding=target.dataset.target==='neck';if(!holding)window.dispatchEvent(new PointerEvent('pointerup',{pointerId:1,bubbles:true}));}
   },8);setTimeout(()=>{clearInterval(timer);resolve({state:'timeout'});},110000);
  }));console.log('RUN',width,result);assert.equal(result.score,34);
  await page.keyboard.press('Escape');await page.getByRole('heading',{name:'Paused.'}).waitFor();const time=await page.locator('canvas').getAttribute('data-pitch-time');await page.waitForTimeout(300);assert.equal(await page.locator('canvas').getAttribute('data-pitch-time'),time);
  await page.getByRole('button',{name:'Pitch menu',exact:true}).click();await page.getByRole('button',{name:'Next stop - The iconic Siuu',exact:true}).first().click();
  await page.getByRole('button',{name:'Replay celebration',exact:true}).waitFor();await page.waitForFunction(()=>Number(document.querySelector('canvas').dataset.celebrationProgress)>.999);await page.screenshot({path:`artifacts/pitch-celebration-${width}.png`});const end=Number(await page.locator('canvas').getAttribute('data-pitch-time'));assert.ok(end>2);
  await page.getByRole('button',{name:'Replay celebration',exact:true}).click();await page.waitForTimeout(200);assert.ok(Number(await page.locator('canvas').getAttribute('data-pitch-time'))<end);await page.getByRole('button',{name:'Replay celebration',exact:true}).waitFor();
  await page.getByRole('button',{name:'Locker room',exact:false}).click();await page.getByRole('button',{name:'To the pitch',exact:false}).last().click();await page.getByRole('button',{name:'Start challenge'}).waitFor();assert.equal(await page.locator('.pitch-experience').getAttribute('data-state'),'lobby');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);console.log('PASS browser',width);await page.close();
 }
}finally{await browser.close();}
