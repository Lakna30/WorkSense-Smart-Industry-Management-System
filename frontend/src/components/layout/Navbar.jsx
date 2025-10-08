import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 group"
          >
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-red-600 to-red-700 group-hover:from-red-700 group-hover:to-red-800 transition-colors">
              <span className="text-white font-bold text-sm">Ws</span>
            </span>
            <span className="text-lg font-bold text-white group-hover:text-red-400 transition-colors">
              Work<span className="font-normal text-gray-300">Sense</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { name: 'Home', path: '/home' },
              { name: 'Dashboard', path: '/dashboard' },
              { name: 'Tasks', path: '/tasks' },
              { name: 'Schedule', path: '/schedule' },
              { name: 'Assets', path: '/assets' },
              { name: 'Employees', path: '/employees' },
            ].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="relative px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors group"
              >
                {item.name}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-red-500 group-hover:w-4/5 group-hover:left-1/10 transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <button className="hidden md:inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <div className="hidden md:block h-6 w-px bg-gray-700"></div>
            
            <Link
              to="/profile"
              className="hidden md:flex items-center gap-2 group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center text-gray-300 font-medium">
                  JD
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-900"></span>
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-red-400 transition-colors">
                John D.
              </span>
            </Link>
            
            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (hidden by default) */}
      <div className="md:hidden hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900">
          {[
            { name: 'Home', path: '/home' },
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'Tasks', path: '/tasks' },
            { name: 'Schedule', path: '/schedule' },
            { name: 'Assets', path: '/assets' },
            { name: 'Employees', path: '/employees' },
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}