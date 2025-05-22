// frontend/components/ActionBar.js
const ActionBar = ({ patientCount, showForm, onToggleForm }) => {
  return React.createElement('div', {
    className: 'bg-slate-800/80 backdrop-blur-sm border-b border-slate-700/50 px-8 py-6'
  },
    React.createElement('div', {
      className: 'flex items-center justify-between max-w-7xl mx-auto'
    },
      React.createElement('div', {
        className: 'flex items-center space-x-6'
      },
        React.createElement('h2', {
          className: 'text-2xl font-bold text-slate-100'
        }, 'Patient Worklist'),
        React.createElement('div', {
          className: 'bg-blue-900/60 text-blue-200 px-4 py-2 rounded-full text-sm font-semibold border border-blue-700/50 backdrop-blur-sm'
        }, `${patientCount} patient${patientCount !== 1 ? 's' : ''}`)
      ),
      React.createElement('button', {
        onClick: onToggleForm,
        className: `${showForm 
          ? 'bg-slate-600/80 hover:bg-slate-600 border-slate-500' 
          : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border-emerald-500'
        } text-white px-8 py-4 rounded-xl font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 flex items-center space-x-3 border backdrop-blur-sm`
      },
        React.createElement('span', {
          className: 'text-xl'
        }, showForm ? '❌' : '➕'),
        React.createElement('span', {}, showForm ? 'Cancel' : 'New Patient')
      )
    )
  );
};
