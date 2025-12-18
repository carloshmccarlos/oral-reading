export const metadata = {
  title: 'About',
  description: 'Learn how OR (Oral Reading) helps you improve spoken English by reading realistic stories and learning phrases in context.',
  alternates: { canonical: '/about' }
}

export default function AboutPage () {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-[1000px] px-6 pb-24 pt-28 text-center">
        <div className="text-xs font-medium uppercase tracking-widest text-text-muted">
          Our Mission
        </div>
        <h1 className="mx-auto mt-6 max-w-[800px] font-serif text-4xl leading-[1.05] text-text-main md:text-6xl">
          Bridging the gap between &quot;Textbook English&quot; and Real Life.
        </h1>
        <p className="mx-auto mt-6 max-w-[600px] text-lg text-text-muted">
          We believe you shouldn&apos;t learn vocabulary in a void. You should steal it from the context where it naturally lives.
        </p>
      </section>

      {/* The Problem (Dark Mode) */}
      <section className="bg-text-main py-24 text-white">
        <div className="mx-auto grid max-w-[1000px] gap-16 px-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="mb-8 font-serif text-3xl leading-snug text-accent">
              &quot;I studied English for 10 years, but I panic when I have to order a coffee.&quot;
            </div>
            <p className="mb-6 text-white/70">
              Does this sound familiar? Traditional education focuses on grammar rules and rigid dialogs that nobody actually uses.
            </p>
            <p className="text-white/70">
              When real life happens—when you lose your keys, miss a bus, or need to ask for a refund—the textbook dialogs don&apos;t help.
              You need the messy, casual, phrasal-verb-heavy English that native speakers use intuitively.
            </p>
          </div>

          <div className="border-l border-accent pl-8">
            <h3 className="mb-4 font-serif text-2xl">The Context Gap</h3>
            <p className="mb-8 text-white/90">
              <strong>Textbook:</strong> &quot;I am searching for my keys.&quot;<br />
              <span className="text-accent">Real Life:</span> &quot;I&apos;m <em>rummaging through</em> my bag trying to <em>dig them out</em>.&quot;
            </p>
            <p className="text-white/90">
              <strong>Textbook:</strong> &quot;Please wait a moment.&quot;<br />
              <span className="text-accent">Real Life:</span> &quot;Hang on a sec, let me just <em>grab</em> that.&quot;
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-[1000px] px-6 py-24">
        <div className="text-center text-xs uppercase tracking-widest text-text-muted">
          How to use this site
        </div>

        <h2 className="mt-10 text-center font-serif text-4xl text-text-main">
          Anatomy of a Story
        </h2>
        <p className="mx-auto mt-4 max-w-[600px] text-center text-text-muted">
          We write short, realistic narratives. Here is how we design them to help you learn.
        </p>

        {/* Visual Legend */}
        <div className="relative mx-auto mt-14 rounded-sm border border-border bg-white px-6 py-12 md:px-12">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bg px-4 font-serif italic text-text-muted">
            The Legend
          </div>

          <div className="font-body text-center text-2xl leading-relaxed text-text-main md:text-[1.75rem]">
            <span className="border-b border-dashed border-border text-text-muted italic">&quot;Where is it?&quot;</span>
            {' '}I muttered, as I{' '}
            <span className="rounded bg-accent px-1.5 py-0.5">patted down</span>
            {' '}my pockets.
          </div>

          <div className="mt-8 flex justify-center gap-10 md:gap-14">
            <div className="w-1/2 max-w-[260px] text-center">
              <div className="mx-auto h-8 w-px bg-border" />
              <div className="mt-2 text-xs uppercase tracking-widest text-text-muted">
                Internal Thought
              </div>
              <p className="mt-2 text-xs text-text-muted">
                What people think but don&apos;t say.
              </p>
            </div>

            <div className="w-1/2 max-w-[260px] text-center">
              <div className="mx-auto h-10 w-px bg-accent" />
              <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-text-main">
                The Highlight
              </div>
              <p className="mt-2 text-xs text-text-muted">
                Phrasal verbs & micro-actions.<br />
                Click for definition.
              </p>
            </div>
          </div>
        </div>

        {/* Highlight + translation behavior */}
        <div className="mx-auto mt-10 max-w-[760px] rounded-sm border border-border bg-white p-6">
          <h3 className="font-serif text-2xl text-text-main">Highlights & translations</h3>
          <p className="mt-3 text-text-muted">
            Inside each story, we highlight useful phrases (phrasal verbs, micro-actions, and casual chunks). Click a highlight to see a tooltip definition.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-text-muted">
            <li>
              <span className="font-semibold text-text-main">Highlights:</span>
              {' '}Tap highlighted phrases to see simple English meaning.
            </li>
            <li>
              <span className="font-semibold text-text-main">Chinese:</span>
              {' '}Use the translation toggle to show/hide Chinese inside tooltips and the phrase list.
            </li>
            <li>
              <span className="font-semibold text-text-main">Practice:</span>
              {' '}Read out loud, then shadow the narration by pausing and repeating.
            </li>
          </ul>
        </div>

        {/* Features Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="rounded-sm border border-border bg-white p-8">
            <div className="mb-4 text-3xl">🧠</div>
            <div className="mb-2 text-lg font-semibold text-text-main">Micro-Actions</div>
            <p className="text-sm text-text-muted">
              We focus on the small physical movements (zipping, tapping, tossing) that ground language in reality.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-white p-8">
            <div className="mb-4 text-3xl">💭</div>
            <div className="mb-2 text-lg font-semibold text-text-main">Inner Monologue</div>
            <p className="text-sm text-text-muted">
              Half of a conversation happens inside your head. We include thoughts so you learn how to express feelings.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-white p-8">
            <div className="mb-4 text-3xl">🔊</div>
            <div className="mb-2 text-lg font-semibold text-text-main">Audio Shadowing</div>
            <p className="text-sm text-text-muted">
              Every story can include narration. Listen, pause, and repeat to master the rhythm of the sentence.
            </p>
          </div>
        </div>
      </section>

      {/* Signature */}
      <section className="mx-auto max-w-[1000px] border-t border-border px-6 pb-24 pt-16 text-center">
        <div
          className="mx-auto mb-6 h-20 w-20 rounded-full bg-[#ddd]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='30' r='20' fill='%23ccc'/><path d='M20,90 Q50,40 80,90' fill='%23ccc'/></svg>\")",
            backgroundSize: 'cover'
          }}
        />
        <p className="mb-2 italic text-text-muted">Happy Reading,</p>
        <div className="font-serif text-4xl text-text-main" style={{ transform: 'rotate(-2deg)' }}>
          The Editor
        </div>

        <div className="mt-10">
          <a
            href="/scenarios"
            className="inline-flex items-center rounded-pill bg-text-main px-8 py-4 font-medium text-white transition-colors hover:bg-black"
          >
            Start Reading Now
          </a>
        </div>
      </section>
    </div>
  )
}
