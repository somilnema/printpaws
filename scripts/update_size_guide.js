const fs = require('fs');
const path = require('path');

const productInfoPath = path.join(__dirname, '../src/components/ProductInfo.tsx');
let content = fs.readFileSync(productInfoPath, 'utf8');

// 1. Remove the dispatchEvent calls
content = content.replace(/window\.dispatchEvent\(new CustomEvent\('sizeSelectionChanged', \{ detail: 'framed_size' \}\)\);/g, '');
content = content.replace(/window\.dispatchEvent\(new CustomEvent\('sizeSelectionChanged', \{ detail: 'canvas_size' \}\)\);/g, '');

// Clean up the empty brackets if it looks like:
// onClick={() => {
//   setSelectedSize('8"x10"');
//   
// }}
content = content.replace(/onClick=\{\(\) => \{\s*setSelectedSize\('([^']+)'\);\s*\}\}/g, "onClick={() => setSelectedSize('$1')}");

// 2. Add showSizeGuide state
content = content.replace(/const \[showSandboxModal, setShowSandboxModal\] = useState\(false\);/, "const [showSandboxModal, setShowSandboxModal] = useState(false);\n  const [showSizeGuide, setShowSizeGuide] = useState(false);");

// 3. Add "Size Guide" button next to "2. Choose Your Size"
const sizeGuideButtonHTML = `
                  <div className="flex items-center justify-between">
                    <label className="block text-base font-bold text-[#1a1a1b] font-inter">
                      2. Choose Your Size
                    </label>
                    <button onClick={() => setShowSizeGuide(true)} className="text-xs font-bold text-[#A87B62] underline underline-offset-2 hover:text-[#8a634e] transition-colors">
                      Size Guide
                    </button>
                  </div>`;
content = content.replace(/<label className="block text-base font-bold text-\[\#1a1a1b\] font-inter">\s*2\. Choose Your Size\s*<\/label>/, sizeGuideButtonHTML);

// 4. Add the Size Guide Modal at the end of the component (before the final closing div/section, let's just put it next to sandbox modal)
const sizeGuideModalHTML = `
      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#fafafa]">
                <h3 className="font-bold text-lg text-[#1a1a1b]">Size Guide ({portraitStyle === "framed" ? "Framed Portrait" : "Canvas Portrait"})</h3>
                <button
                  onClick={() => setShowSizeGuide(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-black transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 bg-gray-50 flex items-center justify-center">
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                  <Image
                    src={getCloudinaryUrl(portraitStyle === "framed" ? "4th Image (2).png" : "5th Image.png")}
                    alt="Size Guide"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
`;

content = content.replace(/\{\/\* 3D Sandbox Modal \*\/\}/, sizeGuideModalHTML + "\n      {/* 3D Sandbox Modal */}");

fs.writeFileSync(productInfoPath, content);
console.log('ProductInfo updated successfully');
