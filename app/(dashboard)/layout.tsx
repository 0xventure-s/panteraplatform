import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  return ( 
    <div className="min-h-full bg-background">
      <div className="fixed inset-y-0 z-50 h-[76px] w-full md:pl-64">
        <Navbar />
      </div>
      <div className="fixed inset-y-0 z-50 hidden h-full w-64 flex-col md:flex">
        <Sidebar />
      </div>
      <main className="min-h-full pt-[76px] md:pl-64">
        {children}
      </main>
    </div>
   );
}
 
export default DashboardLayout;
