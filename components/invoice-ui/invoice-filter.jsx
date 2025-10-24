"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { FilterIcon, RotateCcwIcon } from "lucide-react";
import { useFilter } from "@/app/providers/filter-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Calendar } from "../ui/calendar";
import { alwaysArray, formatDate, getDateRange } from "@/lib/utils";
import { PROCESS_STATUS } from "@/app/constants";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldLabel, FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { ButtonGroup } from "../ui/button-group";

export function InvoiceFilter() {
  const {
    open,
    setOpen,
    handleResetFilters,
    onApply,
    onClose,
    hasFilters,
    filterCount,
    activeTab,
    setActiveTab,
  } = useFilter();

  return (
    <ButtonGroup>
      {hasFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleResetFilters()}
        >
          <RotateCcwIcon className="size-4" />
          Reset
        </Button>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" size="sm">
            <FilterIcon className="size-4" />
            Filter {filterCount > 0 && `(${filterCount})`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={"w-auto p-0 transition-all"} align="end">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
            <div className="flex ">
              <div className="h-80">
                <TabsList className="flex flex-col gap-2 w-50 border-r justify-start [&_button]:w-full [&_button]:justify-start [&_button]:max-h-9 h-full rounded-none">
                  <TabsTrigger value="status">Process Status</TabsTrigger>
                  <TabsTrigger value="date-range">
                    Filter by Created Date's
                  </TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 h-80 overflow-auto relative  min-w-96 ">
                <TabsContent value="date-range">
                  <DateRangeFilter />
                </TabsContent>
                <TabsContent value="status">
                  <StatusFilter />
                </TabsContent>
                <TabsContent value="other">
                  <OtherFilter />
                </TabsContent>
              </div>
            </div>
          </Tabs>
          <div className="flex justify-end gap-2 p-3 border-t">
            <Button
              onClick={() => onClose()}
              variant="outline"
              size="sm"
              type="button"
            >
              Close
            </Button>

            <Button
              onClick={() => handleResetFilters()}
              variant="outline"
              size="sm"
              type="button"
            >
              Reset
            </Button>
            <Button
              onClick={() => onApply()}
              type="button"
              size="sm"
              variant="default"
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  );
}

export function DateRangeFilter() {
  const { handleSetFilters, filters } = useFilter();
  const handleDateRangeClick = (type) => {
    handleSetFilters(getDateRange(type));
  };

  return (
    <div className="flex justify-center items-start h-full">
      <div className="flex justify-between items-start p-3 flex-wrap flex-1">
        <div className="flex flex-col items-start justify-start gap-2">
          <Button
            variant="outline"
            size={"sm"}
            type="button"
            onClick={() => handleDateRangeClick("last-7-days")}
            className="w-full"
          >
            Last 7 days
          </Button>
          <Button
            variant="outline"
            size={"sm"}
            type="button"
            onClick={() => handleDateRangeClick("last-30-days")}
            className="w-full"
          >
            Last 30 days
          </Button>
          <Button
            variant="outline"
            size={"sm"}
            type="button"
            onClick={() => handleDateRangeClick("this-year")}
            className="w-full"
          >
            This Year
          </Button>
          <Button
            variant="outline"
            size={"sm"}
            type="button"
            onClick={() => handleDateRangeClick("this-month")}
            className="w-full"
          >
            This Month
          </Button>
          <Button
            variant="outline"
            size={"sm"}
            type="button"
            onClick={() => handleDateRangeClick("last-6-months")}
            className="w-full"
          >
            Last 6 months
          </Button>

          <Button
            variant="destructive"
            size={"sm"}
            type="button"
            onClick={() => handleSetFilters({ from: null, to: null })}
            className="w-full"
          >
            Clear
          </Button>
        </div>
      </div>
      <Calendar
        mode="range"
        selected={{
          from: filters.from,
          to: filters.to,
        }}
        onSelect={(selected) => {
          handleSetFilters({
            from: formatDate(selected.from),
            to: formatDate(selected.to),
          });
        }}
        captionLayout="dropdown"
        numberOfMonths={2}
      />
    </div>
  );
}

export function StatusFilter() {
  const { handleSetFilters, filters } = useFilter();
  let { status } = filters || {};

  let checkedStatus = alwaysArray(status);

  return (
    <div className="flex flex-col gap-3 text-sm p-4">
      {Object.keys(PROCESS_STATUS).map((status) => (
        <div className="flex items-center gap-3" key={status}>
          <Checkbox
            id={status}
            checked={checkedStatus.includes(PROCESS_STATUS[status])}
            onCheckedChange={(checked) => {
              handleSetFilters({
                status: checked
                  ? [...checkedStatus, PROCESS_STATUS[status]]
                  : checkedStatus.filter((s) => s !== PROCESS_STATUS[status]),
              });
            }}
          />
          <Label htmlFor={status} className="capitalize text-sm">
            {PROCESS_STATUS[status]}
          </Label>
        </div>
      ))}
    </div>
  );
}

export function OtherFilter() {
  const { handleSetFilters, filters } = useFilter();
  return (
    <div className="p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="batchNo">Batch No</FieldLabel>
          <Input
            id="batchNo"
            name="batchNo"
            placeholder="Batch No"
            required
            value={filters.batchNo || ""}
            onChange={(e) => handleSetFilters({ batchNo: e.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="filename">Filename</FieldLabel>
          <Input
            id="filename"
            name="filename"
            placeholder="Filename"
            multiple={true}
            required
            value={filters.filename || ""}
            onChange={(e) => handleSetFilters({ filename: e.target.value })}
          />
        </Field>
      </FieldGroup>
    </div>
  );
}
