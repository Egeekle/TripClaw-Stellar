import React from 'react';

export default function OnboardingProgress({ step, label, totalSteps }) {
  return (
    <div className="flex flex-col gap-3 p-4 pt-8">
      <div className="flex gap-6 justify-between items-center">
        <p className="text-base font-medium leading-normal font-display">
          {label}
        </p>
        <span className="text-sm font-bold text-violet-500">Step {step} of {totalSteps}</span>
      </div>
      <div className="rounded-full bg-slate-200 dark:bg-slate-800 h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-500" 
          style={{ width: `${(step / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
