"use client";

import { PROCESS_STATUS } from "@/app/constants";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { InvoiceProcessingTable } from "@/components/common/invoice-processing-table";
import { KpiCard } from "@/components/invoice-ui/kpi-card";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import {
  PageSubdescription,
  PageSubtitle,
} from "@/components/invoice-ui/typography";
import { PageDescriptiveSection } from "@/components/invoice-ui/typography";
import { Card } from "@/components/ui/card";
import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import { useDashboardStats } from "@/services/hooks/useDashboard";
import { useTraces } from "@/services/hooks/useBatchProcessInvoice";
import { Calculator, Clock10, FileText } from "lucide-react";
import { useMemo } from "react";
import { formatFractionalHoursAuto } from "@/lib/utils";

export default function Page() {
  useSetBreadcrumbs([{ title: "Dashboard", url: APP_ROUTES.DASHBOARD }]);
  const { data, isLoading } = useDashboardStats();
  const filters = useMemo(() => {
    return {
      page: 1,
      size: 10,
      sortBy: "startTime",
      sortDir: "desc",
      status: [
        PROCESS_STATUS.COMPLETED,
        PROCESS_STATUS.FAILED,
        PROCESS_STATUS.PROCESSING,
      ],
    };
  }, []);

  const { data: recentTraces, isLoading: isLoadingRecentTraces } =
    useTraces(filters);

  return (
    <PageContainers>
      <div className="grid auto-rows-min gap-8 md:grid-cols-3">
        <KpiCard
          isLoading={isLoading}
          title={data?.invoiceProcessing?.title}
          value={data?.invoiceProcessing?.count}
          description={data?.invoiceProcessing?.description}
          icon={<FileText />}
        />
        <KpiCard
          isLoading={isLoading}
          title={data?.aiWorkHours?.title}
          value={formatFractionalHoursAuto(
            data?.aiWorkHours?.count,
            data.aiWorkHours.unit
          )}
          description={data?.aiWorkHours?.description}
          icon={<Clock10 />}
        />
        <KpiCard
          isLoading={isLoading}
          title={data?.avgTimePerInvoice?.title}
          value={formatFractionalHoursAuto(
            data?.avgTimePerInvoice?.count,
            data.avgTimePerInvoice.unit
          )}
          description={data?.avgTimePerInvoice?.description}
          icon={<Calculator />}
        />
      </div>
      <div className="space-y-6">
        <PageDescriptiveSection>
          <PageSubtitle subtitle="Recent Traces" />
          <PageSubdescription subdescription="View all recent traces" />
        </PageDescriptiveSection>

        <Card className="p-0">
          <InvoiceProcessingTable
            data={recentTraces?.details || []}
            isLoading={isLoadingRecentTraces}
            enablePagination={false}
            showBatchId
          />
        </Card>
      </div>
    </PageContainers>
  );
}
