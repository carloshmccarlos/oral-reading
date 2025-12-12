export const metadata = {
  title: 'About | Read Oral English',
}

export default function AboutPage () {
  return (
    <div className="py-20">
      <div className="text-center">
        <div className="text-xs font-medium uppercase tracking-widest text-text-muted">
          Our Mission
        </div>
        <h1 className="mt-6 font-serif text-5xl text-text-main">
          Bridging the gap between &quot;Textbook English&quot; and Real Life.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-text-muted">
          We believe you shouldn&apos;t learn vocabulary in a void. You should steal it from the context where it naturally lives.
        </p>
      </div>

      <div className="mx-auto mt-20 max-w-3xl border-t border-border pt-14">
        <h2 className="font-serif text-3xl text-text-main">How to use this site</h2>
        <p className="mt-4 text-text-muted">
          Read short, realistic narratives. Tap highlighted phrases to see meanings and (optionally) Chinese translations.
        </p>
      </div>
    </div>
  )
}
