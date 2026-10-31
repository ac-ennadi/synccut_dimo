'use client';

import React from 'react';
import { Deliverable } from '@/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ActionAlertProps {
  deliverable: Deliverable;
}

export const ActionAlert: React.FC<ActionAlertProps> = ({
  deliverable,
}) => {
  if (deliverable?.action_required_by !== 'Client') {
    return (
      <p className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-sm text-neutral-600" role="status">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        {deliverable.action_banner_text || 'No action required right now. The editor is actively working on the cut.'}
      </p>
    );
  }

  return (
    <section className="flex items-start gap-2.5 border-b border-amber-200 pb-3 text-sm" role="status">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
      <p className="font-medium text-neutral-800">
        {deliverable.action_banner_text || 'Action required from the client.'}
      </p>
    </section>
  );
};
