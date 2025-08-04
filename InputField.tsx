
import React from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, id, error, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`mb-4 ${containerClassName}`}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        className={`block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-kargo-teal focus:border-kargo-teal sm:text-sm text-gray-100 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default InputField;
