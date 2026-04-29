const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const posts = [
  { id: 26, slug: 'how-to-tell-whether-your-lead-flashing-needs-replacing' },
  { id: 27, slug: 'signs-your-roof-needs-a-tune-up' },
  { id: 28, slug: 'preparing-your-roof-for-winter' },
  { id: 29, slug: 'ka-saprast-ka-jumta-pieslegumi-jamaina' },
  { id: 30, slug: 'pazimes-ka-jumtam-vajadzigs-tune-up' },
  { id: 31, slug: 'ka-sagatavot-jumtu-ziemai' },
  { id: 32, slug: 'jumta-suces-noversana' },
  { id: 33, slug: 'steidzams-jumta-remonts' },
  { id: 34, slug: 'sniega-tirisana-no-jumta' },
  { id: 35, slug: 'jumta-bojajumi-pets-vetras' },
  { id: 36, slug: 'plisusi-jumti-nopluzes' }
];

const blogImgDir = path.join(__dirname, 'public/images/blog');
if (!fs.existsSync(blogImgDir)) fs.mkdirSync(blogImgDir, { recursive: true });

(async () => {
  for (const p of posts) {
    const filename = path.join(blogImgDir, `${p.slug}.jpg`);
    if (fs.existsSync(filename)) {
      console.log(`⊘ Already exists: ${p.slug}.jpg`);
      continue;
    }
    try {
      // Create a 1200x600 placeholder image
      await sharp({
        create: {
          width: 1200,
          height: 600,
          channels: 3,
          background: { r: 52, g: 73, b: 94 }
        }
      })
      .jpeg({ quality: 80, progressive: true })
      .toFile(filename);
      
      console.log(`✓ Created ${p.slug}.jpg`);
    } catch (err) {
      console.error(`✗ Failed ${p.slug}.jpg:`, err.message);
    }
  }
})();
