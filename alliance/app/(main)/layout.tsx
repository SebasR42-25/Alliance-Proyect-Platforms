import Navbar from '@/components/layout/navbar';
import ToastContainer from '@/components/ui/toast-container';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-mint">
      <Navbar />
      <main className="pt-16">{children}</main>
      <ToastContainer />
    </div>
  );
}
