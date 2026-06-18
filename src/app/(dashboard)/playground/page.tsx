"use client";

import { ModelConfigCard } from "./_components/ModelConfigCard";
import { PlaygroundHero } from "./_components/PlaygroundHero";
import { RecentTestsCard } from "./_components/RecentTestsCard";
import { ResponseCard } from "./_components/ResponseCard";
import { WinnerBadge } from "./_components/WinnerBadge";
import { usePlayground } from "@/hooks/usePlayground";

export default function PlaygroundPage() {
  const playground = usePlayground();

  return (
    <div className="p-0 md:p-6 space-y-6">
      <PlaygroundHero
        sessionCost={playground.sessionCost}
        successRate={playground.successRate}
        templates={playground.templates}
        onSelectTemplate={playground.setPrompt}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <div className="h-full">
          <ModelConfigCard
            provider={playground.provider}
            setProvider={playground.setProvider}
            model={playground.model}
            setModel={playground.setModel}
            compareMode={playground.compareMode}
            setCompareMode={playground.setCompareMode}
            compareModel={playground.compareModel}
            setCompareModel={playground.setCompareModel}
            prompt={playground.prompt}
            setPrompt={playground.setPrompt}
            onSubmit={playground.onSubmit}
            canSubmit={playground.canSubmit}
            loading={playground.loading}
            compareLoading={playground.compareLoading}
          />
        </div>

        <div className="flex flex-col h-full">
          {playground.compareMode ? (
            <>
              <div className="space-y-4">
                <div className="space-y-4">
                  <ResponseCard
                    response={playground.resp}
                    loading={playground.loading}
                    modelName={playground.model}
                    onExport={playground.exportResults}
                    showExport={false}
                  />

                  <ResponseCard
                    response={playground.compareResp}
                    loading={playground.compareLoading}
                    modelName={playground.compareModel}
                    onExport={() => {}}
                    showExport={false}
                  />
                </div>

                {playground.resp?.ok && playground.compareResp?.ok && (
                  <WinnerBadge
                    resp1={playground.resp}
                    resp2={playground.compareResp}
                    model1={playground.model}
                    model2={playground.compareModel}
                  />
                )}
              </div>

              <div className="mt-6">
                <RecentTestsCard history={playground.history} />
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <ResponseCard
                response={playground.resp}
                loading={playground.loading}
                modelName={playground.model}
                onExport={playground.exportResults}
                showExport={true}
              />

              <RecentTestsCard history={playground.history} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}