import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { PDFViewer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { useEffect } from "react";
import { useOfficial } from "@/features/api/official/useOfficial";
import getSettings from "@/service/api/settings/getSettings";
import getResident from "@/service/api/resident/getResident";
import { useMemo, useState } from "react";
import { Virtuoso } from "react-virtuoso";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown, ArrowLeftCircleIcon } from "lucide-react";
import { Buffer } from "buffer";
import CertificateHeader from "../certificateHeader";
import CertificateFooter from "../certificateFooter";
import { useAddCertificate } from "@/features/api/certificate/useAddCertificate";
import { NavLink } from "react-router-dom";

if (!window.Buffer) {
  window.Buffer = Buffer;
}

type Resident = {
  ID?: number;
  Firstname: string;
  Middlename?: string;
  Lastname: string;
  Suffix?: string;
  Birthday?: Date;
  CivilStatus?: string;
  IssuedDate?: string;
};

export default function Fourps() {
  const { data: officials } = useOfficial();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [age, setAge] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [residencyYear, setResidencyYear] = useState("");
  const [purpose, setPurpose] = useState("");
  const [customPurpose, setCustomPurpose] = useState("");
  const [assignedOfficial, setAssignedOfficial] = useState("");
  const [editedResidentName, setEditedResidentName] = useState("");
  const getOfficialName = (role: string, section: string) => {
    if (!officials) return null;
    const list = Array.isArray(officials) ? officials : officials.officials;
    const found = list.find(
      (o) =>
        (o.Section?.toLowerCase() || "").includes(section.toLowerCase()) &&
        (o.Role?.toLowerCase() || "").includes(role.toLowerCase())
    );
    return found?.Name ?? null;
  };

  const captainName = getOfficialName("barangay captain", "barangay officials");
  const { mutateAsync: addCertificate } = useAddCertificate();
  const allResidents = useMemo(() => {
    return residents.map((res) => {
      const middleInitial = res.Middlename
        ? ` ${res.Middlename.charAt(0)}.`
        : "";

      const suffix = res.Suffix ? ` ${res.Suffix}` : "";

      const fullName =
        `${res.Firstname}${middleInitial} ${res.Lastname}${suffix}`
          .replace(/\s+/g, " ")
          .trim();

      return {
        value: fullName.toLowerCase(), // searchable (includes suffix)
        label: fullName, // visible (includes suffix)
        data: res,
      };
    });
  }, [residents]);
  const [, setSearch] = useState("");
  const filteredResidents = useMemo(() => {
    return allResidents.filter((res) =>
      res.value.includes(inputValue.toLowerCase())
    );
  }, [allResidents, inputValue]);
  const selectedResident = useMemo(() => {
    return allResidents.find((res) => res.value === value)?.data;
  }, [allResidents, value]);
  const preparedByDefault = getOfficialName("secretary", "barangay officials");
  const [preparedBy, setPreparedBy] = useState(preparedByDefault || "");
  const [orNumber, setOrNumber] = useState("");
  const [amount, setAmount] = useState("100");
  const documentaryStampDate = new Date().toLocaleDateString("en-PH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const [, setLogoDataUrl] = useState<string | null>(null);
  const [, setLogoMunicipalityDataUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    Barangay: string;
    Municipality: string;
    Province: string;
  } | null>(null);

  const civilStatusOptions = [
    "Single",
    "Lived-in",
    "Cohabitation",
    "Married",
    "Widowed",
    "Separated",
  ];
  const purposeOptions = [
    "Scholarship",
    "Employment",
    "Financial Assistance",
    "Identification",
  ];

  useEffect(() => {
    getSettings()
      .then((res) => {
        if (res.setting) {
          setSettings({
            Barangay: res.setting.Barangay || "",
            Municipality: res.setting.Municipality || "",
            Province: res.setting.Province || "",
          });
          if (res.setting.ImageB) {
            setLogoDataUrl(`data:image/png;base64,${res.setting.ImageB}`);
          }
          if (res.setting.ImageM) {
            setLogoMunicipalityDataUrl(
              `data:image/png;base64,${res.setting.ImageM}`
            );
          }
        }
      })
      .catch(console.error);

    getResident()
      .then((res) => {
        if (Array.isArray(res.residents)) {
          setResidents(res.residents);
          // Remove old suffix-less mapping and selection logic; handled via allResidents useMemo
          // If a value is already selected, update age/civilStatus accordingly
          const selected = res.residents.find((r) => {
            const middleInitial = r.Middlename
              ? ` ${r.Middlename.charAt(0)}.`
              : "";
            const suffix = r.Suffix ? ` ${r.Suffix}` : "";
            const fullName =
              `${r.Firstname}${middleInitial} ${r.Lastname}${suffix}`
                .replace(/\s+/g, " ")
                .trim();
            return fullName.toLowerCase() === value;
          });
          if (selected) {
            if (selected.Birthday) {
              const dob = new Date(selected.Birthday);
              const today = new Date();
              let calculatedAge = today.getFullYear() - dob.getFullYear();
              const m = today.getMonth() - dob.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                calculatedAge--;
              }
              setAge(calculatedAge.toString());
            }
            setCivilStatus(selected.CivilStatus || "");
          }
        }
      })
      .catch(console.error);
  }, []);

  const styles = StyleSheet.create({
    page: { padding: 30 },
    section: { marginBottom: 10 },
    heading: { fontSize: 18, marginBottom: 10 },
    bodyText: { fontSize: 14 },
  });

  return (
    <>
      <div className="flex gap-1 ">
        <Card className="flex-2 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex gap-2 items-center justify-start">
              <Button
                variant="ghost"
                asChild
                className="flex items-center gap-2 text-primary hover:text-primary/80 text-lg p-4"
              >
                <NavLink to="/certificates" className="flex items-center gap-2">
                  <ArrowLeftCircleIcon className="h-10 w-10" />
                  Back
                </NavLink>
              </Button>
            </CardTitle>
            <CardDescription className="text-start">
              Please fill out the necessary information needed for 4ps
              Certification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full flex justify-between"
                  >
                    {inputValue || "Select a Resident"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-full">
                  <Command>
                    <CommandInput
                      placeholder="Search Resident..."
                      className="h-9 text-black"
                      value={inputValue}
                      onValueChange={(val) => {
                        setInputValue(val);
                        setSearch(val);
                      }}
                    />
                    {allResidents.length === 0 ? (
                      <CommandEmpty>No Residents Found</CommandEmpty>
                    ) : (
                      <div className="h-60 overflow-hidden">
                        <Virtuoso
                          style={{ height: "100%" }}
                          totalCount={filteredResidents.length}
                          itemContent={(index) => {
                            const res = filteredResidents[index];
                            return (
                              <CommandItem
                                key={res.value}
                                value={res.value}
                                className="text-black"
                                onSelect={() => {
                                  if (res.data) {
                                    const selected = res.data;

                                    if (selected.Birthday) {
                                      const dob = new Date(selected.Birthday);
                                      const today = new Date();
                                      let calculatedAge =
                                        today.getFullYear() - dob.getFullYear();
                                      const m =
                                        today.getMonth() - dob.getMonth();
                                      if (
                                        m < 0 ||
                                        (m === 0 &&
                                          today.getDate() < dob.getDate())
                                      ) {
                                        calculatedAge--;
                                      }
                                      setAge(calculatedAge.toString());
                                    } else {
                                      setAge("");
                                    }

                                    setCivilStatus(selected.CivilStatus || "");
                                    setValue(res.value);
                                    setInputValue(res.label); // keeps input editable
                                    setEditedResidentName(res.label); // prefill editable name field
                                  }
                                  setOpen(false);
                                }}
                              >
                                {res.label}
                                <Check
                                  className={cn(
                                    "ml-auto",
                                    value === res.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            );
                          }}
                        />
                      </div>
                    )}
                  </Command>
                </PopoverContent>
              </Popover>
              <div className="mt-2">
                <label htmlFor="editedResidentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Edit Resident Name
                </label>
                <input
                  id="editedResidentName"
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={editedResidentName}
                  onChange={(e) => setEditedResidentName(e.target.value)}
                  placeholder="Edit resident name here"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Enter Age
                </label>
                <input
                  id="age"
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="e.g., 24"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="CivilStatus"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Civil Status
                </label>
                <Select value={civilStatus} onValueChange={setCivilStatus}>
                  <SelectTrigger className="w-full border rounded px-3 py-2 text-sm">
                    <SelectValue placeholder="-- Select Civil Status --" />
                  </SelectTrigger>
                  <SelectContent>
                    {civilStatusOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="residency_year"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Residency Year
                </label>
                <input
                  id="residency_year"
                  type="text"
                  value={residencyYear}
                  onChange={(e) => setResidencyYear(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter year (e.g., 2016)"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="purpose"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Purpose of Certificate
                </label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger className="w-full border rounded px-3 py-2 text-sm">
                    <SelectValue placeholder="-- Select Purpose --" />
                  </SelectTrigger>
                  <SelectContent>
                    {purposeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">
                      Other (please specify)
                    </SelectItem>
                  </SelectContent>
                </Select>
                {purpose === "custom" && (
                  <input
                    type="text"
                    value={customPurpose}
                    onChange={(e) => setCustomPurpose(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm mt-2"
                    placeholder="Please specify the purpose"
                  />
                )}
              </div>
              <div className="mt-4">
                <label
                  htmlFor="assignedOfficial"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Assigned Official
                </label>
                <Select
                  value={assignedOfficial}
                  onValueChange={setAssignedOfficial}
                >
                  <SelectTrigger className="w-full border rounded px-3 py-2 text-sm">
                    <SelectValue placeholder="-- Select Official --" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Array.isArray(officials)
                      ? officials
                      : officials?.officials || []
                    )
                      .filter((official: any) => {
                        const role = (official.Role || "").toLowerCase();
                        return !role.includes("sk") && !role.includes("tanod");
                      })
                      .map((official: any) => (
                        <SelectItem key={official.ID} value={official.Name}>
                          {official.Name} - {official.Role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-4">
                <label
                  htmlFor="preparedBy"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prepared By
                </label>
                <input
                  id="preparedBy"
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter preparer's name"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="orNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  O.R. Number
                </label>
                <input
                  id="orNumber"
                  type="text"
                  value={orNumber}
                  onChange={(e) => setOrNumber(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter O.R. Number"
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount (PHP)
                </label>
                <input
                  id="amount"
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="Enter Amount"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center gap-4">
            <Button
              onClick={async () => {
                if (!selectedResident) {
                  alert("Please select a resident first.");
                  return;
                }
                try {
                  const issuedDate = new Date();
                  const formattedIssuedDate = `${issuedDate.getFullYear()}-${String(
                    issuedDate.getMonth() + 1
                  ).padStart(2, "0")}-${String(issuedDate.getDate()).padStart(
                    2,
                    "0"
                  )} ${String(issuedDate.getHours()).padStart(2, "0")}:${String(
                    issuedDate.getMinutes()
                  ).padStart(2, "0")}:${String(
                    issuedDate.getSeconds()
                  ).padStart(2, "0")}`;

                  const cert: any = {
                    resident_id: selectedResident.ID,
                    resident_name:
                      editedResidentName ||
                      `${selectedResident.Firstname} ${selectedResident.Middlename ? selectedResident.Middlename.charAt(0) + ". " : ""}${selectedResident.Lastname}${selectedResident.Suffix ? " " + selectedResident.Suffix : ""}`.replace(/\s+/g, " ").trim(),
                    type_: "4Ps Certificate",
                    issued_date: formattedIssuedDate,
                    ownership_text: "",
                    civil_status: civilStatus || "",
                    purpose:
                      purpose === "custom" ? customPurpose || "" : purpose,
                    age: age ? parseInt(age) : undefined,
                    or_number: orNumber,
                    amount: amount ? parseFloat(amount) : undefined,
                  };
                  await addCertificate(cert);
                  toast.success("Certificate saved successfully!", {
                    description: `${selectedResident.Firstname} ${selectedResident.Lastname}'s certificate was saved.`,
                  });
                } catch (error) {
                  console.error("Save certificate failed:", error);
                  alert("Failed to save certificate.");
                }
              }}
            >
              Save
            </Button>
          </CardFooter>
        </Card>
        <div className="flex-4">
          <PDFViewer width="100%" height={600}>
            <Document key={captainName || "no-captain"}>
              <Page size="A4" style={styles.page}>
                <View style={{ position: "relative" }}>
                  <CertificateHeader />
                  <Text
                    style={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: 24,
                      marginBottom: 50,
                      fontFamily: "Times-Roman",
                    }}
                  >
                    CERTIFICATE OF 4Ps MEMBERSHIP
                  </Text>
                  <Text
                    style={[
                      styles.bodyText,
                      { marginBottom: 10, marginTop: 10 },
                    ]}
                  >
                    TO WHOM IT MAY CONCERN:
                  </Text>
                  {selectedResident ? (
                    <>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        <Text style={{ fontWeight: "bold" }}>
                          {"         "} This is to certify that{" "}
                        </Text>
                        <Text style={{ fontWeight: "bold" }}>
                          {(editedResidentName ||
                            `${selectedResident.Firstname} ${
                              selectedResident.Middlename
                                ? selectedResident.Middlename.charAt(0) + ". "
                                : ""
                            }${selectedResident.Lastname}${
                              selectedResident.Suffix
                                ? " " + selectedResident.Suffix
                                : ""
                            }`).toUpperCase()}
                        </Text>
                        <Text>
                          , {age || "___"} years old, {civilStatus || "___"},
                          and a resident of Barangay{" "}
                          {settings ? settings.Barangay : "________________"},
                          {settings
                            ? settings.Municipality
                            : "________________"}
                          ,{settings ? settings.Province : "________________"}{" "}
                          since {residencyYear || "____"}.
                        </Text>
                      </Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        {"         "} This certifies further that the
                        above-named person is a member of the{" "}
                        <Text style={{ fontWeight: "bold" }}>
                          4Ps (Programang Pantawid Pamilyang Pilipino)
                        </Text>{" "}
                        in this Barangay and has been transpired at{" "}
                        {settings ? settings.Barangay : "________________"},
                        {settings ? settings.Municipality : "________________"},
                        {settings ? settings.Province : "________________"}
                      </Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { textAlign: "justify", marginBottom: 8 },
                        ]}
                      >
                        {"         "} This certification is issued upon request
                        of the interested party for record and reference
                        purposes.
                      </Text>
                      <Text style={[styles.bodyText, { marginTop: 8 }]}></Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { marginTop: 10, marginBottom: 8 },
                        ]}
                      >
                        {purpose || customPurpose
                          ? `Purpose: ${
                              purpose === "custom"
                                ? customPurpose || "________________"
                                : purpose
                            }`
                          : ""}
                      </Text>
                      <Text
                        style={[
                          styles.bodyText,
                          { marginTop: 0, marginBottom: 8 },
                        ]}
                      >
                        Given this{" "}
                        {new Date().toLocaleDateString("en-PH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        at {settings ? settings.Barangay : "________________"},
                        {settings ? settings.Municipality : "________________"},
                        {settings ? settings.Province : "________________"}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.bodyText}>
                      Please select a resident to view certificate.
                    </Text>
                  )}
                  <CertificateFooter
                    styles={styles}
                    captainName={captainName ?? ""}
                    assignedOfficial={assignedOfficial}
                    preparedBy={preparedBy}
                    orNumber={orNumber}
                    amount={amount}
                    documentaryStampDate={documentaryStampDate}
                  />
                </View>
              </Page>
            </Document>
          </PDFViewer>
        </div>
      </div>
    </>
  );
}
