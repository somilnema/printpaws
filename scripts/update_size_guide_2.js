const fs = require('fs');
const path = require('path');

const productInfoPath = path.join(__dirname, '../src/components/ProductInfo.tsx');
let content = fs.readFileSync(productInfoPath, 'utf8');

// The Size Guide Modal logic
const sizeGuideModalHTML = `
      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
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

if (!content.includes('Size Guide Modal')) {
  content = content.replace(/\{\/\* Premium Glassmorphic Razorpay Sandbox Modal \*\/\}/, sizeGuideModalHTML + "\n      {/* Premium Glassmorphic Razorpay Sandbox Modal */}");
  fs.writeFileSync(productInfoPath, content);
  console.log('ProductInfo updated successfully');
} else {
  console.log('Size guide modal already exists.');
}
