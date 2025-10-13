"use client";
import { PROCESS_STATUS } from "@/app/constants";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { InvoiceProcessingTable } from "@/components/common/invoice-processing-table";
import { RowCell } from "@/components/invoice-ui/data-table";
import { PageContainers } from "@/components/invoice-ui/page-containers";
import { ProcessStatusBadge } from "@/components/invoice-ui/process-status-badge";
import { DataItem } from "@/components/invoice-ui/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSetBreadcrumbs } from "@/hooks/use-set-breadcrumbs";
import { humanizeDateTime } from "@/lib/utils";
import {
  useBatchDetails,
  useCancelBatch,
} from "@/services/hooks/useBatchProcessInvoice";
import { useParams } from "next/navigation";

export default function Page() {
  const { batchID } = useParams();

  useSetBreadcrumbs([
    { title: "Home", url: APP_ROUTES.DASHBOARD },
    { title: "Monitor Traces", url: APP_ROUTES.PROCESSING.TRACE },
    {
      title: "Batch",
      url: APP_ROUTES.PROCESSING.BATCH.replace("[batchID]", batchID),
    },
  ]);

  const { data: batchDetails, isLoading, refetch } = useBatchDetails(batchID);
  const { mutateAsync: cancelBatch, isPending: isCancelling } =
    useCancelBatch(batchID);

  return (
    <PageContainers>
      <Card>
        <CardContent>
          <div className="space-x-4 flex flex-col gap-4 md:flex-row items-center">
            <DataItem
              label="Batch No"
              value={
                <RowCell value={batchDetails?.batchNo} header="Batch No" />
              }
              allowCopy
              isLoading={isLoading}
            />

            <DataItem
              label="Created Date"
              value={<span>{humanizeDateTime(batchDetails?.createdDate)}</span>}
              isLoading={isLoading}
            />
            <DataItem
              label="Status"
              value={
                <ProcessStatusBadge
                  status={batchDetails?.status}
                  isLoading={isLoading}
                  scheduledTime={batchDetails?.triggerDateTime}
                />
              }
              isLoading={isLoading}
            />

            {PROCESS_STATUS.SCHEDULED === batchDetails?.status && (
              <div className="flex justify-end flex-1">
                <Button
                  variant="destructive"
                  type="button"
                  size="sm"
                  onClick={async () => {
                    await cancelBatch();
                    refetch();
                  }}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <span>Cancelling...</span>
                  ) : (
                    <span>Cancel</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <InvoiceProcessingTable
        data={batchDetails?.details || []}
        isLoading={isLoading}
      />
    </PageContainers>
  );
}
