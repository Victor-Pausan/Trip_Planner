export default function Footer() {
  return (
    <footer className="relative bottom-0 left-0 right-0 w-full bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo + Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #4ade80 0%, #38bdf8 100%)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 2.5S18 2 16.5 3.5L13 7 4.8 5.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>
          </div>
          <span className="font-semibold text-gray-800 text-sm tracking-tight">Tripstoo</span>
        </div>

        {/* Tagline */}
        <p className="text-xs text-gray-400 tracking-wide">
          Plan · Track · Remember — every journey, beautifully organized.
        </p>

        {/* Copyright */}
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Tripstoo
        </p>
      </div>
    </footer>
  );
}