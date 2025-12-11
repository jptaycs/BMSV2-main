import { Text, View } from "@react-pdf/renderer";

type CertificateFooterProps = {
  styles: any;
  captainName: string | null;
  assignedOfficial?: string;
  preparedBy?: string;
  orNumber?: string;
  amount?: string;
  documentaryStampDate?: string;
};

export default function CertificateFooter({
  styles,
  captainName,
  assignedOfficial,
  preparedBy = "Evamgeline Diesta",
  orNumber = "",
  amount = "",
  documentaryStampDate = "",
}: CertificateFooterProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
      }}
    >
      <View style={{ alignItems: "flex-start" }}>
        <Text style={[styles.bodyText, { marginBottom: 0 }]}>
          Certifying Officer,
        </Text>
        {assignedOfficial ? (
          <>
            <Text
              style={[
                styles.bodyText,
                { marginTop: 10, marginBottom: 4, fontWeight: "bold" },
              ]}
            >
              HON. {assignedOfficial}
            </Text>
            <Text style={[styles.bodyText, { marginBottom: 9 }]}>
              Officer in charge of the today
            </Text>
            <Text
              style={[
                styles.bodyText,
                {
                  marginTop: 10,
                  marginBottom: 4,
                  fontWeight: "bold",
                },
              ]}
            >
              HON. {captainName || "________________"}
            </Text>
            <Text style={[styles.bodyText, { marginBottom: 10 }]}>
              Punong Barangay
            </Text>
            {/* New Section with marginTop 50 */}
            <View style={{ marginTop: 50 }}>
              <Text style={[styles.bodyText]}>
                O.R. Number: {orNumber || "________________"}
              </Text>
              <Text style={[styles.bodyText]}>
                Amount: {amount || "________________"} PHP
              </Text>
              <Text style={[styles.bodyText]}>Documentary Stamp: 30 PHP</Text>
              <Text style={[styles.bodyText]}>
                Date: {documentaryStampDate}
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text
              style={[
                styles.bodyText,
                {
                  marginTop: 10,
                  marginBottom: 4,
                  fontWeight: "bold",
                },
              ]}
            >
              HON. {captainName || "________________"}
            </Text>
            <Text style={[styles.bodyText, { marginBottom: 12 }]}>
              Punong Barangay
            </Text>
            {/* New Section with marginTop 50 */}
            <View style={{ marginTop: 50 }}>
              <Text style={[styles.bodyText, { fontSize: 9, fontWeight: 400 }]}>
                O.R. Number: {orNumber || "________________"}
              </Text>
              <Text style={[styles.bodyText, { fontSize: 9, fontWeight: 400 }]}>
                Amount: {amount || "________________"} PHP
              </Text>
              <Text style={[styles.bodyText, { fontSize: 9, fontWeight: 400 }]}>
                Documentary Stamp: 30 PHP
              </Text>
              <Text style={[styles.bodyText, { fontSize: 9, fontWeight: 400 }]}>
                Date: {documentaryStampDate}
              </Text>
            </View>
          </>
        )}
      </View>
      <View>
        <Text
          style={[
            styles.bodyText,
            { fontWeight: "bold", marginTop: 23, marginBottom: 40 },
          ]}
        >
          Not valid without dry seal
        </Text>
        <Text style={[styles.bodyText, { fontWeight: "bold" }]}>
          {preparedBy}
        </Text>
        <Text style={[styles.bodyText, { marginTop: 6 }]}>Prepared by:</Text>
      </View>
    </View>
  );
}
