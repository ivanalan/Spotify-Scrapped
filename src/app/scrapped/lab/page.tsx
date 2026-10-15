import { ApiMetricsLab } from "@/components/scrapped/ApiMetricsLab";
import { loadScrappedApiLab } from "@/lib/load-scrapped-api-lab";

export const dynamic = "force-dynamic";

export default async function ScrappedLabPage() {
  const result = await loadScrappedApiLab();
  // Never pass `stored` (full snapshot) into the client — doubles Flight payload
  // and has crashed the Lab page after refresh.
  if (result.kind === "ready") {
    const { stored: _stored, ...clientSafe } = result;
    return <ApiMetricsLab {...clientSafe} />;
  }
  return <ApiMetricsLab {...result} />;
}
