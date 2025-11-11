"use client";

import {
  FileHiddenInput,
  FileInput,
  FileInputProvider,
  useFileInput,
} from "@/components/ui/file";
import { useEffect, useMemo, useState } from "react";
import { DataTable } from "../invoice-ui/data-table";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { humanizeFileSize } from "@/lib/utils";
import { Clock1Icon, PlayIcon, PlusIcon, XIcon } from "lucide-react";
import { ButtonGroup } from "../ui/button-group";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { CASE_TYPES } from "@/app/constants";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { addMinutes, isAfter, format, parseISO } from "date-fns";
import { useBatchProcessInvoice } from "@/services/hooks/useBatchProcessInvoice";
import { Spinner } from "../ui/spinner";
import { useRouter } from "next/navigation";
import { APP_ROUTES } from "@/app/constants/app-routes";
import { formatInTimeZone } from "date-fns-tz";
import { AlphaTag } from "@/components/alpha-tag";

export function FileProcessingForm() {
  return (
    <FileInputProvider maxFiles={10} accept="application/pdf">
      <FileProcessingFormContent />
    </FileInputProvider>
  );
}

export function FileProcessingFormContent() {
  const {
    files,
    handleDeleteFile,
    handleClearFiles,
    handleOpenFileInput,
    maxFiles,
  } = useFileInput();
  const [filesToProcess, setFilesToProcess] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const form = useForm({
    resolver: zodResolver(
      z
        .object({
          files: z.array(z.instanceof(File)).min(1, {
            message: "Files are required.",
          }),
          caseType: z.string().min(1, {
            message: "Case type is required.",
          }),
          useCache: z.boolean().optional(),
          trigger_type: z.enum(["now", "scheduled"]),
          trigger_datetime: z.string().optional(),
          human_in_loop: z.boolean().optional(),
        })
        .superRefine((data, ctx) => {
          if (data.trigger_type === "now") {
            return;
          }

          if (data.trigger_type === "scheduled" && !data.trigger_datetime) {
            ctx.addIssue({
              code: "invalid_type",
              message: "Schedule datetime is required.",
              path: ["trigger_datetime"],
            });
            return;
          }

          const selectedDate = new Date(data.trigger_datetime);
          const now = new Date();
          const tenMinutesFromNow = addMinutes(now, 10);

          if (!isAfter(selectedDate, tenMinutesFromNow)) {
            ctx.addIssue({
              code: "invalid_type",
              message:
                "Schedule datetime must be at least 10 minutes in the future.",
              path: ["trigger_datetime"],
            });
          }
        })
    ),
    defaultValues: {
      caseType: "case1",
      files: [],
      useCache: true,
      trigger_type: "now",
      trigger_datetime: "",
      human_in_loop: false,
    },
  });

  useEffect(() => {
    setFilesToProcess(
      files.map((file, index) => ({
        file,
        isSelected: false,
        caseType: form.getValues("caseType"),
        index,
      }))
    );

    form.setValue("files", files);
  }, [files]);

  const { mutateAsync: batchProcessInvoice, isPending } =
    useBatchProcessInvoice();

  const columns = useMemo(() => {
    return [
      {
        header: "File Name",
        accessorKey: "file.name",
      },
      {
        header: "File Size",
        accessorKey: "file.size",
        cell: ({ row }) => {
          return <span>{humanizeFileSize(row.original.file.size)}</span>;
        },
      },
      {
        header: "Case Type",
        accessorKey: "caseType",
        cell: ({ row }) => {
          return <span>{CASE_TYPES[row.original.caseType] || "N/A"}</span>;
        },
      },
      {
        header: "Action",
        accessorKey: "action",
        rowClassName: "w-10 text-center",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <Button
              size={"sm"}
              className={"size-6 cursor-pointer"}
              onClick={() => handleDeleteFile(row.index)}
              variant="destructive"
              type="button"
              disabled={isPending}
            >
              <XIcon className="size-4" />
            </Button>
          );
        },
      },
    ];
  }, [handleDeleteFile, isPending]);

  const watchTriggerType = form.watch("trigger_type");
  const watchCaseType = form.watch("caseType");

  useEffect(() => {
    if (watchTriggerType === "now") {
      form.setValue("trigger_datetime", "");
    }
  }, [watchTriggerType]);

  useEffect(() => {
    if (watchCaseType) {
      setFilesToProcess(
        filesToProcess.map((file) => ({
          ...file,
          caseType: watchCaseType,
        }))
      );
    }
  }, [watchCaseType]);

  const router = useRouter();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (d) => {
          const data = await batchProcessInvoice({
            ...d,
            useCache: d.useCache ? "True" : "False",
          });

          router.push(
            APP_ROUTES.getRoute(APP_ROUTES.PROCESSING.BATCH, {
              batchID: data.batchNo,
            })
          );
        })}
      >
        <FileHiddenInput />
        {files.length > 0 ? (
          <div className="space-y-4">
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-6 items-start justify-start">
                  <div>
                    <FormField
                      control={form.control}
                      name="caseType"
                      render={({ field }) => (
                        <FormItem className={"w-full overflow-hidden"}>
                          <FormLabel>Case Type</FormLabel>
                          <FormControl>
                            <CaseTypeSelect
                              {...field}
                              onValueChange={field.onChange}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="trigger_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trigger Type</FormLabel>
                        <FormControl>
                          <Select {...field} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select Trigger Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="now">Process Now</SelectItem>
                              <SelectItem value="scheduled">
                                Schedule Processing
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trigger_datetime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule Date & Time</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            {...field}
                            disabled={form.watch("trigger_type") === "now"}
                            value={
                              field.value
                                ? format(
                                    parseISO(field.value),
                                    "yyyy-MM-dd'T'HH:mm"
                                  )
                                : ""
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value) {
                                const localDate = new Date(value);
                                const tz =
                                  Intl.DateTimeFormat().resolvedOptions()
                                    .timeZone;

                                const isoString = formatInTimeZone(
                                  localDate,
                                  tz,
                                  "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
                                );

                                field.onChange(isoString);
                              } else {
                                field.onChange(value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-4">
                    <FormField
                      control={form.control}
                      name="human_in_loop"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Human in Loop
                            <AlphaTag />
                          </FormLabel>
                          <FormControl>
                            <Switch
                              {...field}
                              disabled={true}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="useCache"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Use Cache</FormLabel>
                          <FormControl>
                            <Switch
                              {...field}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className={"border-t"}>
                <Button size="lg" type="submit" disabled={isPending}>
                  {form.watch("trigger_type") === "now" ? (
                    isPending ? (
                      <>
                        Creating Invoice Process...
                        <Spinner />
                      </>
                    ) : (
                      <>
                        Start Process Now
                        <PlayIcon />
                      </>
                    )
                  ) : isPending ? (
                    <>
                      Scheduling Invoice Process...
                      <Spinner />
                    </>
                  ) : (
                    <>
                      Schedule Processing For Later
                      <Clock1Icon />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
            <Card className={"py-0 gap-0"}>
              <CardHeader className={"border-b px-6 py-4! items-center"}>
                <CardTitle>Files to Process</CardTitle>
                <CardDescription>
                  Maximum of {maxFiles} files can be processed at a time.
                </CardDescription>
                <CardAction>
                  <ButtonGroup>
                    <ButtonGroup>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => {
                          handleClearFiles();
                          setRowSelection({});
                          form.reset();
                        }}
                        disabled={isPending}
                      >
                        <XIcon />
                        Clear all
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleOpenFileInput}
                        type="button"
                        disabled={files.length >= maxFiles || isPending}
                      >
                        <PlusIcon />
                        Add More
                      </Button>
                    </ButtonGroup>
                  </ButtonGroup>
                </CardAction>
              </CardHeader>
              <CardContent className={"p-0"}>
                <DataTable
                  columns={columns}
                  data={filesToProcess}
                  enablePagination={false}
                  onRowSelectionChange={setRowSelection}
                  rowSelection={rowSelection}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <FileInput />
        )}
      </form>
    </Form>
  );
}

export function CaseTypeSelect(props) {
  return (
    <Select {...props}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Case Type" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CASE_TYPES).map(([key, value]) => (
          <SelectItem key={key} value={key}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
