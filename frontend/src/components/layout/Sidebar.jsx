import { Link, useLocation } from 'react-router-dom';
import { 
  HiHome, 
  HiChartBar, 
  HiClipboardList, 
  HiCalendar, 
  HiCog, 
  HiUserGroup,
  HiChevronRight
} from 'react-icons/hi';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <HiChartBar className="w-5 h-5" /> },
    { name: 'Tasks', path: '/tasks', icon: <HiClipboardList className="w-5 h-5" /> },
    { name: 'Schedule', path: '/schedule', icon: <HiCalendar className="w-5 h-5" /> },
    { name: 'Assets', path: '/assets', icon: <HiCog className="w-5 h-5" /> },
    { name: 'Employees', path: '/employees', icon: <HiUserGroup className="w-5 h-5" /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 shadow-lg z-40">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-800">
        <Link to="/dashboard" className="inline-flex items-center gap-2 group">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-red-600 to-red-700 group-hover:from-red-700 group-hover:to-red-800 transition-colors">
            <span className="text-white font-bold text-sm">SI</span>
          </span>
          <span className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
            Smart<span className="font-normal text-gray-300">Industry</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/home" 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${location.pathname === '/home' ? 'bg-gray-800 text-white' : ''}`}
            >
              <HiHome className="w-5 h-5" />
              <span>Home</span>
            </Link>
          </li>
          
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${location.pathname === item.path ? 'bg-gray-800 text-white' : ''}`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                <HiChevronRight className="w-4 h-4 text-gray-500" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
        <Link
          to="/profile"
          className="flex items-center gap-3 group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center text-gray-300 font-medium">
              JD
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-900"></span>
          </div>
          <div>
            <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors">
              John Doe
            </p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}