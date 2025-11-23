import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/ui/datatable";
import Filter from "@/components/ui/filter";
import Searchbar from "@/components/ui/searchbar";
import AddExpenseModal from "@/features/expense/addExpenseModal";
import ViewExpenseModal from "@/features/expense/viewExpenseModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {Trash, Banknote, Landmark, Layers, PiggyBank, DollarSign, Wallet, Salad, Shirt, Eye,} from "lucide-react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { writeFile, BaseDirectory } from "@tauri-apps/plugin-fs";
import { ExpensePDF } from "@/components/pdf/expensepdf";
import SummaryCardExpense from "@/components/summary-card/expense";
import { useSearchParams } from "react-router-dom";
import { sort } from "@/service/expense/expenseSort";
import searchExpense from "@/service/expense/searchExpense";
import { useExpense } from "@/features/api/expense/useExpense";
import { useDeleteExpense } from "@/features/api/expense/useDeleteExpense";
import { Expense } from "@/types/apitypes";
import FormsModal from "@/features/expense/formsModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

const filters = [
  "All Expense",
  "Numerical",
  "Date Issued",
  "This Month",
  "This Week",
];

const columns: ColumnDef<Expense>[] = [
  {
    header: "Type",
    accessorKey: "Type",
  },
  {
    header: "Category",
    accessorKey: "Category",
  },
  {
    header: "OR",
    accessorKey: "OR",
  },
  {
    header: "PaidTo",
    accessorKey: "PaidTo",
  },
  {
    header: "PaidBy",
    accessorKey: "PaidBy",
  },
  {
    header: "Amount",
    accessorKey: "Amount",
    cell: ({ row }) => (
      <div>{Intl.NumberFormat("en-US").format(row.original.Amount)}</div>
    ),
  },
  {
    header: "Date",
    accessorKey: "Date",
    cell: ({ row }) => (
      <div>{format(new Date(row.original.Date), "MMMM do, yyyy")}</div>
    ),
  },
];

