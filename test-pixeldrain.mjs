import fs from 'fs';
import path from 'path';

const filePath = '/Users/vedang/PDFtoWebsite/.github/images/post_01.png';

async function uploadToPixelDrain(filePath) {
  try {
    const fileData = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif' };
    const mime = mimeTypes[ext] || 'image/jpeg';

    const formData = new FormData();
    formData.append('anonymous', 'true');
    
    const file = new File([fileData], path.basename(filePath), { type: mime });
    formData.append('file', file);

    const res = await fetch('https://pixeldrain.com/api/file', {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    console.log('PixelDrain response:', data);
    if (data.id) {
      console.log('Direct link:', `https://pixeldrain.com/api/file/${data.id}`);
    }
  } catch (e) {
    console.error('PixelDrain error:', e.message);
  }
}

uploadToPixelDrain(filePath);
