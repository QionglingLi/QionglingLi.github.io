import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { parse, stringify } from 'yaml';
import { build, projectRoot } from './build.mjs';

await build();
const profile = parse(await fs.readFile(path.join(projectRoot,'_data/profile.yml'),'utf8'));
const papers = parse(await fs.readFile(path.join(projectRoot,'_data/publications.yml'),'utf8'));
for (const lang of ['zh','en']) {
  const html = await fs.readFile(path.join(projectRoot,'dist',`${lang}.html`),'utf8');
  assert(html.includes(profile[lang].name));
  assert(!html.includes('class="profile-hero"'));
  assert.equal((html.match(/class="research-feature"/g)||[]).length,3);
  assert(!html.includes('Adapted from'));
  assert(!html.includes('id="experience"'));
  assert(!html.includes('class="paper-list"'));
  const pubHtml=await fs.readFile(path.join(projectRoot,'dist',lang+'-publications.html'),'utf8');
  assert.equal((pubHtml.match(/<li><h3>/g)||[]).length,papers.length);
  const years=[...pubHtml.matchAll(/class="year-heading">([0-9]{4})/g)].map(m=>Number(m[1]));
  assert.deepEqual(years,[...years].sort((a,b)=>b-a));
  for(const page of ['news','team','funding','publications','teaching','contact']) {
    const pageHtml=await fs.readFile(path.join(projectRoot,'dist',lang+'-'+page+'.html'),'utf8');
    assert(pageHtml.includes('href="'+(lang==='zh'?'en':'zh')+'-'+page+'.html"'));
    assert.equal(pageHtml.includes('id="experience"'),page==='team');
  }
  assert(!html.includes('{{') && !html.includes('{%'), 'Unrendered template tags');
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const target=match[1];
    if (/^(https?:|mailto:)/.test(target)) continue;
    await fs.access(path.join(projectRoot,'dist',target.split(/[?#]/)[0]));
  }
}
// Verify that the editable source actually drives both published pages.
const fixture=await fs.mkdtemp(path.join(os.tmpdir(),'academic-edit-check-'));
try {
  for (const dir of ['_data','_layouts','content','assets']) await fs.cp(path.join(projectRoot,dir),path.join(fixture,dir),{recursive:true});
  profile.email='editing-check@example.org';
  await fs.writeFile(path.join(fixture,'_data/profile.yml'),stringify(profile));
  papers.unshift({year:2027,title:'Source update verification',authors:'Qiongling Li',journal:'Verification Journal',url:''});
  await fs.writeFile(path.join(fixture,'_data/publications.yml'),stringify(papers));
  await build(fixture);
  for (const lang of ['zh','en']) {
    const html=await fs.readFile(path.join(fixture,'dist',lang+'-team.html'),'utf8');
    assert(html.includes('editing-check@example.org'));
    const pubHtml=await fs.readFile(path.join(fixture,'dist',lang+'-publications.html'),'utf8');
    assert(pubHtml.indexOf('Source update verification') < pubHtml.indexOf('Spatiotemporal dynamics'));
  }
} finally { await fs.rm(fixture,{recursive:true,force:true}); }
console.log('PASS: bilingual build, links/assets, template rendering, publication count, and source edit propagation.');

