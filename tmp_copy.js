const fs = require('fs');
try {
  fs.copyFileSync('C:\\Users\\milky\\.gemini\\antigravity\\brain\\8ee141fe-359f-4ba4-bd00-1a74e8e73b9f\\liquid_preview_1774698715873.png', 'd:\\#가족용\\web\\chosun-yokai\\assets\\previews\\liquid.png');
  console.log('Success');
} catch (e) {
  console.error(e);
}
