import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-row min-h-screen w-full bg-slate-50">
      <Sidebar />
      
      {/* Main Content Area with Left Margin for Fixed Sidebar */}
      <div className="flex-1 ml-60 flex flex-col overflow-y-auto">
        <TopNavBar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
