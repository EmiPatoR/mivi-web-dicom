// frontend/components/FormInput.js
const FormInput = ({ label, type = 'text', name, value, onChange, required = false, placeholder = '', options = null, icon = '' }) => {
  // Fast transition classes - reduced from 300ms to 150ms
  const inputClasses = 'w-full px-4 py-4 bg-slate-700 border-2 border-slate-600 text-slate-100 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-slate-600 transition-all duration-150 placeholder-slate-400 text-base font-medium hover:border-slate-500 hover:bg-slate-650';
  
  let inputElement;
  if (type === 'select' && options) {
    inputElement = React.createElement('select', {
      name,
      value,
      onChange,
      required,
      className: inputClasses + ' cursor-pointer bg-select-arrow'
    }, ...options.map(option => 
      React.createElement('option', { 
        key: option.value, 
        value: option.value,
        className: 'bg-slate-700 text-slate-100'
      }, option.label)
    ));
  } else {
    inputElement = React.createElement('input', {
      type,
      name,
      value,
      onChange,
      required,
      placeholder,
      className: inputClasses
    });
  }

  return React.createElement('div', {
    className: 'space-y-3'
  },
    React.createElement('label', {
      className: 'block text-base font-semibold text-slate-200 flex items-center space-x-2'
    },
      React.createElement('span', {}, `${icon} ${label}`),
      required && React.createElement('span', { className: 'text-red-400 ml-1' }, '*')
    ),
    inputElement
  );
};