export default function ExpenseNewPage() {
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<number[]>([]);
  const { data: expenseResponse } = useExpense();
  const { mutateAsync: deleteExpense } = useDeleteExpense();

  const expense = useMemo(() => {
    return expenseResponse?.expenses ?? [];
  }, [expenseResponse]);

  const handleSortChange = (sortValue: string) => {
    searchParams.set("sort", sortValue);
    setSearchParams(searchParams);
  };

  const handleSearch = (term: string) => {
    setSearchQuery(term);
  };

  const filteredData = useMemo(() => {
    const sorted = sort(expense, searchParams.get("sort") ?? "All Expense");
    if (searchQuery.trim()) {
      return searchExpense(searchQuery, sorted);
    }
    return sorted;
  }, [searchParams, expense, searchQuery]);
  const [viewExpenseId, setViewExpenseId] = useState<number | null>(null);
  const [confirmDownload, setConfirmDownload] = useState(false);
  const [downloadAction, setDownloadAction] = useState<null | (() => Promise<void>)>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const startDownload = async (callback: () => Promise<void>) => {
    setConfirmDownload(true);
    setDownloadAction(() => callback);
  };

  const handleConfirmDownload = async () => {
    if (!downloadAction) return;
    setIsDownloading(true);
    setConfirmDownload(false);

    try {
      await downloadAction();
      toast.success("PDF downloaded", {
        description: "Saved in Documents folder",
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-5 justify-around mb-5 mt-1">
        <SummaryCardExpense
          title="Total Expenditure"
          value={new Intl.NumberFormat("en-US").format(
            filteredData.reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<DollarSign size={50} />}
          onClick={() =>
            startDownload(async () => {
              const blob = await pdf(
                <ExpensePDF filter="All Expenses" expenses={filteredData} />
              ).toBlob();
              const buffer = await blob.arrayBuffer();
              await writeFile(
                "ExpenseRecords.pdf",
                new Uint8Array(buffer),
                { baseDir: BaseDirectory.Document }
              );
            })
          }
        />
        <SummaryCardExpense
          title="Infrastructure Expenses"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Infrastructure")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Landmark size={50} />}
          onClick={() =>
            startDownload(async () => {
              const filtered = filteredData.filter(
                (d) => d.Category === "Infrastructure"
              );
              const blob = await pdf(
                <ExpensePDF
                  filter="Infrastructure Expenses"
                  expenses={filtered}
                />
              ).toBlob();
              const buffer = await blob.arrayBuffer();
              await writeFile(
                "InfrastructureExpenses.pdf",
                new Uint8Array(buffer),
                { baseDir: BaseDirectory.Document }
              );
            })
          }
        />
        <SummaryCardExpense
          title="Honoraria"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Honoraria")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<PiggyBank size={50} />}
          onClick={() =>
            startDownload(async () => {
              const filtered = filteredData.filter(
                (d) => d.Category === "Honoraria"
              );
              const blob = await pdf(
                <ExpensePDF filter="Honoraria Expenses" expenses={filtered} />
              ).toBlob();
              const buffer = await blob.arrayBuffer();
              await writeFile(
                "HonorariaExpenses.pdf",
                new Uint8Array(buffer),
                { baseDir: BaseDirectory.Document }
              );
            })
          }
        />
        <SummaryCardExpense
          title="Utilities"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Utilities")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Wallet size={50} />}
          onClick={() =>
            startDownload(async () => {
              const filtered = filteredData.filter(
                (d) => d.Category === "Utilities"
              );
              const blob = await pdf(
                <ExpensePDF filter="Utilities Expenses" expenses={filtered} />
              ).toBlob();
              const buffer = await blob.arrayBuffer();
              await writeFile(
                "UtilitiesExpenses.pdf",
                new Uint8Array(buffer),
                { baseDir: BaseDirectory.Document }
              );
            })
          }
        />
        <SummaryCardExpense
          title="Local Funds Used"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Local Funds")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Banknote size={50} />}
          onClick={() =>
            startDownload(async () => {
              const filtered = filteredData.filter(
                (d) => d.Category === "Local Funds"
              );
              const blob = await pdf(
                <ExpensePDF filter="Local Funds Expenses" expenses={filtered} />
              ).toBlob();
              const buffer = await blob.arrayBuffer();
              await writeFile(
                "LocalFundsExpenses.pdf",
                new Uint8Array(buffer),
                { baseDir: BaseDirectory.Document }
              );
            })
          }
        />
        <SummaryCardExpense
          title="Foods"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Foods")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Salad size={50} />}
          onClick={() =>
            startDownload(async () => {
              const filtered = filteredData.filter((d) => d.Category === "Foods");
              const blob = await pdf(
                <ExpensePDF filter="Foods Expenses" expenses={filtered} />
              ).toBlob();
              const buffer = await blob.arrayBuffer();
              await writeFile(
                "FoodsExpenses.pdf",
                new Uint8Array(buffer),
                { baseDir: BaseDirectory.Document }
              );
            })
          }
        />
        <SummaryCardExpense
          title="IRA Used"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "IRA")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Layers size={50} />}
          onClick={() =>
            startDownload(async () => {
              const filtered = filteredData.filter((d) => d.Category === "IRA");
              const blob = await pdf(
                <ExpensePDF filter="IRA Expenses" expenses={filtered} />
              ).toBlob();
              const buffer = await blob.arrayBuffer();
              await writeFile("IRAExpenses.pdf", new Uint8Array(buffer), {
                baseDir: BaseDirectory.Document,
              });
            })
          }
        />
        <SummaryCardExpense
          title="Others"
          value={new Intl.NumberFormat("en-US").format(
            filteredData
              .filter((d) => d.Category === "Others")
              .reduce((acc, item) => acc + item.Amount, 0)
          )}
          icon={<Shirt size={50} />}
          onClick={() =>
            startDownload(async () => {
              const filtered = filteredData.filter(
                (d) => d.Category === "Others"
              );
              const blob = await pdf(
                <ExpensePDF filter="Other Expenses" expenses={filtered} />
              ).toBlob();
              const buffer = await blob.arrayBuffer();
              await writeFile(
                "OtherExpenses.pdf",
                new Uint8Array(buffer),
                { baseDir: BaseDirectory.Document }
              );
            })
          }
        />
      </div>

      <div className="flex gap-5 w-full items-center justify-center mb-4">
        <Searchbar
          placeholder="Search Expense"
          classname="flex flex-5"
          onChange={handleSearch}
        />
        <Filter
          onChange={handleSortChange}
          filters={filters}
          initial="All Expense"
          classname="flex-1"
        />
        <Button
          variant="destructive"
          size="lg"
          disabled={selectedExpense.length === 0}
          onClick={() => {
            if (selectedExpense.length > 0) {
              toast.promise(deleteExpense(selectedExpense), {
                loading: "Deleting selected expenses. Please wait",
                success: () => {
                  setSelectedExpense([]);
                  setRowSelection({});
                  return {
                    message: "Selected expenses deleted successfully",
                  };
                },
                error: () => {
                  return {
                    message: "Failed to delete selected expenses",
                  };
                },
              });
            }
          }}
        >
          <Trash />
          Delete Selected
        </Button>
        <FormsModal />
        <AddExpenseModal />
      </div>

      {/* Data Table */}
      <DataTable<Expense>
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
                    const allVisibleRows = table
                      .getRowModel()
                      .rows.map((row) => row.original.ID);
                    setSelectedExpense(allVisibleRows);
                  } else {
                    setSelectedExpense([]);
                  }
                }}
                aria-label="Select all"
                className="flex items-center justify-center"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={selectedExpense.includes(row.original.ID)}
                onCheckedChange={(value) => {
                  if (value) {
                    setSelectedExpense((prev) => [...prev, row.original.ID]);
                  } else {
                    setSelectedExpense((prev) =>
                      prev.filter((id) => id !== row.original.ID)
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
                <Button onClick={() => setViewExpenseId(row.original.ID)}>
                  <Eye /> View Expense
                </Button>
              </div>
            ),
          },
        ]}
        rowSelection={rowSelection}
        onRowSelectionChange={(selected) => {
          setRowSelection(selected);
          const selectedIds = Object.keys(selected)
            .filter((key) => selected[key])
            .map((key) => Number(key));
          setSelectedExpense(selectedIds);
        }}
      />
      {viewExpenseId !== null && (
        <ViewExpenseModal
          expense={expense.find((e) => e.ID === viewExpenseId)}
          open={true}
          onClose={() => setViewExpenseId(null)}
        />
      )}

      <Dialog open={confirmDownload} onOpenChange={setConfirmDownload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Confirm Download</DialogTitle>
          </DialogHeader>
          <p className="text-black">Do you want to download this PDF?</p>
          <DialogFooter>
            <Button
              onClick={() => setConfirmDownload(false)}
              disabled={isDownloading}
              className="bg-gray-200 text-black"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDownload}
              disabled={isDownloading}
            >
              {isDownloading ? "Downloading..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
