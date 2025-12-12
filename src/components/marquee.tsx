// Marquee banner component for the home page
// Displays scrolling text with key features/benefits

export function Marquee() {
  const items = [
    'Real Life Scenarios',
    'Natural Phrasal Verbs',
    'Internal Monologue',
    'Context-Based Learning',
    'Daily Audio',
  ]

  // Duplicate items for seamless loop
  const allItems = [...items, ...items]

  return (
    <div className="overflow-hidden border-y border-text-main bg-text-main py-4 text-bg">
      <div className="animate-marquee flex whitespace-nowrap">
        {allItems.map((item, index) => (
          <span key={index} className="mr-16 font-serif text-xl italic md:text-2xl">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
