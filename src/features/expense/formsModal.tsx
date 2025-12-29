import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { open } from "@tauri-apps/plugin-shell";


type FinanceForm = {
  type: string;
  path: string; // Google Docs link
};

const financeForms: FinanceForm[] = [
  { type: "Abstract of Price Quotation", path: "https://docs.google.com/document/d/1Gg8sTtizb7qo4t7vzNqlfbjCCAxk45PM/edit?usp=sharing&ouid=114647868929408229275&rtpof=true&sd=true" },
  { type: "Anual Procurement Plan", path: "https://docs.google.com/document/d/11PgEC96V5Rl7l8NE5s3VNaZr7gcKqr83/edit?usp=sharing&ouid=114647868929408229275&rtpof=true&sd=true" },
  { type: "Canvass", path: "https://docs.google.com/document/d/1CfzyjBEX586vdm7X2rkC775_PdnSdDQz8OvY6BhBtQk/edit?usp=sharing" },
  { type: "Disbursement Voucher", path: "https://docs.google.com/document/d/1CC9UOp2OkcgJ65MkpEXly1vBnv8cMh4T/edit?usp=sharing&ouid=114647868929408229275&rtpof=true&sd=true" },
  { type: "Inspection & Acceptance Report", path: "https://docs.google.com/document/d/1tZP4ZCuQWZ1HGnfkFOxT6VWcDKZFkJud/edit?usp=sharing&ouid=114647868929408229275&rtpof=true&sd=true" },
  { type: "Monthly Reports Accounting", path: "https://docs.google.com/document/d/1nG4Ium6qrokX4-_MnOsjKIABmcB5MGNQ/edit?usp=sharing&ouid=114647868929408229275&rtpof=true&sd=true" },
  { type: "Program of Work", path: "https://docs.google.com/document/d/13WUFqJ1FLmRfUKjvyI5Vq4ziSjH5Awr7/edit?usp=sharing&ouid=114647868929408229275&rtpof=true&sd=true" },
  { type: "Purchase Request", path: "https://docs.google.com/document/d/1fsLBGI-NbWwF3wA3FdnhIqvi90XLvtq1/edit?usp=sharing&ouid=114647868929408229275&rtpof=true&sd=true" },
  { type: "Purchase Order", path: "https://docs.google.com/document/d/1mxY2RY42BauWn8HbFyatINvZuUzVGz07/edit?usp=sharing&ouid=114647868929408229275&rtpof=true&sd=true" },
  // { type: "Inspection and Acceptance Report", path: "https://docs.google.com/document/d/1vqFwuM70RsYO8-6W5hVr7rNT3LI6JWOe/edit?usp=sharing&ouid=110807070836434917159&rtpof=true&sd=true" },
  // { type: "Itinerary and Travel Order ", path: "https://docs.google.com/document/d/1TqirnVwxv-hoiLo6LkNKZ6VHscQmIWpb/edit?usp=sharing&ouid=110807070836434917159&rtpof=true&sd=true" },
  // { type: "Payroll", path: "https://docs.google.com/document/d/1zxCB6wQW8QZ6_n_kI5zHYmjbqX7PDRgB/edit?usp=sharing&ouid=110807070836434917159&rtpof=true&sd=true" },
  // { type: "Punong Barangay Certification", path: "https://docs.google.com/document/d/1IbmbLFCEBqeg6RZootcPo6Jt1mmqfJU4/edit?usp=sharing&ouid=110807070836434917159&rtpof=true&sd=true" },
  
//   { type: "Solo Parent Certificate", path: "https://docs.google.com/document/d/PLACEHOLDER_SOLO_PARENT/edit" },
//   { type: "Unemployment Certificate", path: "https://docs.google.com/document/d/PLACEHOLDER_UNEMPLOYMENT/edit" },
//   { type: "First Job Seeker Certificate", path: "https://docs.google.com/document/d/PLACEHOLDER_JOBSEEKER/edit" },
//   { type: "Completion Certificate", path: "https://docs.google.com/document/d/PLACEHOLDER_COMPLETION/edit" },
];

export default function FormsModal() {
  const [filteredForms, setFilteredForms] = useState<FinanceForm[]>(financeForms);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="lg">
            <Plus />
            Finance Form
          </Button>
        </DialogTrigger>
        <DialogContent className="py-5 px-0 flex flex-col gap-0 max-h-[50rem] overflow-hidden">
          <div className="sticky top-0 z-10 p-6 border-b bg-background">
            <DialogHeader>
              <DialogTitle className="text-black">
                Select Finance Form
              </DialogTitle>
              <DialogDescription>
                Please choose the finance form you'd like to generate. This helps us provide the correct template for your needs.
              </DialogDescription>
            </DialogHeader>
            <div className="mb-0 mt-4">
              <input
                type="text"
                placeholder="Search finance forms..."
                className="w-full border border-gray-300 rounded px-3 py-2 text-black"
                onChange={(e) => {
                  // this will be handled via state in code (add state for search term)
                  const searchTerm = e.target.value.toLowerCase();
                  setFilteredForms(
                    financeForms.filter((form) =>
                      form.type.toLowerCase().includes(searchTerm)
                    )
                  );
                }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="px-6">
              <Table>
                <TableCaption>Finance forms being offered.</TableCaption>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    <TableHead className="text-black bg-background">
                      Type
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.map((form, i) => (
                    <TableRow key={i} className="text-black">
                      <TableCell>
                        <div className="flex justify-between items-center">
                          {form.type}
                          <Button
                            onClick={() => open(form.path)}
                          >
                            Select
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
