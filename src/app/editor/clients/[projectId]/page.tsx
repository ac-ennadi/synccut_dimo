import EditorClientWorkspace from './EditorClientWorkspace';

interface EditorClientPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function EditorClientPage({ params }: EditorClientPageProps) {
  const { projectId } = await params;
  return <EditorClientWorkspace projectId={projectId} />;
}
