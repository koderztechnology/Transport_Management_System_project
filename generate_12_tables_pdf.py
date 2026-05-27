from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 14)
        self.cell(0, 10, 'Full System Database Roadmap - All 12 Tables', border=0, ln=1, align='C')
        self.ln(3)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def section_title(self, title, subtitle=""):
        self.set_font('Arial', 'B', 11)
        self.set_fill_color(220, 230, 241)
        self.cell(0, 8, title, 0, 1, 'L', 1)
        if subtitle:
            self.set_font('Arial', 'I', 9)
            self.cell(0, 6, subtitle, 0, 1, 'L')
        self.ln(2)

    def add_table(self, headers, w, data):
        self.set_font('Arial', 'B', 8)
        for i in range(len(headers)):
            self.cell(w[i], 8, headers[i], 1, 0, 'C', 0)
        self.ln()
        self.set_font('Arial', '', 8)
        for row in data:
            for i in range(len(row)):
                self.cell(w[i], 8, str(row[i])[:100], 1, 0, 'L')
            self.ln()
        self.ln(6)

pdf = PDF()
pdf.add_page()
headers = ['Column Name', 'Data Type', 'Constraint', 'Null Rules & Details']
w = [40, 25, 25, 100]

# 1. Customers
pdf.section_title('1. CUSTOMERS TABLE (Consignors & Consignees)', 'Stores all senders, receivers, and billing entities. Connects to LrBilty.')
data1 = [
    ['CustomerID (PK)', 'INT', 'NOT NULL', 'Auto-increment unique ID. Mandatory.'],
    ['CustomerType', 'VARCHAR(20)', 'NOT NULL', 'E.g., Consignor, Consignee, Broker.'],
    ['FullName', 'VARCHAR(100)', 'NOT NULL', 'Registered Name. Mandatory.'],
    ['GSTIN', 'VARCHAR(15)', 'NULL ALLOWED', 'Leave empty for unregistered clients. Fill for B2B.'],
    ['ContactPhone', 'VARCHAR(15)', 'NOT NULL', 'Primary contact number.'],
    ['Address', 'TEXT', 'NOT NULL', 'Complete physical address.']
]
pdf.add_table(headers, w, data1)

# 2. Vehicles
pdf.section_title('2. VEHICLES TABLE', 'Registry of all trucks. Connects to LrBilty, EWayBill, Tracking, Fuel, Toll.')
data2 = [
    ['VehicleID (PK)', 'INT', 'NOT NULL', 'Auto-increment unique ID. Mandatory.'],
    ['RegistrationNo', 'VARCHAR(20)', 'NOT NULL', 'Number plate (e.g., MH12AB1234). Mandatory.'],
    ['OwnerName', 'VARCHAR(100)', 'NOT NULL', 'Name of the vehicle owner / agency.'],
    ['VehicleType', 'VARCHAR(30)', 'NOT NULL', 'E.g., Open Body, Container, Trailer.'],
    ['LoadCapacity', 'DECIMAL(10,2)', 'NOT NULL', 'Max weight in tons.'],
    ['RCExpiryDate', 'DATE', 'NULL ALLOWED', 'Leave empty if not tracked. Fill to prevent dispatch.'],
    ['DriverID (FK)', 'INT', 'NULL ALLOWED', 'Assigned driver. NULL if not assigned.']
]
pdf.add_table(headers, w, data2)

# 3. Drivers
pdf.section_title('3. DRIVERS TABLE', 'Roster of drivers. Connects to LrBilty, Vehicles.')
data3 = [
    ['DriverID (PK)', 'INT', 'NOT NULL', 'Auto-increment unique ID. Mandatory.'],
    ['DriverName', 'VARCHAR(100)', 'NOT NULL', 'Full name. Mandatory.'],
    ['LicenseNumber', 'VARCHAR(30)', 'NOT NULL', 'License code. Mandatory.'],
    ['LicenseExpiry', 'DATE', 'NOT NULL', 'Expiry date. Mandatory.'],
    ['Phone', 'VARCHAR(15)', 'NOT NULL', 'Contact number.'],
    ['Address', 'TEXT', 'NULL ALLOWED', 'Driver address.'],
    ['Status', 'VARCHAR(10)', 'NOT NULL', 'Active/Inactive. Default Active.']
]
pdf.add_table(headers, w, data3)

# 4. Users / Staff
pdf.section_title('4. USERS / STAFF TABLE', 'Access management. Connects to LrBilty (Created by), Tracking (Updated by).')
data4 = [
    ['UserID (PK)', 'INT', 'NOT NULL', 'Auto-increment unique ID. Mandatory.'],
    ['Username', 'VARCHAR(50)', 'NOT NULL', 'Login name. Mandatory.'],
    ['PasswordHash', 'VARCHAR(255)', 'NOT NULL', 'Hashed password. Mandatory.'],
    ['Role', 'VARCHAR(20)', 'NOT NULL', 'Admin, Manager, Clerk.'],
    ['IsActive', 'BOOLEAN', 'NOT NULL', 'Default TRUE. FALSE when resigned.']
]
pdf.add_table(headers, w, data4)

