const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/pages/Metrics.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Substituir a lógica de datas padrão
content = content.replace(
  /if \(!startDate && !endDate\) {\s*const today = new Date\(\);\s*const thirtyDaysAgo = new Date\(today\);\s*thirtyDaysAgo\.setDate\(today\.getDate\(\) - 30\);\s*setEndDate\(today\.toISOString\(\)\.split\('T'\)\[0\]\);\s*setStartDate\(thirtyDaysAgo\.toISOString\(\)\.split\('T'\)\[0\]\);/g,
  `if (!startDate && !endDate) {
      // Usar datas de maio 2025 por padrão
      setEndDate('2025-05-22');
      setStartDate('2025-05-19');`
);

fs.writeFileSync(filePath, content);
console.log('✅ Metrics.jsx atualizado com datas de maio 2025');
