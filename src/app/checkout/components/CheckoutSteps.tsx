import React from 'react';

interface CheckoutStepsProps {
  steps: string[];
  currentStep: number;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li key={step} className={`relative ${index < steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              {index < steps.length - 1 && (
                <div 
                  className={`h-0.5 w-full ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}`} 
                />
              )}
            </div>
            <div 
              className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                index < currentStep 
                  ? 'bg-indigo-600' 
                  : index === currentStep 
                    ? 'border-2 border-indigo-600 bg-white' 
                    : 'border-2 border-gray-300 bg-white'
              }`}
            >
              {index < currentStep ? (
                <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path 
                    fillRule="evenodd" 
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                    clipRule="evenodd" 
                  />
                </svg>
              ) : (
                <span 
                  className={`h-2.5 w-2.5 rounded-full ${
                    index === currentStep ? 'bg-indigo-600' : 'bg-transparent'
                  }`} 
                  aria-hidden="true"
                />
              )}
            </div>
            <span 
              className={`absolute top-10 text-sm font-medium ${
                index <= currentStep ? 'text-indigo-600' : 'text-gray-500'
              }`}
            >
              {step}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default CheckoutSteps; 