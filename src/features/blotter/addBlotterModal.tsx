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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { toast } from "sonner";
import { blotterSchema } from "@/types/formSchema";
import { Blotter } from "@/types/apitypes";
import { useAddBlotter } from "../api/blotter/useAddBlotter";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorResponse } from "@/service/api/auth/login";

export default function AddBlotterModal() {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const addMutation = useAddBlotter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [customType, setCustomType] = useState("");

  const form = useForm<z.infer<typeof blotterSchema>>({
    resolver: zodResolver(blotterSchema),
    defaultValues: {
      ID: 0,
      Type: "",
      ReportedBy: "",
      Involved: "",
      IncidentDate: new Date(),
      Location: "",
      Zone: "",
      Status: "Active",
      Narrative: "",
      Action: "",
      Witnesses: "",
      Evidence: "",
      Resolution: "",
      HearingDate: new Date(),
    },
  });

  async function onSubmit(values: z.infer<typeof blotterSchema>) {
      toast.promise(addMutation.mutateAsync(values as unknown as Blotter), {
        loading: "Adding Expense please wait...",
        success: (data) => {
          const e = data.blotter;
          setOpenModal(false);
          queryClient.invalidateQueries({ queryKey: ["blotters"] });
          return {
            message: "Blotter added successfully",
            description: `${e.Type} was added`,
          };
        },
        error: (error: ErrorResponse) => {
          return {
            message: "Adding blotter failed",
            description: `${error.error}`,
          };
        },
      });
    }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogTrigger asChild>
        <Button size="lg">
          <Plus /> Add Blotter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-screen overflow-y-auto text-black">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Add Blotter Information</DialogTitle>
              <DialogDescription>
                All the fields are required unless it is mentioned otherwise
              </DialogDescription>
            </DialogHeader>

            {step === 1 && (
              <>
                <h2 className="text-md font-semibold text-gray-900 mt-2">
                  Blotter Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="Type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Select
                                value={[
                                  "Theft",
                                  "Assault",
                                  "Vandalism",
                                  "Robbery",
                                  "Fraud",
                                  "Assault with Injury",
                                  "Drug Offense",
                                  "Traffic Violation"
                                ].includes(field.value) ? field.value : "Other"}
                                onValueChange={(val) => {
                                  if (val === "Other") {
                                    field.onChange("");
                                    setCustomType("");
                                  } else {
                                    field.onChange(val);
                                    setCustomType("");
                                  }
                                }}
                              >
                                <SelectTrigger className="text-black flex-1">
                                  <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Theft">Theft</SelectItem>
                                  <SelectItem value="Assault">Assault</SelectItem>
                                  <SelectItem value="Robbery">Robbery</SelectItem>
                                  <SelectItem value="Fraud">Fraud</SelectItem>
                                  <SelectItem value="Assault with Injury">Assault with Injury</SelectItem>
                                  <SelectItem value="Vandalism">Vandalism</SelectItem>
                                  <SelectItem value="Drug Offense">Drug Offense</SelectItem>
                                  <SelectItem value="Traffic Violation">Traffic Violation</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              {![
                                "Theft",
                                "Assault",
                                "Vandalism",
                                "Robbery",
                                "Fraud",
                                "Assault with Injury",
                                "Drug Offense",
                                "Traffic Violation"
                              ].includes(field.value) && (
                                <Input
                                  type="text"
                                  placeholder="Please specify type"
                                  value={customType}
                                  onChange={(e) => {
                                    setCustomType(e.target.value);
                                    field.onChange(e.target.value);
                                  }}
                                  className="text-black flex-1"
                                />
                              )}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="ReportedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reported By</FormLabel>
                          <FormControl>
                            <Input
                              id="ReportedBy"
                              type="text"
                              placeholder="Enter full name"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="Involved"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Person Involved</FormLabel>
                          <FormControl>
                            <Input
                              id="Involved"
                              type="text"
                              placeholder="Enter name"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="IncidentDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Incident</FormLabel>
                          <Popover
                            open={openCalendar}
                            onOpenChange={setOpenCalendar}
                          >
                            <PopoverTrigger asChild>
                              <Button variant="outline">
                                {field.value
                                  ? format(field.value, "PPP")
                                  : "Pick a date"}
                                <CalendarIcon className="ml-auto h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="center"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                captionLayout="dropdown"
                                fromYear={1900}
                                toYear={new Date().getFullYear()}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="Location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Barangay</FormLabel>
                          <FormControl>
                            <Input
                              id="Location"
                              type="text"
                              placeholder="Enter Barangay/Location"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="Zone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zone</FormLabel>
                          <FormControl>
                            <Input
                              id="Zone"
                              type="text"
                              placeholder="Enter Zone/Purok"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="button" onClick={() => setStep(2)}>
                    Next
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-md font-semibold text-gray-900 mt-2">
                  Blotter Information
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="Narrative"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Narrative Report</FormLabel>
                          <FormControl>
                            <Input
                              id="Narrative"
                              type="text"
                              placeholder="Enter Narrative"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="Action"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Action Taken</FormLabel>
                          <FormControl>
                            <Input
                              id="Action"
                              type="text"
                              placeholder="Enter Action taken"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="Witnesses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Witnesses</FormLabel>
                          <FormControl>
                            <Input
                              id="Witnesses"
                              type="text"
                              placeholder="Enter Witnesses"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="Evidence"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evidence</FormLabel>
                          <FormControl>
                            <Input
                              id="Evidence"
                              type="text"
                              placeholder="Enter Evidence"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="Resolution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resolution/Settlement</FormLabel>
                          <FormControl>
                            <Input
                              id="Resolution"
                              type="text"
                              placeholder="Enter Resolution/settlement"
                              required
                              {...field}
                              className="text-black"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1">
                    <FormField
                      control={form.control}
                      name="HearingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Hearing</FormLabel>
                          <div className="flex flex-col gap-2">
                            <Popover
                              open={openCalendar}
                              onOpenChange={setOpenCalendar}
                            >
                              <PopoverTrigger asChild>
                                <Button variant="outline">
                                  {field.value
                                    ? format(field.value, "PPP")
                                    : "Pick a date"}
                                  <CalendarIcon className="ml-auto h-4 w-4" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="center"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={(date) => {
                                    // preserve time component
                                    if (date) {
                                      const old = field.value instanceof Date ? field.value : new Date();
                                      const newDate = new Date(date);
                                      newDate.setHours(old.getHours(), old.getMinutes(), old.getSeconds(), old.getMilliseconds());
                                      field.onChange(newDate);
                                    }
                                  }}
                                  captionLayout="dropdown"
                                  fromYear={1900}
                                  toYear={new Date().getFullYear()}
                                />
                              </PopoverContent>
                            </Popover>
                            <Input
                              type="time"
                              value={
                                field.value
                                  ? field.value instanceof Date
                                    ? field.value
                                        .toLocaleTimeString("en-GB", {
                                          hour12: false,
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })
                                    : ""
                                  : ""
                              }
                              onChange={e => {
                                const time = e.target.value;
                                if (field.value instanceof Date && time) {
                                  const [hours, minutes] = time.split(":").map(Number);
                                  const newDate = new Date(field.value);
                                  newDate.setHours(hours, minutes, 0, 0);
                                  field.onChange(newDate);
                                }
                              }}
                              className="text-black mt-2"
                            />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="flex justify-between pt-4">
                  <Button type="button" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button type="submit">Save Blotter</Button>
                </div>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
