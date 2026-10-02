'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

interface Step {
  title: string
  detail: string
}

/**
 * An interactive step sequence (the 3-D Secure flow): one step at a time with Previous and Next, and every step
 * listed so it can be jumped to. The current step is announced to screen readers.
 */
export function StepFlow({ steps, className }: { steps: Step[]; className?: string }) {
  const [index, setIndex] = useState(0)
  const step = steps[index]!

  return (
    <section aria-label="Step by step" className={cn('rounded-lg border border-rule p-4', className)}>
      <ol className="flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              aria-current={i === index ? 'step' : undefined}
              className={cn('inline-flex min-h-11 items-center gap-2 rounded-full border border-rule px-3 text-sm', i === index && 'bg-foreground text-background', i < index && 'text-muted')}
            >
              <span aria-hidden="true">{i + 1}</span>
              <span>{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div aria-live="polite" className="mt-6">
        <p className="text-sm text-muted">
          Step {index + 1} of {steps.length}
        </p>
        <h2 className="mt-1 text-xl font-semibold">{step.title}</h2>
        <p className="mt-2">{step.detail}</p>
      </div>
      <div className="mt-6 flex gap-2">
        <button type="button" onClick={() => setIndex(index - 1)} disabled={index === 0} className="min-h-11 rounded-md border border-rule px-4 disabled:opacity-40">
          Previous
        </button>
        <button
          type="button"
          onClick={() => setIndex(index + 1)}
          disabled={index === steps.length - 1}
          className="min-h-11 rounded-md bg-foreground px-4 text-background disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </section>
  )
}
