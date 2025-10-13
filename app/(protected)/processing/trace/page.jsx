"use client";

import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { InvoiceTable } from "@/components/common/invoice-table";
import { useState } from "react";
import {
  PageDescriptiveSection,
  PageSubdescription,
  PageTitle,
} from "@/components/invoice-ui/typography";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import { Card } from "@/components/ui/card";
import { useTraces } from "@/services/hooks/useBatchProcessInvoice";
import { InvoiceProcessingTable } from "@/components/common/invoice-processing-table";

export default function Page() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const { data: traces, isLoading } = useTraces({
    page: page,
    ...filters,
  });

  useSetBreadcrumbs([
    { title: "Home", url: APP_ROUTES.DASHBOARD },
    { title: "Monitor Traces", url: APP_ROUTES.PROCESSING.TRACE },
  ]);

  return (
    <PageContainers>
      <PageDescriptiveSection>
        <PageTitle title="Monitor Traces" />
        <PageSubdescription subdescription="View all processing traces" />
      </PageDescriptiveSection>

      <Card className="p-0">
        <InvoiceProcessingTable
          data={traces?.details || []}
          isLoading={isLoading}
          page={traces?.page - 1}
          totalItems={traces?.total}
          pageSize={traces?.size}
          enablePagination
          onPageChange={(newPage) => {
            setPage(newPage + 1);
          }}
          showBatchId
        />
      </Card>
    </PageContainers>
  );
}
