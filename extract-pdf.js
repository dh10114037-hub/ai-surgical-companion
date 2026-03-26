const pdfParse = require('/Users/housfolder/.workbuddy/binaries/node/workspace/node_modules/pdf-parse/dist/cjs/index.cjs');
const fs = require('fs');

const pdfPath = '/Users/housfolder/Desktop/结直肠癌腹膜转移诊治专家共识（2025版）.pdf';

async function extractPDF() {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    
    console.log('PDF内容提取成功！');
    console.log('页数:', data.numpages);
    console.log('内容长度:', data.text.length);
    console.log('\n--- 前3000字符内容 ---\n');
    console.log(data.text.substring(0, 3000));
    
    // 保存完整内容到文件
    fs.writeFileSync('/Users/housfolder/WorkBuddy/20260324182845/pdf-content.txt', data.text);
    console.log('\n\n完整内容已保存到 pdf-content.txt');
  } catch (err) {
    console.error('提取失败:', err.message);
  }
}

extractPDF();
