import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import { Resident } from "@/types/apitypes";
import PDFHeader from "./pdfheader";

type Props = {
  filter: string;
  residents: Resident[];
};

export const ResidentPDF = ({ filter, residents }: Props) => {
  // Sort residents alphabetically by Lastname then Firstname
  const sortedResidents = [...residents].sort((a, b) => {
    const nameA = `${a.Lastname} ${a.Firstname}`.toLowerCase();
    const nameB = `${b.Lastname} ${b.Firstname}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const ROWS_PER_PAGE = 15;

  // Split residents into pages of 15 rows each
  const pages = [];
  for (let i = 0; i < sortedResidents.length; i += ROWS_PER_PAGE) {
    pages.push(sortedResidents.slice(i, i + ROWS_PER_PAGE));
  }

  return (
    <Document>
      {pages.map((pageResidents, pageIndex) => (
        <Page
          key={pageIndex}
          orientation="landscape"
          size="A4"
          wrap
          style={{ paddingTop: 10, paddingBottom: 10, paddingHorizontal: 10 }}
        >
          <View style={{ margin: "2px" }}>
            <PDFHeader />
            <View style={{ margin: "0px" }}>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ fontSize: 14 }}>{filter}</Text>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.headerCell}><Text>ID</Text></View>
                <View style={[styles.headerCell, { width: 150 }]}><Text>Full Name</Text></View>
                <View style={styles.headerCell}><Text>Civil Status</Text></View>
                <View style={styles.headerCell}><Text>Gender</Text></View>
                <View style={styles.headerCell}><Text>Birthday</Text></View>
                <View style={styles.headerCell}><Text>Zone</Text></View>
                <View style={styles.headerCell}><Text>Status</Text></View>
              </View>
              <View style={styles.table}>
                {pageResidents.map((resident, index) => (
                  <View
                    style={[
                      styles.tableRow,
                      { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                    ]}
                    key={resident.ID}
                  >
                    <View style={styles.tableCell}><Text>{resident.ID}</Text></View>
                    <View style={[styles.tableCell, { width: 150 }]}>
                      <Text>
                        {resident.Lastname}, {resident.Firstname} {resident.Middlename ?? ""} {resident.Suffix ?? ""}
                      </Text>
                    </View>
                    <View style={styles.tableCell}><Text>{resident.CivilStatus}</Text></View>
                    <View style={styles.tableCell}><Text>{resident.Gender}</Text></View>
                    <View style={styles.tableCell}>
                      <Text>{format(new Date(resident.Birthday), "MMMM do, yyyy")}</Text>
                    </View>
                    <View style={styles.tableCell}><Text>{resident.Zone}</Text></View>
                    <View style={styles.tableCell}><Text>{resident.Status}</Text></View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};