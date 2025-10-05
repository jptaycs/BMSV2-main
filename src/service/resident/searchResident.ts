import { Resident } from "@/types/apitypes";
import sanitize from "../sanitize";

export default function searchResident(term: string, data: Resident[]) {
  const sanitizedQuery = sanitize(term);
  const pattern = new RegExp(sanitizedQuery, "i");

  return data.filter((resident) => {
    const searchableFields = [
      resident.Firstname,
      resident.Middlename,
      resident.Lastname,
      resident.Gender,
      resident.Status,
      resident.Zone,
      resident.CivilStatus,
      resident.Suffix
    ];

    const fullName = `${resident.Firstname} ${resident.Middlename ?? ""} ${resident.Lastname}`.trim();
    return searchableFields.some(field => field !== undefined && pattern.test(String(field))) || pattern.test(String(fullName));
  });
}
