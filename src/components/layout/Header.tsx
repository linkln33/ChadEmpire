import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-chad-dark/80 backdrop-blur-md sticky top-0 z-50 border-b border-chad-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold gradient-text">ChadEmpire</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/play" className="text-gray-300 hover:text-chad-primary transition-colors">
              Play
            </Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-chad-primary transition-colors">
              Leaderboard
            </Link>
            <Link href="/boosters" className="text-gray-300 hover:text-chad-primary transition-colors">
              Boosters
            </Link>
            <Link href="/lottery" className="text-gray-300 hover:text-chad-primary transition-colors">
              Lottery
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center">
            <button className="md:hidden text-gray-300 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
