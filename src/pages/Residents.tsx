import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddResidentModal from "@/features/residents/addResidentModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Trash, Users, UserCheck, UserMinus, Mars, Venus, User, Eye, Accessibility, } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { sort } from "@/service/resident/residentSort";
import searchResident from "@/service/resident/searchResident";
import SummaryCardResidents from "@/components/summary-card/residents";
import { useResident } from "@/features/api/resident/useResident";
import { useDeleteResident } from "@/features/api/resident/useDeleteResident";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import ViewResidentModal from "@/features/residents/viewResidentModal";
import { Resident } from "@/types/apitypes";
import { ResidentPDF } from "@/components/pdf/residentpdf";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

const filters = [
  "All Residents",
  "Alphabetical",
  "Moved Out",
  "Active",
  "Dead",
  "Missing",
];

const columns: ColumnDef<Resident>[] = [
  {
    header: "Full Name",
    cell: ({ row }) => {
      const r = row.original;
      const middleName = r.Middlename ? r.Middlename : "";
      const fullName = `${r.Lastname}, ${r.Firstname} ${middleName} ${r.Suffix || ""}`;
      return <div>{fullName}</div>;
    },
  },
  {
    header: "Civil Status",
    accessorKey: "CivilStatus",
  },
  {
    header: "Birthday",
    cell: ({ row }) => (
      <div>{format(new Date(row.original.Birthday), "MMMM do, yyyy")}</div>
    ),
  },
  {
    header: "Gender",
    accessorKey: "Gender",
  },
  {
    header: "Zone",
    accessorKey: "Zone",
  },
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.Status;
      let color =
        {
          "Moved Out": "#BD0000",
          Active: "#00BD29",
          Dead: "#000000",
          Missing: "#FFB30F",
        }[status] || "#000000";
      return <div style={{ color }}>{status}</div>;
    },
  },
];

