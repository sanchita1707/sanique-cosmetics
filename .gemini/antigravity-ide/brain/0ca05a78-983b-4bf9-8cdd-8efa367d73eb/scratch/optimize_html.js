const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', '..', '..', '..', '..', 'OneDrive', 'Desktop', 'sanique-cosmetics', 'public');

const filesToOptimize = [
  'product.html',
  'cart.html',
  'checkout.html',
  'wishlist.html',
  'login.html',
  'categories.html',
  'about.html',
  'contact.html',
  'dashboard.html',
  'tracking.html',
  'admin.html',
  'blog.html'
];

console.log('Starting HTML optimizations in:', publicDir);

filesToOptimize.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Add preloads inside head before style.css
  const styleLinkReg = /<link rel="stylesheet" href="\/css\/style\.css">/;
  if (styleLinkReg.test(content) && !content.includes('rel="preload" href="/css/variables.css"')) {
    const preloadBlock = `  <link rel="preload" href="/css/variables.css" as="style">
  <link rel="preload" href="/css/style.css" as="style">
  <link rel="preload" href="/css/navbar.css" as="style">
  <link rel="preload" href="/css/buttons.css" as="style">
  <link rel="preload" href="/css/responsive.css" as="style">
  <link rel="stylesheet" href="/css/style.css">`;
    content = content.replace(styleLinkReg, preloadBlock);
    modified = true;
    console.log(`- Preloaded CSS in ${file}`);
  }

  // 2. Add skip link right inside body
  const bodyReg = /<body[^>]*>/;
  if (bodyReg.test(content) && !content.includes('class="skip-to-content"')) {
    content = content.replace(bodyReg, match => `${match}\n  <a href="#main-content" class="skip-to-content">Skip to Content</a>`);
    modified = true;
    console.log(`- Added skip link to ${file}`);
  }

  // 3. Add id and tabindex to main tag
  const mainReg = /<main([^>]*)>/;
  if (mainReg.test(content) && !content.includes('id="main-content"')) {
    content = content.replace(mainReg, (match, attrs) => {
      // If style or other attributes exist, keep them
      return `<main id="main-content" tabindex="-1"${attrs}>`;
    });
    modified = true;
    console.log(`- Updated main tag in ${file}`);
  }

  // 4. Defer JavaScript tags
  const originalScriptReg = /<script src="([^"]+)"(?! defer)><\/script>/g;
  if (originalScriptReg.test(content)) {
    content = content.replace(originalScriptReg, '<script src="$1" defer></script>');
    modified = true;
    console.log(`- Deferred script tags in ${file}`);
  }

  // 5. Specific SEO Heading fixes
  // In login.html, make "The Luxury Club" title an h1
  if (file === 'login.html') {
    const h2Reg = /<h2 style="font-family:var\(--font-serif\); text-align:center; font-size:2rem; margin-bottom:30px;">The Luxury Club<\/h2>/;
    if (h2Reg.test(content)) {
      content = content.replace(h2Reg, '<h1 style="font-family:var(--font-serif); text-align:center; font-size:2rem; margin-bottom:30px; font-weight:600; color:var(--charcoal);">The Luxury Club</h1>');
      modified = true;
      console.log(`- Upgraded heading to h1 in login.html`);
    }
  }

  // In admin.html, turn title span into an h1
  if (file === 'admin.html') {
    const adminSpanReg = /<span style="font-family: var\(--font-serif\); font-size: 1\.6rem; font-weight: 700; color: var\(--charcoal\);">ADMIN PORTAL<\/span>/;
    if (adminSpanReg.test(content)) {
      content = content.replace(adminSpanReg, '<h1 style="font-family: var(--font-serif); font-size: 1.6rem; font-weight: 700; color: var(--charcoal); margin:0;">ADMIN PORTAL</h1>');
      modified = true;
      console.log(`- Upgraded ADMIN PORTAL title to h1 in admin.html`);
    }
  }

  // 6. Write file back if changed
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`SUCCESS: Optimized ${file}`);
  } else {
    console.log(`NO CHANGE: ${file} was already optimized`);
  }
});
