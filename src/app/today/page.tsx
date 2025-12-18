export const metadata = {
  title: "Today's Scenario",
}

export default function TodayPage () {
  return (
    <div className="py-20">
      <div className="border-b border-text-main pb-14">
        <div className="text-xs font-medium uppercase tracking-widest text-text-muted">
          Home / Today
        </div>
        <h1 className="mt-4 font-serif text-5xl text-text-main">Today&apos;s Scenario</h1>
        <p className="mt-5 max-w-xl text-lg text-text-muted">
          A daily pick that rotates through all scenarios.
        </p>
      </div>

      <div className="py-16">
        <p className="text-text-muted">
          The selection algorithm will be implemented later.
        </p>
      </div>
    </div>
  )
}