export default function Residents() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResidents, setSelectedResidents] = useState<number[]>([]);
  const deleteMutation = useDeleteResident();
  const { data: residents } = useResident();
  const queryClient = useQueryClient();
  const [viewResidentId, setViewResidentId] = useState<number | null>(null);
  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const [total, setTotal] = useState(0);
  const filteredData = useMemo(() => {
    if (!residents) return [];
    const sortValue = searchParams.get("sort") ?? "All Residents";
    let sorted = sort(residents.residents, sortValue);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sorted = searchResident(query, sorted);
    }

    return sorted;
  }, [searchParams, searchQuery, residents]);

  useEffect(() => {
    setTotal(filteredData.length);
  }, [filteredData]);

  const res = residents?.residents || [];
  // const total = res.length;
  const active = res.filter((r) => r.Status === "Active").length;
  const movedOut = res.filter((r) => r.Status === "Moved Out").length;
  const male = res.filter((r) => r.Gender === "Male").length;
  const female = res.filter((r) => r.Gender === "Female").length;
  const senior = res.filter((r) => r.IsSenior).length;
  const SoloParent = res.filter((r) => r.IsSolo).length;
  const IsPWD = res.filter((r) => r.IsPWD).length;

  // Download loading state
  const [isDownloading, setIsDownloading] = useState(false);

  const [pendingDownload, setPendingDownload] = useState<{
    filename: string;
    filter: string;
    filteredResidents: Resident[];
  } | null>(null);

  // Generic download handler with toast loading, success, and error
  const handleDownloadPDF = async (
    filename: string,
    filter: string,
    filteredResidents: Resident[]
  ) => {
    setIsDownloading(true);
    const toastId = toast.loading("Generating PDF, please wait...");
    try {
      const casted: Resident[] = filteredResidents.map((r) => ({
        ...r,
        Birthday: typeof r.Birthday === "string" ? new Date(r.Birthday) : r.Birthday,
      }));
      const blob = await pdf(<ResidentPDF filter={filter} residents={casted} />).toBlob();
      const buffer = await blob.arrayBuffer();
      const contents = new Uint8Array(buffer);
      await writeFile(filename, contents, { baseDir: BaseDirectory.Document });
      toast.success(`${filter} PDF downloaded`, {
        description: "Saved in Documents folder",
        id: toastId,
      });
    } catch (e) {
      toast.error(`Failed to save ${filter} PDF`, {
        id: toastId,
      });
    } finally {
      setIsDownloading(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const handleDownloadAllResidents = () =>
    setPendingDownload({ filename: "ResidentRecords.pdf", filter: "All Residents", filteredResidents: res });

  const handleDownloadMaleResidents = () =>
    setPendingDownload({
      filename: "MaleResidents.pdf",
      filter: "Male Residents",
      filteredResidents: res.filter((r) => r.Gender === "Male"),
    });

  const handleDownloadFemaleResidents = () =>
    setPendingDownload({
      filename: "FemaleResidents.pdf",
      filter: "Female Residents",
      filteredResidents: res.filter((r) => r.Gender === "Female"),
    });

  const handleDownloadSeniorResidents = () =>
    setPendingDownload({
      filename: "SeniorResidents.pdf",
      filter: "Senior Residents",
      filteredResidents: res.filter((r) => r.IsSenior),
    });

  const handleDownloadPWDResidents = () =>
    setPendingDownload({
      filename: "PWDs.pdf",
      filter: "PWD",
      filteredResidents: res.filter((r) => r.IsPWD),
    });

  const handleDownloadSoloParents = () =>
    setPendingDownload({
      filename: "SoloParents.pdf",
      filter: "Solo Parents",
      filteredResidents: res.filter((r) => r.IsSolo),
    });

  const handleDownloadActiveResidents = () =>
    setPendingDownload({
      filename: "ActiveResidents.pdf",
      filter: "Active Residents",
      filteredResidents: res.filter((r) => r.Status === "Active"),
    });

  const handleDownloadMovedOutResidents = () =>
    setPendingDownload({
      filename: "MovedOutResidents.pdf",
      filter: "Moved Out Residents",
      filteredResidents: res.filter((r) => r.Status === "Moved Out"),
    });

  const confirmDownload = () => {
    if (!pendingDownload) return;
    const { filename, filter, filteredResidents } = pendingDownload;
    setPendingDownload(null);
    handleDownloadPDF(filename, filter, filteredResidents);
  };

  const cancelDownload = () => setPendingDownload(null);

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <div style={{ pointerEvents: isDownloading ? 'none' : 'auto', opacity: isDownloading ? 0.6 : 1 }}>
          <SummaryCardResidents
            title="Total Residents"
            value={total}
            icon={<Users size={50} />}
            onClick={handleDownloadAllResidents}
          />
        </div>
        <div style={{ pointerEvents: isDownloading ? 'none' : 'auto', opacity: isDownloading ? 0.6 : 1 }}>
          <SummaryCardResidents
            title="Male"
            value={male}
            icon={<Mars size={50} />}
            onClick={handleDownloadMaleResidents}
          />
        </div>
        <div style={{ pointerEvents: isDownloading ? 'none' : 'auto', opacity: isDownloading ? 0.6 : 1 }}>
          <SummaryCardResidents
            title="Female"
            value={female}
            icon={<Venus size={50} />}
            onClick={handleDownloadFemaleResidents}
          />
        </div>
        <div style={{ pointerEvents: isDownloading ? 'none' : 'auto', opacity: isDownloading ? 0.6 : 1 }}>
          <SummaryCardResidents
            title="Senior"
            value={senior}
            icon={<User size={50} />}
            onClick={handleDownloadSeniorResidents}
          />
        </div>
        <div style={{ pointerEvents: isDownloading ? 'none' : 'auto', opacity: isDownloading ? 0.6 : 1 }}>
          <SummaryCardResidents
            title="PWD"
            value={IsPWD}
            icon={<Accessibility size={50} />}
            onClick={handleDownloadPWDResidents}
          />
        </div>
        <div style={{ pointerEvents: isDownloading ? 'none' : 'auto', opacity: isDownloading ? 0.6 : 1 }}>
          <SummaryCardResidents
            title="Solo Parent"
            value={SoloParent}
            icon={<User size={50} />}
            onClick={handleDownloadSoloParents}
          />
        </div>
        <div style={{ pointerEvents: isDownloading ? 'none' : 'auto', opacity: isDownloading ? 0.6 : 1 }}>
          <SummaryCardResidents
            title="Active"
            value={active}
            icon={<UserCheck size={50} />}
            onClick={handleDownloadActiveResidents}
          />
        </div>
        <div style={{ pointerEvents: isDownloading ? 'none' : 'auto', opacity: isDownloading ? 0.6 : 1 }}>
          <SummaryCardResidents
            title="Moved Out"
            value={movedOut}
            icon={<UserMinus size={50} />}
            onClick={handleDownloadMovedOutResidents}
          />
        </div>
      </div>

      <div className="flex gap-5 w-full items-center justify-center">
        <Searchbar
          onChange={(value) => setSearchQuery(value)}
          placeholder="Search Resident"
          classname="flex flex-5"
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Residents"
          classname="flex-1"
        />
        <Button
          variant="destructive"
          size="lg"
          disabled={Object.keys(rowSelection).length === 0}
          onClick={() => {
            if (selectedResidents) {
              toast.promise(deleteMutation.mutateAsync(selectedResidents), {
                loading: "Deleting residents, Please wait...",
                success: () => {
                  queryClient.invalidateQueries({ queryKey: ["residents"] });
                  setRowSelection((prevSelection) => {
                    const newSelection = { ...prevSelection };
                    selectedResidents.forEach((_, i) => {
                      delete newSelection[i];
                    });
                    return newSelection;
                  });
                  setSelectedResidents([]);
                  return {
                    message: "Resident successfully deleted",
                  };
                },
                error: (error: { error: string }) => {
                  return {
                    message: "Failed to delete residents",
                    description: error.error,
                  };
                },
              });
            }
          }}
        >
          <Trash /> Delete Selected
        </Button>
        <AddResidentModal />
      </div>
      <DataTable<Resident>
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
                    const allVisibileRows = table
                      .getRowModel()
                      .rows.map((row) => row.original.ID);
                    setSelectedResidents(allVisibileRows);
                  } else {
                    setSelectedResidents([]);
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
                    setSelectedResidents((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedResidents((prev) =>
                      prev.filter((res) => res !== row.original.ID)
                    );
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
                <Button onClick={() => setViewResidentId(row.original.ID)}>
                  <Eye /> View Resident
                </Button>
              </div>
            ),
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      />
      {viewResidentId !== null && (
        <ViewResidentModal
          resident={residents.residents.find((e) => e.ID === viewResidentId)}
          open={true}
          onClose={() => setViewResidentId(null)}
        />
      )}
      {pendingDownload && (
        <Dialog open={true} onOpenChange={cancelDownload}>
          <DialogContent>
            <DialogHeader>
             <DialogTitle className="text-black">Confirm Download</DialogTitle>
              <DialogDescription>
                Are you sure you want to download the {pendingDownload.filter} PDF?
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
