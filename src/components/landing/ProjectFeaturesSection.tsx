const features = [
  {
    title: 'Script beside the cut',
    description: 'Keep the approved script, scene breakdown, and visual references with the project.',
  },
  {
    title: 'Feedback at the right moment',
    description: 'Add a note while watching. The current video time is attached to the feedback.',
  },
  {
    title: 'Cuts and approvals in one place',
    description: 'Publish a new version, see the review status, and record client approval in the project.',
  },
  {
    title: 'A handoff for brand assets',
    description: 'Clients can upload the logo files the editor needs, including SVG, EPS, AI, and PNG.',
  },
];

export function ProjectFeaturesSection() {
  return (
    <section id="features" className="bg-white px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#707070]">What’s included</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#1d1d1f] sm:text-4xl">
            The details stay with the project.
          </h2>
        </div>
        <dl className="mt-10 grid gap-x-16 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="border-t border-[#d6d6d6] py-6">
              <dt className="text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f]">{feature.title}</dt>
              <dd className="mt-2 max-w-lg text-sm leading-6 text-[#707070]">{feature.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
