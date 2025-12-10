export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-600">
        <p className="font-medium">
          © {new Date().getFullYear()} Evoria. All rights reserved.
        </p>

        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-slate-900">
            About
          </a>
          <a href="#" className="hover:text-slate-900">
            Services
          </a>
          <a href="#" className="hover:text-slate-900">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
