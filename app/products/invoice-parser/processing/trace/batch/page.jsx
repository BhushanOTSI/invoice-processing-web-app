"use client";

import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { useState } from "react";
import {
  PageDescriptiveSection,
  PageSubdescription,
  PageTitle,
} from "@/components/invoice-ui/typography";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import { useBatches } from "@/services/hooks/useBatchProcessInvoice";
import { BatchProcessingTable } from "@/components/common/batch-processing-table";

export default function Page() {
  const [page, setPage] = useState(1);

  const { data: batches, isLoading } = useBatches({
    page: page,
    size: 10,
  });

  useSetBreadcrumbs([
    { title: "Home", url: APP_ROUTES.DASHBOARD },
    { title: "Monitor Batches", url: APP_ROUTES.PROCESSING.BATCH },
  ]);

  return (
    <PageContainers>
      <PageDescriptiveSection>
        <div className="flex justify-between items-center">
          <div>
            <PageTitle title="Monitor Batches" />
            <PageSubdescription subdescription="View all batch processing operations" />
          </div>
        </div>
      </PageDescriptiveSection>

      <BatchProcessingTable
        data={batches?.batches || []}
        isLoading={isLoading}
        page={batches?.page - 1}
        totalItems={batches?.total}
        pageSize={batches?.size}
        enablePagination
        onPageChange={(newPage) => {
          setPage(newPage + 1);
        }}
      />
    </PageContainers>
  );
}
