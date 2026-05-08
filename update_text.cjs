const fs = require('fs');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/text-\[8px\]/g, 'text-[10px]')
    .replace(/text-\[9px\]/g, 'text-xs')
    .replace(/text-\[10px\]/g, 'text-xs')
    .replace(/text-xs/g, 'text-sm')
    .replace(/text-sm/g, 'text-base')
    // reduce rounded corners on some extreme roundings
    .replace(/rounded-\[2\.5rem\]/g, 'rounded-3xl')
    .replace(/rounded-\[3rem\]/g, 'rounded-3xl')
    .replace(/bg-midnight/g, 'bg-slate-900')
    .replace(/text-midnight/g, 'text-slate-900')
    .replace(/border-midnight/g, 'border-slate-300');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Updated', file);
  }
});
