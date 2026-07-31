import { useState, useCallback, useRef } from 'react';

function useAlert() {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const resolveRef = useRef(null);

  const alert = useCallback((msg) => {
    setMessage(msg);
    setIsOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleOk = () => {
    setIsOpen(false);
    resolveRef.current?.();
  };

  const AlertDialog = isOpen ? (
    <div className='confirm-overlay'>
      <div className='confirm-box'>
        <p className='confirm-message'>{message}</p>
        <div className='confirm-actions'>
          <button className='confirm-ok' onClick={handleOk}>
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { alert, AlertDialog };
}

export default useAlert;
