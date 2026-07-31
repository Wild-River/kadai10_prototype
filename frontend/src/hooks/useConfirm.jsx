import { useState, useCallback, useRef } from 'react';

function useConfirm() {
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const resolveRef = useRef(null);

  const confirm = useCallback((msg) => {
    setMessage(msg);
    setIsOpen(true);
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleOk = () => {
    setIsOpen(false);
    resolveRef.current?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolveRef.current?.(false);
  };

  const ConfirmDialog = isOpen ? (
    <div className='confirm-overlay'>
      <div className='confirm-box'>
        <p className='confirm-message'>{message}</p>
        <div className='confirm-actions'>
          <button className='confirm-cancel' onClick={handleCancel}>
            キャンセル
          </button>
          <button className='confirm-ok' onClick={handleOk}>
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmDialog };
}

export default useConfirm;
