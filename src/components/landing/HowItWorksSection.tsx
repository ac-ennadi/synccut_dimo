'use client';

const steps = [
  {
    number: '01',
    title: 'Set up the project',
    description: 'Add the brief, script, scene notes, and visual references your client needs.',
  },
  {
    number: '02',
    title: 'Share a cut',
    description: 'Post a version for review. The client can watch it beside the project context.',
  },
  {
    number: '03',
    title: 'Resolve feedback',
    description: 'Clients leave notes at the current timecode. Editors update the cut and track approval in the same project.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="landing-steps bg-[#f5f5f7] px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:gap-20">
        <div className="max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#707070]">How it works</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#1d1d1f] sm:text-4xl">
            From first brief to final approval.
          </h2>
        </div>
        <ol className="divide-y divide-[#d6d6d6] border-y border-[#d6d6d6]">
          {steps.map((step) => (
            <li key={step.number} className="grid gap-2 py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-4">
              <span className="pt-1 text-sm font-medium tabular-nums text-[#86868b]">{step.number}</span>
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f]">{step.title}</h3>
                <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#707070]">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
