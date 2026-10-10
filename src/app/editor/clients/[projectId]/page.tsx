import EditorClientWorkspace from './EditorClientWorkspace';

export const instant = false;

interface EditorClientPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EditorClientPage({ params }: EditorClientPageProps) {
  const { projectId } = await params;
  return <EditorClientWorkspace projectId={projectId} />;
}
