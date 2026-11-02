import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { BillProduct } from "../types/bill.type";

Font.register({
  family: "Sarabun",
  src: "https://fonts.gstatic.com/s/sarabun/v13/DtVmJx26TKEr37c9YOZqik8s7g.ttf",
});

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: "Sarabun",
  },
  header: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    width: 150,
    objectFit: "contain",
  },
  companyInfo: {
    fontSize: 10,
    color: "#666",
    marginBottom: 5,
    textAlign: "right",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    padding: 5,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: "#000",
  },
  customerInfo: {
    marginBottom: 20,
  },
  label: {
    fontSize: 8,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 8,
    marginBottom: 5,
  },
});

interface BillPDFProps {
  billNumber: string;
  customerName: string;
  customerEmail: string;
  billDate: string;
  products: BillProduct[];
}

export const BillPDF = ({
  billNumber,
  customerName,
  customerEmail,
  billDate,
  products,
}: BillPDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyInfo}>
              บริษัท ออสโตน(ไทยแลนด์) จำกัดด
            </Text>
            <Text style={styles.companyInfo}>โทรศัพท์ 02-7115656</Text>
          </View>
          <Image src="/austone-pdf-logo.jpg" style={styles.logo} />
        </View>

        <Text style={styles.title}>หมายเลขยาง</Text>

        <View
          style={[
            styles.customerInfo,
            { flexDirection: "row", justifyContent: "space-between" },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>เลขที่บิล:</Text>
            <Text style={styles.value}>{billNumber}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>ลูกค้า:</Text>
            <Text style={styles.value}>{customerName}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>อีเมล:</Text>
            <Text style={styles.value}>{customerEmail}</Text>
          </View>
        </View>
        <View
          style={[
            styles.customerInfo,
            { flexDirection: "row", justifyContent: "space-between" },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>วันที่บิล:</Text>
            <Text style={styles.value}>{billDate}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>จำนวนสินค้า:</Text>
            <Text style={styles.value}>{products.length}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={[styles.tableCell, { flex: 1, fontSize: 8 }]}>
              <Text>ลำดับบ</Text>
            </View>
            <View style={[styles.tableCell, { flex: 2, fontSize: 8 }]}>
              <Text>หมายเลขยาง</Text>
            </View>
            <View style={[styles.tableCell, { flex: 3, fontSize: 8 }]}>
              <Text>ประเภท</Text>
            </View>
            <View style={[styles.tableCell, { flex: 1, fontSize: 8 }]}>
              <Text>ลำดับบ</Text>
            </View>
            <View style={[styles.tableCell, { flex: 2, fontSize: 8 }]}>
              <Text>หมายเลขยาง</Text>
            </View>
            <View style={[styles.tableCell, { flex: 3, fontSize: 8 }]}>
              <Text>ประเภท</Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              borderBottomWidth: 1,
              borderBottomColor: "#000",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                borderBottomWidth: 1,
                borderBottomColor: "#000",
                width: "50%",
              }}
            >
              {products
                .slice(0, Math.ceil(products.length / 2))
                .map((product, index) => (
                  <View key={product.id} style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 1, fontSize: 8 }]}>
                      <Text>{index + 1}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 2, fontSize: 8 }]}>
                      <Text>{product.id}</Text>
                    </View>
                    <View
                      style={[styles.tableCell, { flex: 3 }, { fontSize: 8 }]}
                    >
                      <Text>{product.product_type?.title}</Text>
                    </View>
                  </View>
                ))}
            </View>
            <View
              style={{
                flexDirection: "column",
                borderBottomWidth: 1,
                borderBottomColor: "#000",
                width: "50%",
              }}
            >
              {products
                .slice(Math.ceil(products.length / 2))
                .map((product, index) => (
                  <View key={product.id} style={styles.tableRow}>
                    <View style={[styles.tableCell, { flex: 1, fontSize: 8 }]}>
                      <Text>{Math.ceil(products.length / 2) + index + 1}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 2, fontSize: 8 }]}>
                      <Text>{product.id}</Text>
                    </View>
                    <View style={[styles.tableCell, { flex: 3, fontSize: 8 }]}>
                      <Text>{product.product_type?.title}</Text>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
