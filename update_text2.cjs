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
    // Bump smaller hardcoded pixel font sizes to tailwind responsive classes
    .replace(/text-\[8px\]/g, 'text-xs')
    .replace(/text-\[9px\]/g, 'text-xs')
    .replace(/text-\[10px\]/g, 'text-xs')
    .replace(/text-\[11px\]/g, 'text-sm')
    .replace(/text-\[12px\]/g, 'text-sm')
    
    // Convert remaining text-xs to text-sm for better readability
    .replace(/\btext-xs\b/g, 'text-sm')

    // Softer darks for better contrast and ease on eyes
    .replace(/\bbg-slate-900\b/g, 'bg-[#1e293b]')
    .replace(/\btext-slate-900\b/g, 'text-[#0f172a]')

    // Fix sidebar width reduction (from 64 to 56)
    .replace(/\bw-64\b/g, 'w-56')
    .replace(/\bml-64\b/g, 'ml-56');
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent);
    console.log('Updated', file);
  }
});
