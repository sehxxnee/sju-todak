import React, { createContext, useContext, useState } from 'react';
import AlertModal from './components/AlertModal';
const AlertContext = createContext({
  show: (msg: string) => {},
});

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const show = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  };
  const close = () => setOpen(false);

  return (
    <AlertContext.Provider value={{ show }}>
      {children}
      <AlertModal open={open} message={message} onClose={close} />
    </AlertContext.Provider>
  );
};
