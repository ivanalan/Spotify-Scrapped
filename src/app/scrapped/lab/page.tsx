import { ApiMetricsLab } from "@/components/scrapped/ApiMetricsLab";
import { loadScrappedApiLab } from "@/lib/load-scrapped-api-lab";

export const dynamic = "force-dynamic";

export default async function ScrappedLabPage() {
  const result = await loadScrappedApiLab();
  return <ApiMetricsLab {...result} />;
}