# 5. Fuel
pdf.section_title('5. FUEL TABLE', 'Fuel expenses. Connects to Vehicles.')
data5 = [
    ['FuelID (PK)', 'INT', 'NOT NULL', 'Auto-increment unique ID. Mandatory.'],
    ['VehicleID (FK)', 'INT', 'NULL ALLOWED', 'Vehicle that was fueled.'],
    ['Litres', 'FLOAT', 'NOT NULL', 'Amount of fuel.'],
    ['PricePerLitre', 'FLOAT', 'NOT NULL', 'Cost per litre.'],
    ['Date', 'DATE', 'NOT NULL', 'Fuel date.'],
    ['Photo', 'VARCHAR(100)', 'NULL ALLOWED', 'Receipt photo path.']
]
pdf.add_table(headers, w, data5)

# 6. Toll
pdf.section_title('6. TOLL TABLE', 'Toll expenses. Connects to Vehicles.')
data6 = [
    ['TollID (PK)', 'INT', 'NOT NULL', 'Auto-increment unique ID. Mandatory.'],
    ['VehicleID (FK)', 'INT', 'NULL ALLOWED', 'Vehicle that paid toll.'],
    ['TollName', 'VARCHAR(100)', 'NOT NULL', 'Toll location name.'],
    ['Amount', 'FLOAT', 'NOT NULL', 'Toll amount.'],
    ['Date', 'DATE', 'NOT NULL', 'Toll date.'],
    ['Photo', 'VARCHAR(100)', 'NULL ALLOWED', 'Receipt photo path.']
]
pdf.add_table(headers, w, data6)

# 7. Invoices & Payments
pdf.section_title('7. INVOICES & PAYMENTS TABLE', 'Payments ledger. Connects to LrBilty.')
data7 = [
    ['InvoiceID (PK)', 'INT', 'NOT NULL', 'Auto-increment unique ID. Mandatory.'],
    ['LrNumber (FK)', 'VARCHAR(30)', 'NOT NULL', 'Bilty number. Mandatory.'],
    ['PaymentType', 'VARCHAR(20)', 'NOT NULL', 'Advance or Balance.'],
    ['AmountPaid', 'DECIMAL(10,2)', 'NOT NULL', 'Amount received.'],
    ['PaymentDate', 'DATETIME', 'NOT NULL', 'Transaction time.'],
    ['TransactionRef', 'VARCHAR(100)', 'NULL ALLOWED', 'UTR for online, empty for cash.']
]
pdf.add_table(headers, w, data7)

# 8. Tracking
pdf.section_title('8. TRACKING TABLE', 'Movement log. Connects to LrBilty.')
data8 = [
    ['TrackingID (PK)', 'INT', 'NOT NULL', 'Auto-increment unique ID. Mandatory.'],
    ['LrNumber (FK)', 'VARCHAR(30)', 'NOT NULL', 'Bilty number. Mandatory.'],
    ['CurrentLocation', 'VARCHAR(200)', 'NOT NULL', 'Checkpoint/city.'],
    ['Status', 'VARCHAR(50)', 'NOT NULL', 'Created, In Transit, Delivered.'],
    ['UpdateTime', 'DATETIME', 'NOT NULL', 'Timestamp.'],
    ['Remarks', 'TEXT', 'NULL ALLOWED', 'Optional remarks.'],
    ['UpdatedBy (FK)', 'INT', 'NOT NULL', 'UserID who updated.']
]
pdf.add_table(headers, w, data8)

# 9. LR_Bilty
pdf.section_title('9. LR_BILTY TABLE', 'Central contract. Connects to Customers, Vehicles, Drivers, EWayBill.')
data9 = [
    ['LrNumber (PK)', 'VARCHAR(30)', 'NOT NULL', 'Manual/auto ID. Mandatory.'],
    ['LrDate', 'DATE', 'NOT NULL', 'Receipt date.'],
    ['ConsignorID (FK)', 'INT', 'NOT NULL', 'Sender ID.'],
    ['ConsigneeID (FK)', 'INT', 'NOT NULL', 'Receiver ID.'],
    ['Origin', 'VARCHAR(100)', 'NOT NULL', 'Start location.'],
    ['Destination', 'VARCHAR(100)', 'NOT NULL', 'End location.'],
    ['MaterialDesc', 'VARCHAR(500)', 'NOT NULL', 'Goods details.'],
    ['TotalWeight', 'DECIMAL(10,2)', 'NOT NULL', 'Weight.'],
    ['TotalPackages', 'INT', 'NOT NULL', 'Package count.'],
    ['FreightAmount', 'DECIMAL(10,2)', 'NOT NULL', 'Total fare.'],
    ['AdvanceAmt', 'DECIMAL(10,2)', 'NULL ALLOWED', 'Pre-paid amount.'],
    ['BalanceAmt', 'DECIMAL(10,2)', 'NULL ALLOWED', 'Pending amount.'],
    ['VehicleID (FK)', 'INT', 'NULL ALLOWED', 'Assigned vehicle.'],
    ['DriverID (FK)', 'INT', 'NULL ALLOWED', 'Assigned driver.'],
    ['EWayBillNo (FK)', 'VARCHAR(20)', 'NULL ALLOWED', 'Govt bill number.'],
    ['DeliveryDate', 'DATETIME', 'NULL ALLOWED', 'Completion date.'],
    ['Status', 'VARCHAR(30)', 'NOT NULL', 'In Transit, Delivered.']
]
pdf.add_table(headers, w, data9)

