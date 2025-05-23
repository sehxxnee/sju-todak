import React from 'react';

const AlertModal = ({ open, message, onClose }: { open: boolean; message: string; onClose: () => void }) => {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.18)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 32,
          minWidth: 240,
          boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '1.1rem', marginBottom: 18 }}>{message}</div>
        <button
          style={{
            background: '#FFD772',
            border: 'none',
            borderRadius: 8,
            padding: '10px 28px',
            fontWeight: 600,
            fontSize: '1.05rem',
            cursor: 'pointer',
            color: '#222',
          }}
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
