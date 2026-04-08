import { notFound } from "next/navigation";
import { getFeature } from "@/lib/features/registry";
import { FeatureBody } from "@/components/features/feature-body";

type Props = { params: Promise<{ slug: string }> };

export default async function FeaturePage({ params }: Props) {
  const { slug } = await params;
  const feature = getFeature(slug);
  if (!feature) notFound();

  return (
    <div className="w-full space-y-2">
      <div className="terminal-panel">
        <div className="terminal-panel-header flex items-center justify-between gap-2">
          <span>{feature.group}</span>
          <span className="font-data text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
            polyterm {feature.cli}
          </span>
        </div>
        <div className="border-b border-border px-2 py-1.5">
          <h1 className="font-data text-sm font-semibold uppercase tracking-wide text-foreground">
            {feature.title}
          </h1>
          <p className="mt-0.5 font-data text-[11px] text-muted-foreground">{feature.description}</p>
        </div>
      </div>
      <FeatureBody feature={feature} />
    </div>
  );
}
