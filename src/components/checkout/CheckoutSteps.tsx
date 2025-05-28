interface CheckoutStepsProps {
  steps: string[];
  currentStep: number;
}

export default function CheckoutSteps({ steps, currentStep }: CheckoutStepsProps) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center">
        {steps.map((step, index) => (
          <li
            key={step}
            className={`relative ${
              index !== steps.length - 1 ? "pr-8 sm:pr-20" : ""
            }`}
          >
            {index < currentStep ? (
              // Completed step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-indigo-600" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600">
                  <svg
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="sr-only">{step}</span>
                </div>
              </>
            ) : index === currentStep ? (
              // Current step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-indigo-600 bg-white"
                  aria-current="step"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                  <span className="sr-only">{step}</span>
                </div>
              </>
            ) : (
              // Upcoming step
              <>
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                  <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                  <span className="sr-only">{step}</span>
                </div>
              </>
            )}
            <div className="absolute left-0 top-10 -ml-4 mt-0.5 w-32 text-center">
              <span className="text-sm font-medium text-gray-900">{step}</span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
} 