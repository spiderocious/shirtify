import { AppButton, DrawerService } from '@shirtify/ui';
import { Show } from '@shirtify/ui/flow';
import { useState } from 'react';

import { toApiError } from '@shared/api/api-error.ts';

import { useSubmitDesign } from '../../api/use-submit-design.ts';
import { useDesign } from '../../providers/design-provider.tsx';
import { CanvasStage } from './canvas-stage.tsx';
import { DesignTopbar } from './design-topbar.tsx';
import { DesignToolbar } from './design-toolbar.tsx';
import { SubmitConfirmation } from './submit-confirmation.tsx';
import { ToolPanel, type ToolId } from './tool-panel.tsx';

/** The full editor: chrome + canvas + tools, plus the submit → confirmation flow. */
export function DesignEditor() {
  const { token, context } = useDesign();
  const submit = useSubmitDesign();
  const [tool, setTool] = useState<ToolId>(null);
  const [submitted, setSubmitted] = useState(false);

  const brandName = context.brand.business_name;

  const doSubmit = () => {
    DrawerService.confirm(`Send this design to ${brandName}?`, {
      description: "Once you send it, you won't be able to make more changes.",
      confirmLabel: 'Send design',
      onConfirm: async () => {
        try {
          await submit.mutateAsync({ token, body: {} });
          setSubmitted(true);
        } catch (err) {
          const apiError = await toApiError(err);
          DrawerService.toast(apiError.message, { tone: 'warn' });
        }
      },
    });
  };

  return (
    <Show when={!submitted} fallback={<SubmitConfirmation brandName={brandName} />}>
      <div className="flex min-h-dvh flex-col bg-paper">
        <DesignTopbar />

        <div className="flex flex-1 flex-col lg:flex-row">
          <div className="flex-1">
            <CanvasStage />
          </div>
          <aside className="w-full shrink-0 overflow-y-auto border-t-3 border-ink bg-paper-warm p-4 lg:w-[340px] lg:border-l-3 lg:border-t-0">
            <ToolPanel tool={tool} />
          </aside>
        </div>

        <div className="sticky bottom-0 p-3">
          <div className="mx-auto max-w-3xl">
            <Show when={submit.isPending}>
              <AppButton variant="primary" block loading className="mb-2">
                Sending…
              </AppButton>
            </Show>
            <DesignToolbar tool={tool} onToolChange={setTool} onDone={doSubmit} />
          </div>
        </div>
      </div>
    </Show>
  );
}
