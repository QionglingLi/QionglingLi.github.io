import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Liquid } from 'liquidjs';
import { marked } from 'marked';
import { parse } from 'yaml';

export const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link = value => { if (value && !/^https?:\/\//.test(value)) throw new Error(`Link must begin with http:// or https://: ${value}`); return value; };

export async function build(root = projectRoot, output = path.join(root, 'dist')) {
  const profile = parse(await fs.readFile(path.join(root, '_data/profile.yml'), 'utf8'));
  const publications = parse(await fs.readFile(path.join(root, '_data/publications.yml'), 'utf8'));
  if (!Array.isArray(publications)) throw new Error('publications.yml must contain a list.');
  for (const paper of publications) {
    for (const key of ['title', 'authors', 'journal', 'year']) if (!paper[key]) throw new Error(`Publication missing ${key}.`);
    if (!Number.isInteger(Number(paper.year))) throw new Error(`Invalid publication year: ${paper.year}`);
    link(paper.url);
  }
  for (const key of ['email', 'avatar', 'scholar', 'university_profile', 'updated']) if (!profile[key]) throw new Error(`profile.yml missing ${key}.`);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) throw new Error('Invalid email address.');
  link(profile.scholar); link(profile.university_profile);
  if (path.isAbsolute(profile.avatar) || profile.avatar.includes('..')) throw new Error('Avatar must be a relative path within assets.');
  await fs.access(path.join(root, profile.avatar));
  await fs.mkdir(output, {recursive: true});
  await fs.cp(path.join(root, 'assets'), path.join(output, 'assets'), {recursive: true});
  const template = await fs.readFile(path.join(root, '_layouts/homepage.html'), 'utf8');
  const engine = new Liquid({strictVariables: true, strictFilters: true});
  const sorted = [...publications].sort((a,b) => Number(b.year)-Number(a.year));
  const papers = `<ol class="paper-list">${sorted.map(p => `<li><h3>${p.url ? `<a href="${escape(p.url)}" target="_blank" rel="noopener">${escape(p.title)}</a>` : escape(p.title)}</h3><p class="authors">${escape(p.authors).replace(/Qiongling Li/g, '<strong>Qiongling Li</strong>')}</p><p class="journal"><em>${escape(p.journal)}</em>; ${escape(p.year)}</p></li>`).join('')}</ol>`;
  const years = [...new Set(sorted.map(p => Number(p.year)))];
  const groupedPapers = years.map(year => '<h3 class="year-heading">'+year+'</h3><ol class="paper-list">'+sorted.filter(p=>Number(p.year)===year).map(p=>'<li><h3>'+(p.url?'<a href="'+escape(p.url)+'" target="_blank" rel="noopener">'+escape(p.title)+'</a>':escape(p.title))+'</h3><p class="authors">'+escape(p.authors).replace(/Qiongling Li/g,'<strong>Qiongling Li</strong>')+'</p><p class="journal"><em>'+escape(p.journal)+'</em>; '+escape(p.year)+'</p></li>').join('')+'</ol>').join('');
  const team = parse(await fs.readFile(path.join(root,'_data/team.yml'),'utf8'));
  const renderTeam = language => team.map(group => '<h3 class="team-heading">'+escape(group.category)+'</h3><div class="team-grid">'+group.members.map(member=>{
    const name=language==='en' ? (member.name_en || member.name || '') : (member.name || member.name_en || '');
    const photo=member.photo ? member.photo.replaceAll('\\','/') : '';
    return '<article class="member">'+(photo?'<img class="member-photo" src="'+escape(photo)+'" alt="'+escape(name)+'" width="640" height="800" loading="lazy" decoding="async">':'<div class="member-photo photo-placeholder" aria-label="Photo placeholder"></div>')+(name?'<h4>'+(member.url?'<a href="'+escape(link(member.url))+'" target="_blank" rel="noopener">'+escape(name)+'</a>':escape(name))+'</h4>':'<div class="name-placeholder" aria-hidden="true"></div>')+(member.description?'<p class="member-description">'+escape(member.description)+'</p>':'')+'</article>';
  }).join('')+'</div>').join('');
  const research = parse(await fs.readFile(path.join(root,'_data/research.yml'),'utf8'));
  const renderResearch = language => '<div class="research-more"><a href="'+language+'-publications.html">'+(language==='zh'?'更多':'More')+'</a></div>'+research.map((item,index)=>'<article class="research-feature"><div class="research-heading"><p class="research-index">0'+(index+1)+'</p><h3><a href="'+escape(item.url)+'" target="_blank" rel="noopener">'+escape(item[language].title)+'</a></h3></div><div class="research-copy">'+item[language].paragraphs.map(p=>'<p>'+escape(p)+'</p>').join('')+'<p class="research-citation"><a href="'+escape(item.url)+'" target="_blank" rel="noopener">'+escape(item.citation)+'</a></p></div><figure class="research-figure"><a href="'+escape(item.image)+'" target="_blank" rel="noopener"><img src="'+escape(item.preview_image || item.image)+'" alt="'+escape(item[language].caption)+'" loading="lazy"></a><figcaption>'+escape(item[language].caption)+'</figcaption></figure></article>').join('');
  const visitorMapHtml = await fs.readFile(path.join(root,'_data/visitor-map.html'),'utf8');
  const results = [];
  for (const language of ['zh','en']) {
    const localized = profile[language];
    for (const key of ['name','position','affiliation','description','labels']) if (!localized?.[key]) throw new Error(`Missing ${language}.${key} in profile.yml.`);
    const markdown = await fs.readFile(path.join(root, 'content', `${language}.md`), 'utf8');
    if (!markdown.includes('{{ publications }}')) throw new Error(`${language}.md needs a {{ publications }} insertion point.`);
    const blocks = Object.fromEntries([...markdown.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>([\s\S]*?)(?=<h2 id=|$)/g)].map(m=>[m[1],{title:m[2],body:m[3]}]));
    const definitions = [
      ['home',['about']], ['news',['news']], ['team',['experience','team']], ['funding',['funding']], ['publications',['publications']],
      ['teaching',['teaching']], ['contact',['contact']]
    ];
    const names = language==='zh' ? ['主页','新闻','团队','项目','论文','教学','联系'] : ['Home','News','Team','Funding','Publications','Teaching','Contact'];
    const filenameFor = (key,lang=language) => key==='home' ? lang+'.html' : lang+'-'+key+'.html';
    for (const [index,[page,sections]] of definitions.entries()) {
      const navigation=definitions.map(([key],i)=>({label:names[i],url:filenameFor(key),active:key===page}));
      const content=sections.map(id=>{
        const block=blocks[id];
        if(!block) throw new Error('Missing section '+id);
        return '<h2 id="'+id+'">'+block.title+'</h2>'+marked.parse(block.body.replace('{{ publications }}',groupedPapers).replace('{{ team }}',renderTeam(language)));
      }).join('') + (page==='home' ? renderResearch(language) : '');
      const site = {...profile, ...localized, lang:language==='zh'?'zh-CN':'en'};
      const html=await engine.parseAndRender(template,{site,content,language,page,navigation,visitor_map_html:visitorMapHtml,page_title:names[index],zh_url:filenameFor(page,'zh'),en_url:filenameFor(page,'en')});
      const filename=filenameFor(page);
      await fs.writeFile(path.join(output,filename),html);
      results.push(filename);
      if(language==='zh' && page==='home') await fs.writeFile(path.join(output,'index.html'),html);
    }
  }
  return results;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(`Built: ${(await build()).join(', ')}, index.html`); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}

