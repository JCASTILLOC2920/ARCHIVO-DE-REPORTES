const fs = require('fs');
let js = fs.readFileSync('reportes.js', 'utf8');

// 1. Update compressImage function signature
js = js.replace(
    /function compressImage\(fileOrDataUrl, maxWidth = 600, maxHeight = 600, quality = 0\.75\) \{/g,
    'function compressImage(fileOrDataUrl, maxWidth = 800, maxHeight = 800, quality = 0.65) {'
);

// 2. Update CropperJS getCroppedCanvas logic
// Since it's repeated twice (cropper01 and cropper02), we can just replace the specific block text
// using a global regex to catch both.
js = js.replace(
    /maxWidth: 600,\s*maxHeight: 600/g,
    'maxWidth: 800,\n                maxHeight: 800'
);

// 3. Update canvas.toDataURL('image/jpeg', 0.75) to 0.65
js = js.replace(
    /canvas\.toDataURL\('image\/jpeg', 0\.75\)/g,
    "canvas.toDataURL('image/jpeg', 0.65)"
);

fs.writeFileSync('reportes.js', js);
console.log('Successfully updated image compression parameters to 800px and 65% quality.');
