'use client'
import React from 'react'

const Landing: React.FC = () => {
  return (
    <main className="min-h-screen w-full bg-neutral-50 text-zinc-900 overflow-hidden">
      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-amber-300/60 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">AI for Database Design</span>
          <h1 className="mt-6 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
            From prompt to perfect schema
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto">
            dbdiagram AI turns natural language or SQL into beautiful, connected ER diagrams in seconds.
          </p>
          {/* Clerk provides auth buttons elsewhere; keep space minimal here */}
        </div>

        {/* Background ERD preview with hover shadow */}
        <div className="mt-14 flex justify-center">
          <div className="group relative w-full max-w-4xl rounded-2xl border border-zinc-200 bg-white/70 backdrop-blur-sm shadow-sm transition-shadow duration-300 hover:shadow-xl">
            {/* soft overlay on hover */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl transition-colors duration-300 group-hover:bg-zinc-900/5" />

            {/* dotted background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_1px)] bg-[length:16px_16px] rounded-2xl" aria-hidden />

            {/* Diagram canvas */}
            <div className="relative p-8">
              <DiagramPreview />
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white/70">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-zinc-600">
          <p className="order-2 sm:order-1">Created by <span className="font-semibold">Neel</span></p>
          <div className="order-1 sm:order-2 flex items-center gap-4">
            <a
              href="https://github.com/Indroneel007"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-zinc-900 transition-colors"
              aria-label="GitHub"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M12 .5a11.5 11.5 0 0 0-3.64 22.43c.58.1.8-.25.8-.56v-2.01c-3.26.7-3.95-1.57-3.95-1.57-.53-1.35-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.79 1.2 1.79 1.2 1.04 1.79 2.74 1.27 3.41.97.1-.76.41-1.27.75-1.56-2.6-.3-5.34-1.3-5.34-5.8 0-1.28.46-2.33 1.2-3.15-.12-.3-.52-1.53.12-3.2 0 0 .98-.31 3.22 1.2a11.2 11.2 0 0 1 2.93-.39c.99 0 1.99.13 2.93.39 2.24-1.51 3.22-1.2 3.22-1.2.64 1.67.24 2.9.12 3.2.75.82 1.2 1.87 1.2 3.15 0 4.51-2.74 5.5-5.35 5.8.42.36.8 1.07.8 2.16v3.2c0 .31.21.67.81.56A11.5 11.5 0 0 0 12 .5Z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/indroneel-mukherjee-747247250/" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-zinc-900 transition-colors"
              aria-label="LinkedIn"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM0 8h5v16H0zM8 8h4.8v2.2h.07c.67-1.27 2.3-2.6 4.73-2.6 5.06 0 6 3.33 6 7.67V24h-5v-6.93c0-1.65-.03-3.77-2.3-3.77-2.3 0-2.65 1.8-2.65 3.65V24H8z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}

function Box({ title, items, className = "" }: { title: string; items: string[]; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white shadow-sm ${className}`}>
      <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50 text-sm font-semibold">{title}</div>
      <ul className="p-3 space-y-1 text-sm">
        {items.map((t) => (
          <li key={t} className="relative pl-3">
            <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-sky-400" />
            {t}
            <span className="absolute right-0 top-2 h-2 w-2 rounded-full bg-emerald-400" />
          </li>
        ))}
      </ul>
    </div>
  )
}

function DiagramPreview() {
  return (
    <div className="relative h-[420px] w-full">
      {/* Connections */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
        </defs>
        <path d="M260,150 C380,150 420,120 540,120" stroke="#94a3b8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
        <path d="M260,210 C380,210 420,220 540,240" stroke="#94a3b8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
        <path d="M800,210 C720,260 660,300 560,300" stroke="#94a3b8" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
      </svg>

      {/* Tables */}
      <div className="absolute left-6 top-6 w-60">
        <Box title="students" items={["id", "school_id", "first_name", "last_name", "email"]} />
      </div>
      <div className="absolute left-6 top-[200px] w-60">
        <Box title="teachers" items={["id", "school_id", "first_name", "email", "created_at"]} />
      </div>
      <div className="absolute left-[520px] top-10 w-60">
        <Box title="schools" items={["id", "name", "address", "created_at"]} />
      </div>
      <div className="absolute right-6 top-[140px] w-60">
        <Box title="teacher_student" items={["teacher_id", "student_id"]} />
      </div>
    </div>
  )
}

export default Landing