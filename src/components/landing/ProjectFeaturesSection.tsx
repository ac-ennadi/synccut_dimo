import { ScrollReveal } from './ScrollReveal';

const features = [
  {
    title: 'Script beside the cut',
    description: 'Keep the approved script, scene breakdown, and visual references with the project.',
  },
  {
    title: 'AI task suggestions from the script',
    description: 'Get a practical first pass for the edit, then add tasks, remove what does not fit, and track each scene’s progress.',
  },
  {
    title: 'Feedback with a clear status',
    description: 'Clients can leave timecoded notes. Editors can mark each one open, in progress, or resolved.',
  },
  {
    title: 'Current and previous cuts',
    description: 'Switch between the latest version and the cut before it while staying in the project workspace.',
  },
  {
    title: 'A final check before publishing',
    description: 'Work through checks for picture, sound, titles, and playback before sending a cut to the client.',
  },
  {
    title: 'Templates for the format',
    description: 'Start with a social short, brand film, or motion explainer. The template sets the video format and review checklist.',
  },
  {
    title: 'Final delivery in the same project',
    description: 'After approval, add delivery links and notes so clients know which files are ready and what to do next.',
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
        <ScrollReveal className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#707070]">What’s included</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#1d1d1f] sm:text-4xl">
            The edit, review, and handoff stay connected.
          </h2>
        </ScrollReveal>
        <dl className="mt-10 grid gap-x-16 sm:grid-cols-2">
          {features.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={(index % 5) * 55}>
              <div className="border-t border-[#d6d6d6] py-6">
                <dt className="text-lg font-semibold tracking-[-0.02em] text-[#1d1d1f]">{feature.title}</dt>
                <dd className="mt-2 max-w-lg text-sm leading-6 text-[#707070]">{feature.description}</dd>
              </div>
            </ScrollReveal>
          ))}
        </dl>

        <div className="mt-12 grid gap-10 border-t border-[#d6d6d6] pt-8 sm:grid-cols-2 sm:gap-16">
          <ScrollReveal>
            <section aria-labelledby="client-workspace-heading">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#707070]">Client workspace</p>
              <h3 id="client-workspace-heading" className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">Review and respond.</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#707070]">
                Watch the latest or previous cut, leave notes at a timecode, follow their status, and approve the version when it’s ready.
              </p>
            </section>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <section aria-labelledby="editor-workspace-heading" className="border-[#d6d6d6] sm:border-l sm:pl-10">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#707070]">Editor workspace</p>
              <h3 id="editor-workspace-heading" className="mt-3 text-xl font-semibold tracking-[-0.02em] text-[#1d1d1f]">Manage the project.</h3>
              <p className="mt-2 max-w-lg text-sm leading-6 text-[#707070]">
                Turn the script into editable tasks, run the publish checklist, and prepare approved files for delivery.
              </p>
            </section>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
