const fs = require('fs'), path = require('path');
const root = process.cwd();
function walk(dir) { return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]); }
const source=walk(path.join(root,'src'));
const scripts=walk(path.join(root,'scripts')).filter(f=>f.endsWith('.mjs'));
const visited=new Set(), missing=[];
function resolve(from,spec) {
  if(!spec.startsWith('.')) return null;
  const base=path.resolve(path.dirname(from),spec);
  return [base,base+'.js',base+'.jsx',base+'.json',base+'.css',path.join(base,'index.js'),path.join(base,'index.jsx')].find(f=>fs.existsSync(f)&&fs.statSync(f).isFile())||null;
}
function visit(file) {
  if(visited.has(file)) return;
  visited.add(file);
  const text=fs.readFileSync(file,'utf8');
  for(const m of text.matchAll(/(?:import|export)\s+(?:[^;'"]*?\s+from\s*)?['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    const spec=m[1]||m[2]; if(!spec.startsWith('.'))continue;
    const target=resolve(file,spec); if(target)visit(target); else missing.push({file,spec});
  }
  for(const m of text.matchAll(/(?:readFileSync|new URL)\(\s*['"](src\/[^'"]+)['"]/g)) { const target=path.resolve(root,m[1]); if(fs.existsSync(target))visit(target); }
}
visit(path.join(root,'src/main.jsx')); for(const script of scripts)visit(script);
const unused=source.filter(f=>!visited.has(f)).map(f=>path.relative(root,f).replaceAll('\\','/'));
fs.mkdirSync('hostinger/cleanup',{recursive:true});
fs.writeFileSync('hostinger/cleanup/unused.json',JSON.stringify(unused));
console.log(JSON.stringify({unused,missing},null,2));
