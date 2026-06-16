export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-spotify-base py-8 sm:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:gap-6 sm:px-6 md:flex-row md:px-10 md:text-left">
        <p className="text-xs text-spotify-subdued sm:text-sm">
          © {new Date().getFullYear()} HitLab AI. Predicting tomorrow&apos;s hits
          today.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-spotify-subdued sm:gap-8 sm:text-sm">
          <span className="cursor-pointer transition-colors hover:text-white">
            Privacy
          </span>
          <span className="cursor-pointer transition-colors hover:text-white">
            Terms
          </span>
          <span className="cursor-pointer transition-colors hover:text-white">
            Contact
          </span>
        </div>
      </div>
    </footer>
  );
}