# 10. EWayBill
pdf.section_title('10. EWAYBILL TABLE', 'Govt link. Connects to LrBilty.')
data10 = [
    ['EWayBillNo (PK)', 'VARCHAR(20)', 'NOT NULL', 'Govt number. Mandatory.'],
    ['EWayBillDate', 'DATETIME', 'NOT NULL', 'Generation time.'],
    ['LrNumber (FK)', 'VARCHAR(30)', 'NOT NULL', 'Bilty number.'],
    ['GenByGSTIN', 'VARCHAR(15)', 'NOT NULL', 'Generator GST.'],
    ['SupplierGSTIN', 'VARCHAR(15)', 'NOT NULL', 'Sender GST.'],
    ['RecipientGSTIN', 'VARCHAR(15)', 'NOT NULL', 'Receiver GST.'],
    ['DispatchFrom', 'VARCHAR(200)', 'NOT NULL', 'Origin address.'],
    ['ShipTo', 'VARCHAR(200)', 'NOT NULL', 'Destination address.'],
    ['Distance', 'INT', 'NOT NULL', 'Transit KM.'],
    ['TotalInvoiceVal', 'DECIMAL(10,2)', 'NOT NULL', 'Cargo value.'],
    ['CustomDutyVal', 'DECIMAL(10,2)', 'NULL ALLOWED', 'For international.'],
    ['CGSTAmount', 'DECIMAL(10,2)', 'NULL ALLOWED', 'Tax amount.'],
    ['SGSTAmount', 'DECIMAL(10,2)', 'NULL ALLOWED', 'Tax amount.'],
    ['IGSTAmount', 'DECIMAL(10,2)', 'NULL ALLOWED', 'Tax amount.'],
    ['VehicleNumber', 'VARCHAR(20)', 'NOT NULL', 'Reg number.'],
    ['TransporterID', 'VARCHAR(50)', 'NULL ALLOWED', 'Outsourced ID.'],
    ['ValidUpto', 'DATETIME', 'NOT NULL', 'Expiry time.']
]
pdf.add_table(headers, w, data10)

# 11. Trip Management
pdf.section_title('11. TRIP MANAGEMENT TABLE', 'Trip records. Connects to Vehicles, Drivers, LrBilty.')
data11 = [
    ['TripID (PK)', 'INT', 'NOT NULL', 'Auto-increment ID.'],
    ['VehicleID (FK)', 'INT', 'NOT NULL', 'Vehicle used.'],
    ['DriverID (FK)', 'INT', 'NOT NULL', 'Driver assigned.'],
    ['StartDate', 'DATETIME', 'NOT NULL', 'Trip start.'],
    ['EndDate', 'DATETIME', 'NULL ALLOWED', 'Trip end.'],
    ['Origin', 'VARCHAR(100)', 'NOT NULL', 'Start location.'],
    ['Destination', 'VARCHAR(100)', 'NOT NULL', 'End location.'],
    ['Status', 'VARCHAR(20)', 'NOT NULL', 'Ongoing, Completed.'],
    ['LrNumbers', 'TEXT', 'NULL ALLOWED', 'Associated bilty numbers.']
]
pdf.add_table(headers, w, data11)

# 12. Inventory Management
pdf.section_title('12. INVENTORY MANAGEMENT TABLE', 'Stock tracking. Connects to LrBilty.')
data12 = [
    ['InventoryID (PK)', 'INT', 'NOT NULL', 'Auto-increment ID.'],
    ['ItemName', 'VARCHAR(100)', 'NOT NULL', 'Item description.'],
    ['Quantity', 'INT', 'NOT NULL', 'Stock quantity.'],
    ['Unit', 'VARCHAR(20)', 'NOT NULL', 'Kg, Pieces, etc.'],
    ['LrNumber (FK)', 'VARCHAR(30)', 'NULL ALLOWED', 'Associated bilty.'],
    ['Location', 'VARCHAR(100)', 'NOT NULL', 'Storage location.'],
    ['LastUpdated', 'DATETIME', 'NOT NULL', 'Update timestamp.']
]
pdf.add_table(headers, w, data12)

pdf.output('all_12_tables_roadmap.pdf')
print("PDF generated: all_12_tables_roadmap.pdf")