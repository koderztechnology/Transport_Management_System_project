import Sidebar from './Sidebar';
import TopNavBar from './TopNavBar';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-row h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar />
      
      {/* Main Content Area with Left Margin for Fixed Sidebar */}
      <div className="flex-1 lg:ml-60 ml-0 flex flex-col h-full overflow-hidden">
        <TopNavBar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
