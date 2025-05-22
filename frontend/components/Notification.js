// frontend/components/Notification.js
const Notification = ({ notification }) => {
  if (!notification) return null;

  return React.createElement('div', {
    className: `fixed top-6 right-6 z-50 p-6 rounded-2xl shadow-2xl border-l-4 ${
      notification.type === 'success' 
        ? 'bg-green-900/90 border-green-400 text-green-100 backdrop-blur-sm' 
        : 'bg-red-900/90 border-red-400 text-red-100 backdrop-blur-sm'
    } transform transition-all duration-300 animate-pulse min-w-[320px]`
  },
    React.createElement('div', {
      className: 'flex items-center space-x-4'
    },
      React.createElement('span', {
        className: 'text-2xl'
      }, notification.type === 'success' ? '✅' : '❌'),
      React.createElement('span', {
        className: 'font-semibold text-lg'
      }, notification.message)
    )
  );
};
