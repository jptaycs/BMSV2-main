import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import { ColumnDef } from "@tanstack/react-table";
import { Trash, Users, GraduationCap, Briefcase, HandHelping, Vote, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Youth } from "@/types/apitypes";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { useDeleteYouth } from "@/features/api/youth/useDeleteYouth";
import { useYouth } from "@/features/api/youth/useYouth";
import searchYouth from "@/service/youth/searchYouth";
import { youthSort } from "@/service/youth/youthSort";
import SummaryCardYouth from "@/components/summary-card/youth";
import AddYouthModal from "@/features/youth/addYouthModal";
import ViewYouthModal from "@/features/youth/viewYouthModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const filters = [
  "All Youth",
  "Alphabetical",
  "In School Youth",
  "Out of School Youth",
  "Working Youth",
  "Youth w/ Specific Needs",
  "SK Voters",
  "Child Youth (15-17 yrs old)",
  "Core Youth (18-24 yrs old)",
  "Young Adult (25-30 yrs old)",
];

const columns: ColumnDef<Youth>[] = [
  {
    header: "Full Name",
    cell: ({ row }) => {
      const y = row.original;
      const middle = y.Middlename || "";
      const fullName = `${y.Lastname}, ${y.Firstname} ${middle} ${y.Suffix || ""}`;
      return <div>{fullName}</div>;
    },
  },
  { header: "Gender", accessorKey: "Gender" },
  { header: "Zone", accessorKey: "Zone" },
  { header: "Email", accessorKey: "EmailAddress" },
  { header: "Contact", accessorKey: "ContactNumber" },
  { header: "Education", accessorKey: "EducationalBackground" },
  { header: "Work Status", accessorKey: "WorkStatus" },
];

