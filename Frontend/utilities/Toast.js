import React, { useState, useEffect } from 'react';

const Toast = ({ message, type, duration = 30000 }) => {
  const classes = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white',
  };

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.message !== message));
      }, duration);

      setToasts((prevToasts) => [...prevToasts, { message, type, timer }]);
    }
  }, [message, type]);

  const handleClose = (toast) => {
    clearTimeout(toast.timer);
    setToasts((prevToasts) => prevToasts.filter((t) => t !== toast));
  };

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={`rounded-lg shadow-lg ${classes[toast.type]} flex items-center justify-between px-4 py-2`}
        >
          <p>{toast.message}</p>
          <button
            title="close"
            className="ml-4 p-1 bg-white rounded-lg hover:bg-white hover:rounded-full"
            onClick={() => handleClose(toast)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <path fill="none" d="M0 0h24v24H0V0z"/>
  <path fill="#ff5f5f" d="M19 6.41l-1.41-1.41L12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41l5.59 5.59 1.41-1.41L13.41 12z"/>
</svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast