const {run}=require('./browser-helper.cjs'),assert=require('node:assert/strict'),fs=require('fs');const results=[];
const cases={
paycalc:['bonus-tax-withholding-calculator',async p=>{assert.match(await p.locator('#bonus-output').innerText(),/780.00/);await p.locator('#bonus-rate').fill('0');assert.match(await p.locator('#bonus-output').innerText(),/1000.00/);await p.locator('#bonus-gross').fill('');assert.equal(await p.locator('#bonus-output').innerText(),'');}]
};
(async()=>{for(const [site,[slug,test]] of Object.entries(cases)){await run(site,async(p,url,errors)=>{for(const lang of ['','zh/','de/','es/','fr/','ja/','pt/']){await p.goto(url+'/'+lang+slug);await test(p);results.push({site,lang,status:'passed'});}assert.deepEqual(errors,[]);});console.log(site,'passed');}})().catch(e=>{console.error(e);process.exitCode=1});
