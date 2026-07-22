import { Toaster } from 'react-hot-toast';

export default function ToastConfig() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '12px',
          background: '#1F2937',
          color: '#F9FAFB',
          fontSize: '14px',
          border: '1px solid #1E293B',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        },
        success: {
          iconTheme: { primary: '#10B981', secondary: '#1F2937' },
        },
        error: {
          iconTheme: { primary: '#EF4444', secondary: '#1F2937' },
        },
      }}
    />
  );
}
