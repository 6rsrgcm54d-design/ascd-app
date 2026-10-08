const fs = require('fs');
const path = require('path');

const basePath = __dirname;
const indexHtml = fs.readFileSync(path.join(basePath, 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(basePath, 'css', 'style.css'), 'utf8');
const bibleDataJs = fs.readFileSync(path.join(basePath, 'js', 'bible-data.js'), 'utf8');
const devotionalDataJs = fs.readFileSync(path.join(basePath, 'js', 'devotional-data.js'), 'utf8');
const html2pdfJs = fs.readFileSync(path.join(basePath, 'js', 'html2pdf.bundle.min.js'), 'utf8');
const appJs = fs.readFileSync(path.join(basePath, 'js', 'app.js'), 'utf8');

let bundle = indexHtml;
bundle = bundle.replace('<link rel="stylesheet" href="css/style.css">', `<style>\n${styleCss}\n</style>`);
bundle = bundle.replace('<script src="js/bible-data.js"></script>', `<script>\n${bibleDataJs}\n</script>`);
bundle = bundle.replace('<script src="js/devotional-data.js"></script>', `<script>\n${devotionalDataJs}\n</script>`);
bundle = bundle.replace('<script src="js/html2pdf.bundle.min.js"></script>', `<script>\n${html2pdfJs}\n</script>`);
bundle = bundle.replace('<script src="js/app.js"></script>', `<script>\n${appJs}\n</script>`);

const outPath = path.join(basePath, 'ASCD_Biblia_e_Notas_Completo.html');
fs.writeFileSync(outPath, bundle, 'utf8');
console.log('Bundle created successfully at:', outPath, 'Size:', (bundle.length / 1024).toFixed(1), 'KB');
