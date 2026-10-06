export function PathMascot() {
  return (
    <div className="pointer-events-none absolute right-4 top-24 hidden animate-bounce-in lg:block">
      <div className="relative">
        <div className="rounded-3xl bg-white px-4 py-2 text-sm font-extrabold text-duo-feather shadow-lg">
          Keep your streak alive!
        </div>
        <p className="mt-4 text-7xl drop-shadow-lg" aria-hidden>
          🦉
        </p>
      </div>
    </div>
  );
}
