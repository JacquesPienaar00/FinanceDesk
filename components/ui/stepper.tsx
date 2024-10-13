import React from 'react';

interface StepProps {
  label: string;
  isActive?: boolean;
  isCompleted?: boolean;
}

export const Step: React.FC<StepProps> = ({ label, isActive, isCompleted }) => {
  return (
    <div className={`flex items-center ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
      <div className={`flex items-center justify-center w-8 h-8 border-2 rounded-full ${
        isActive ? 'border-blue-600' : isCompleted ? 'border-green-500 bg-green-500' : 'border-gray-300'
      }`}>
        {isCompleted ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
            {label[0]}
          </span>
        )}
      </div>
      <span className="ml-2 text-sm font-medium">{label}</span>
    </div>
  );
};

interface StepperProps {
  activeStep: number;
  children: React.ReactElement<StepProps>[];
}

export const Stepper: React.FC<StepperProps> = ({ activeStep, children }) => {
  return (
    <div className="flex justify-between">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement<StepProps>(child)) {
          return React.cloneElement(child, {
            isActive: index === activeStep,
            isCompleted: index < activeStep,
          });
        }
        return child;
      })}
    </div>
  );
};