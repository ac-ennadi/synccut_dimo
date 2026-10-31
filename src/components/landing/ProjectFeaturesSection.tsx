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
    title: 'Clear requests for brand assets',
    description: 'Set a custom project alert that tells clients which logo or brand files the editor needs.',
  },
  {
    title: 'Private video playback',
    description: 'Private project videos are served with signed playback links that expire.',
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

        <div className="mt-12 grid gap-10 border-t border-[#d6d6d6] pt-8 sm:grid-cols-2 sm:gap-16">
          <section aria-labelledby="client-workspace-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#707070]">Client workspace</p>
            <h3 id="client-workspace-heading" className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">Review and respond.</h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#707070]">
              Open the latest cut, leave notes while it plays, follow the project alert, and approve the version when it’s ready.
            </p>
          </section>
          <section aria-labelledby="editor-workspace-heading" className="border-[#d6d6d6] sm:border-l sm:pl-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#707070]">Editor workspace</p>
            <h3 id="editor-workspace-heading" className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">Manage the project.</h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#707070]">
              Publish a new cut, update the project stage and script, and manage the people who can review it.
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