export default function YouthPage() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYouth, setSelectedYouth] = useState<number[]>([]);
  const deleteMutation = useDeleteYouth();
  const { data: youthData } = useYouth();
  const queryClient = useQueryClient();
  const [viewYouthId, setViewYouthId] = useState<number | null>(null);

  // Download states
  const [pendingDownload, setPendingDownload] = useState<{
    filename: string;
    filter: string;
    filteredYouths: Youth[];
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [dialogSearch,] = useState("");

  // Filtered youths inside the dialog by dialogSearch
  const dialogFilteredYouths = useMemo(() => {
    if (!pendingDownload) return [];
    if (!dialogSearch.trim()) return pendingDownload.filteredYouths;
    const searchLower = dialogSearch.toLowerCase();
    return pendingDownload.filteredYouths.filter((y) => {
      const fullName = `${y.Lastname}, ${y.Firstname} ${y.Middlename ?? ""} ${y.Suffix ?? ""}`.toLowerCase();
      return fullName.includes(searchLower);
    });
  }, [pendingDownload, dialogSearch]);

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const filteredData = useMemo(() => {
    if (!youthData?.youths) return [];
    const sortValue = searchParams.get("sort") ?? "All Youth";
    let sorted = youthSort(youthData.youths, sortValue);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sorted = searchYouth(query, sorted);
    }

    return sorted ?? [];
  }, [searchParams, searchQuery, youthData]);

  const total = filteredData.length;
  const inSchool = filteredData.filter((r) => r.InSchoolYouth).length;
  const outOfSchool = filteredData.filter((r) => r.OutOfSchoolYouth).length;
  const working = filteredData.filter((r) => r.WorkingYouth).length;
  const withNeeds = filteredData.filter((r) => r.YouthWithSpecificNeeds).length;
  const skVoters = filteredData.filter((r) => r.IsSKVoter).length;

  const startDownload = async (filename: string, filter: string, filteredYouths: Youth[]) => {
    setIsDownloading(true);
    const toastId = toast.loading("Generating CSV, please wait...");
    try {
      const header = [
        "ID,Lastname,Firstname,Middlename,Suffix,Gender,Zone,Email,Contact,Education,WorkStatus,InSchoolYouth,OutOfSchoolYouth,WorkingYouth,YouthWithSpecificNeeds,IsSKVoter"
      ];

      const rows = filteredYouths.map((y) => [
        y.ID,
        y.Lastname,
        y.Firstname,
        y.Middlename ?? "",
        y.Suffix ?? "",
        y.Gender,
        y.Zone,
        y.EmailAddress,
        y.ContactNumber,
        y.EducationalBackground,
        y.WorkStatus,
        y.InSchoolYouth,
        y.OutOfSchoolYouth,
        y.WorkingYouth,
        y.YouthWithSpecificNeeds,
        y.IsSKVoter,
      ].join(","));

      const csvContent = [...header, ...rows].join("\n");
      const encoder = new TextEncoder();
      const contents = encoder.encode(csvContent);

      await writeFile(filename, contents, { baseDir: BaseDirectory.Document });

      toast.success(`${filter} CSV downloaded`, {
        description: "Saved in Documents folder",
        id: toastId,
      });
    } catch (e) {
      toast.error(`Failed to save ${filter} CSV`, { id: toastId });
    } finally {
      setIsDownloading(false);
      setPendingDownload(null);
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const confirmDownload = () => {
    if (!pendingDownload) return;
    const { filename, filter } = pendingDownload;
    setPendingDownload(null);
    startDownload(filename, filter, dialogFilteredYouths);
  };

  const cancelDownload = () => setPendingDownload(null);

  const prepareDownload = (filename: string, filter: string, filteredYouths: Youth[]) => {
    if (isDownloading) return;
    setPendingDownload({ filename, filter, filteredYouths });
  };

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardYouth
          title="Total Youth"
          value={total}
          icon={<Users size={50} />}
          onClick={() => prepareDownload("YouthRecords.csv", "All Youth", filteredData)}
        />
        <SummaryCardYouth
          title="In School"
          value={inSchool}
          icon={<GraduationCap size={50} />}
          onClick={() =>
            prepareDownload(
              "InSchoolYouth.csv",
              "In School Youth",
              filteredData.filter((r) => r.InSchoolYouth)
            )
          }
        />
        <SummaryCardYouth
          title="Out of School"
          value={outOfSchool}
          icon={<Users size={50} />}
          onClick={() =>
            prepareDownload(
              "OutOfSchoolYouth.csv",
              "Out of School Youth",
              filteredData.filter((r) => r.OutOfSchoolYouth)
            )
          }
        />
        <SummaryCardYouth
          title="Working Youth"
          value={working}
          icon={<Briefcase size={50} />}
          onClick={() =>
            prepareDownload(
              "WorkingYouth.csv",
              "Working Youth",
              filteredData.filter((r) => r.WorkingYouth)
            )
          }
        />
        <SummaryCardYouth
          title="With Specific Needs"
          value={withNeeds}
          icon={<HandHelping size={50} />}
          onClick={() =>
            prepareDownload(
              "YouthWithSpecificNeeds.csv",
              "Youth with Specific Needs",
              filteredData.filter((r) => r.YouthWithSpecificNeeds)
            )
          }
        />
        <SummaryCardYouth
          title="SK Voters"
          value={skVoters}
          icon={<Vote size={50} />}
          onClick={() =>
            prepareDownload(
              "SKVoters.csv",
              "SK Voters",
              filteredData.filter((r) => r.IsSKVoter)
            )
          }
        />
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar
          onChange={setSearchQuery}
          placeholder="Search Youth"
          classname="flex flex-5"
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Youth"
          classname="flex-1"
        />
        <Button
          variant="destructive"
          size="lg"
          disabled={Object.keys(rowSelection).length === 0 || isDownloading}
          onClick={() => {
            if (selectedYouth.length) {
              toast.promise(deleteMutation.mutateAsync(selectedYouth), {
                loading: "Deleting youth, please wait...",
                success: () => {
                  queryClient.invalidateQueries({ queryKey: ["youth"] });
                  setRowSelection({});
                  setSelectedYouth([]);
                  return { message: "Youth successfully deleted" };
                },
                error: (error: { error: string }) => ({
                  message: "Failed to delete youth",
                  description: error.error,
                }),
              });
            }
          }}
        >
          <Trash /> Delete Selected
        </Button>
        <AddYouthModal />
      </div>

      <DataTable<Youth>
        classname="py-5"
        height="43.3rem"
        data={filteredData}
        columns={[
          {
            id: "select",
            header: ({ table }) => (
              <Checkbox
                checked={
                  table.getIsAllPageRowsSelected()
                    ? true
                    : table.getIsSomePageRowsSelected()
                      ? "indeterminate"
                      : false
                }
                onCheckedChange={(value) => {
                  table.toggleAllPageRowsSelected(!!value);
                  if (value) {
                    const allVisible = table.getRowModel().rows.map((row) => row.original.ID);
                    setSelectedYouth(allVisible);
                  } else {
                    setSelectedYouth([]);
                  }
                }}
                aria-label="Select all"
                className="flex items-center justify-center"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => {
                  row.toggleSelected(!!value);
                  if (value) {
                    setSelectedYouth((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedYouth((prev) => prev.filter((id) => id !== row.original.ID));
                  }
                }}
                aria-label="Select row"
                className="flex items-center justify-center"
              />
            ),
          },
          ...columns,
          {
            id: "view",
            header: "",
            cell: ({ row }) => (
              <div className="flex gap-3">
                <Button onClick={() => setViewYouthId(row.original.ID)}>
                  <Eye /> View Youth
                </Button>
              </div>
            ),
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />

      {viewYouthId !== null && (
        <ViewYouthModal
          youth={youthData.youths.find((e) => e.ID === viewYouthId)}
          open={true}
          onClose={() => setViewYouthId(null)}
        />
      )}

      {pendingDownload && (
        <Dialog open={true} onOpenChange={cancelDownload}>
          <DialogContent className="max-h-[70vh] overflow-auto">
            <div className="mb-4">
            </div>
            <DialogHeader>
              <DialogTitle className="text-black">Confirm Download</DialogTitle>
              <DialogDescription>
                Are you sure you want to download the {pendingDownload.filter} CSV?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <DialogClose asChild>
                <Button variant="ghost" className="text-black" onClick={cancelDownload}>
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={confirmDownload} disabled={isDownloading}>
                {isDownloading ? "Downloading..." : "Confirm"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}