// frontend/components/LoadingScreen.js
const LoadingScreen = () => {
  return React.createElement('div', {
    className: 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center'
  }, 
    React.createElement('div', {
      className: 'text-center bg-slate-800/80 backdrop-blur-sm p-12 rounded-2xl shadow-2xl border border-slate-700/50'
    }, 
      React.createElement('div', {
        className: 'relative w-16 h-16 mx-auto mb-6'
      },
        React.createElement('div', {
          className: 'absolute inset-0 border-4 border-blue-500/30 rounded-full'
        }),
        React.createElement('div', {
          className: 'absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'
        })
      ),
      React.createElement('p', {
        className: 'text-slate-100 text-xl font-semibold mb-2'
      }, 'Loading MiVi Worklist Manager...'),
      React.createElement('p', {
        className: 'text-slate-400 text-sm'
      }, 'Medical Imaging Virtual Intelligence')
    )
  );
};
