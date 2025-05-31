import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { theme, withOpacity, getGradient } from '@/lib/theme';

export default function MainBanner() {
  return (
    <div className="mb-16 relative">
      {/* Simple Background */}
      <div 
        className="absolute inset-0 rounded-3xl -z-10"
        style={{
          backgroundColor: withOpacity(theme.primary, 0.05)
        }}
      />
      
      <div className="pt-18">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left side - Text content */}
            <div className="text-left px-6 mb-16">
              <span 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4"
                style={{ 
                  backgroundColor: withOpacity(theme.primary, 0.1),
                  color: theme.primary
                }}
              >
                <ShoppingBag className="w-5 h-5" />
                The Best Online Grocery Store
              </span>
              <h1 className="text-5xl font-bold mb-6" style={{ color: theme.dark }}>
                Your One Stop Shop for Quality Groceries
              </h1>
              <p className="text-xl mb-8 leading-relaxed" style={{ color: theme.gray }}>
                From fresh produce to household essentials, everything you need delivered to your home.
              </p>
              <div className="flex gap-4">
                <button 
                  className="px-8 py-3 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{
                    background: getGradient('primary')
                  }}
                >
                  Shop Now
                </button>
                {/* <button 
                  className="px-8 py-3 border rounded-lg font-medium transition-all duration-200"
                  style={{ 
                    borderColor: theme.gray,
                    color: theme.dark,
                    backgroundColor: theme.white
                  }}
                >
                  Learn More
                </button> */}
              </div>
            </div>
            
            {/* Right side - Image */}
            <div className="hidden md:block relative h-[400px]">
              <div className="absolute bottom-0 w-full h-full">
                <Image
                  src="/images/grocery-banner.png"
                  alt="Fresh groceries"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add this at the end of the file
const styles = `
@keyframes gradient-x {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}