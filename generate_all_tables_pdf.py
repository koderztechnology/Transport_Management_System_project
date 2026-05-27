from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 14)
        self.cell(0, 10, 'Full System Database Roadmap - All 8 Tables', border=0, ln=1, align='C')
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
pdf.section_title('1. CUSTOMERS TABLE (Consignors & Consignees)', 'Connects to LrBilty.')
data1 = [
    ['CustomerID (PK)', 'INT', 'NOT NULL', 'Auto-increment primary key.'],
    ['CustomerType', 'VARCHAR(20)', 'NOT NULL', 'Consignor, Consignee, or Broker.'],
    ['FullName', 'VARCHAR(100)', 'NOT NULL', 'Registered business/person name.'],
    ['GSTIN', 'VARCHAR(15)', 'NULL ALLOWED', 'Empty for unregistered, Fill for B2B.'],
    ['ContactPhone', 'VARCHAR(15)', 'NOT NULL', 'Primary contact number.'],
    ['Address', 'TEXT', 'NOT NULL', 'Complete physical address.']
]
pdf.add_table(headers, w, data1)

# 2. Vehicles
pdf.section_title('2. VEHICLES TABLE', 'Connects to LrBilty, EWayBill, and Tracking.')
data2 = [
    ['VehicleID (PK)', 'INT', 'NOT NULL', 'Auto-increment primary key.'],
    ['RegistrationNo', 'VARCHAR(20)', 'NOT NULL', 'Number plate (e.g., MH12AB1234).'],
    ['OwnerName', 'VARCHAR(100)', 'NOT NULL', 'Name of the vehicle owner / agency.'],
    ['VehicleType', 'VARCHAR(30)', 'NOT NULL', 'Open Body, Container, Trailer, etc.'],
    ['LoadCapacity', 'DECIMAL(10,2)', 'NOT NULL', 'Max weight truck can carry.'],
    ['RCExpiryDate', 'DATE', 'NULL ALLOWED', 'Empty if not tracked. Fill to prevent dispatch.']
]
pdf.add_table(headers, w, data2)

# 3. Drivers
pdf.section_title('3. DRIVERS TABLE', 'Connects to LrBilty.')
data3 = [
    ['DriverID (PK)', 'INT', 'NOT NULL', 'Auto-increment primary key.'],
    ['DriverName', 'VARCHAR(100)', 'NOT NULL', 'Driver full name.'],
    ['LicenseNumber', 'VARCHAR(30)', 'NOT NULL', 'Official driving license code.'],
    ['LicenseExpiry', 'DATE', 'NOT NULL', 'Date when the license expires.'],
    ['Phone', 'VARCHAR(15)', 'NOT NULL', 'Primary contact number.']
]
pdf.add_table(headers, w, data3)

# 4. Users / Staff
pdf.section_title('4. USERS / STAFF TABLE', 'Connects to LrBilty (Created by) & Tracking (Updated by).')
data4 = [
    ['UserID (PK)', 'INT', 'NOT NULL', 'Auto-increment primary key.'],
    ['Username', 'VARCHAR(50)', 'NOT NULL', 'Login name.'],
    ['PasswordHash', 'VARCHAR(255)', 'NOT NULL', 'Securely hashed password.'],
    ['Role', 'VARCHAR(20)', 'NOT NULL', 'Admin, Manager, Clerk.'],
    ['IsActive', 'BOOLEAN', 'NOT NULL', 'Active/Inactive Status.']
]
pdf.add_table(headers, w, data4)

pdf.add_page()
# 5. Invoices & Payments
pdf.section_title('5. INVOICES & PAYMENTS TABLE', 'Independent ledger for Advance/Balance amounts. Connects to LrBilty.')
data5 = [
    ['InvoiceID (PK)', 'INT', 'NOT NULL', 'Auto-increment primary key.'],
    ['LrNumber (FK)', 'VARCHAR(30)', 'NOT NULL', 'The Bilty this payment belongs to.'],
    ['PaymentType', 'VARCHAR(20)', 'NOT NULL', 'Advance Payment or Balance Payment.'],
    ['AmountPaid', 'DECIMAL(10,2)', 'NOT NULL', 'Exact money received.'],
    ['PaymentDate', 'DATETIME', 'NOT NULL', 'Exact time of transaction.'],
    ['TransactionRef', 'VARCHAR(100)', 'NULL ALLOWED','Empty for Cash. Fill the Bank UTR for online.']
]
pdf.add_table(headers, w, data5)

# 6. Tracking Table
pdf.section_title('6. TRACKING TABLE', 'History timeline logs. Connects to LrBilty.')
data6 = [
    ['TrackingID (PK)', 'INT', 'NOT NULL', 'Auto-increment primary key.'],
    ['LrNumber (FK)', 'VARCHAR(30)', 'NOT NULL', 'Connects back to the Bilty.'],
    ['CurrentLocation', 'VARCHAR(200)', 'NOT NULL', 'Specific checkpoint / city name.'],
    ['Status', 'VARCHAR(50)', 'NOT NULL', 'Created, CheckpointReached, Delivered.'],
    ['UpdateTime', 'DATETIME', 'NOT NULL', 'Timestamp when tracking updated.'],
    ['Remarks', 'TEXT', 'NULL ALLOWED', 'KEEP EMPTY. Fill ONLY if delay/breakdown.'],
    ['UpdatedBy (FK)', 'INT', 'NOT NULL', 'UserID of the staff who pushed update.']
]
pdf.add_table(headers, w, data6)

pdf.add_page()
# 7. LR_Bilty Table
pdf.section_title('7. LR_BILTY TABLE (Primary Contract)', 'The central pillar.')
data7 = [
    ['LrNumber (PK)', 'VARCHAR(30)', 'NOT NULL', 'Manual/Auto ID.'],
    ['LrDate', 'DATE', 'NOT NULL', 'Date receipt generated.'],
    ['ConsignorID(FK)','INT', 'NOT NULL', 'Sender ID from Customers.'],
    ['ConsigneeID(FK)','INT', 'NOT NULL', 'Receiver ID from Customers.'],
    ['Origin', 'VARCHAR(100)', 'NOT NULL', 'Start location.'],
    ['Destination', 'VARCHAR(100)', 'NOT NULL', 'End location.'],
    ['MaterialDesc', 'VARCHAR(200)', 'NOT NULL', 'Goods detail.'],
    ['TotalWeight', 'DECIMAL(10,2)', 'NOT NULL', 'Package weight.'],
    ['TotalPackages', 'INT', 'NOT NULL', 'Count of boxes.'],
    ['FreightAmount', 'DECIMAL(10,2)', 'NOT NULL', 'Total fare calculated.'],
    ['AdvanceAmt', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY if no advance. Fill if paid.'],
    ['BalanceAmt', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY if no balance. Fill if pending.'],
    ['VehicleID (FK)', 'INT', 'NULL ALLOWED', 'EMPTY if truck is missing. Fill when assigned.'],
    ['DriverID (FK)', 'INT', 'NULL ALLOWED', 'EMPTY if driver is missing. Fill when assigned.'],
    ['EWayBillNo', 'VARCHAR(20)', 'NULL ALLOWED', 'EMPTY until Govt Bill generated.'],
    ['DeliveryDate', 'DATETIME', 'NULL ALLOWED', 'EMPTY while tracking. Fill when completed.'],
    ['Status', 'VARCHAR(30)', 'NOT NULL', 'In Transit, Delivered.']
]
pdf.add_table(headers, w, data7)

pdf.add_page()
# 8. EWayBill Table
pdf.section_title('8. EWAY_BILL TABLE', 'Mandatory government data link.')
data8 = [
    ['EWayBillNo(PK)', 'VARCHAR(20)', 'NOT NULL', 'Official govt generated number.'],
    ['EWayBillDate', 'DATETIME', 'NOT NULL', 'Date and time generated.'],
    ['LrNumber (FK)', 'VARCHAR(30)', 'NOT NULL', 'Connects to LrBilty.'],
    ['GenByGSTIN', 'VARCHAR(15)', 'NOT NULL', 'GST number of the generator.'],
    ['SupplierGSTIN', 'VARCHAR(15)', 'NOT NULL', 'GST number of the sender.'],
    ['RecipientGSTIN', 'VARCHAR(15)', 'NOT NULL', 'GST number of the receiver.'],
    ['DispatchFrom', 'VARCHAR(200)', 'NOT NULL', 'Pincode it left from.'],
    ['ShipTo', 'VARCHAR(200)', 'NOT NULL', 'Pincode it is going to.'],
    ['Distance', 'INT', 'NOT NULL', 'Required transit distance (KM).'],
    ['TotalInvoiceVal','DECIMAL(10,2)','NOT NULL', 'Total value of cargo.'],
    ['CustomDutyVal', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY if not cross-border shipping.'],
    ['CGSTAmount', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY/0 if tax exempt. Fill if standard rules.'],
    ['SGSTAmount', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY/0 if tax exempt. Fill if standard rules.'],
    ['IGSTAmount', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY/0 if tax exempt. Fill if standard rules.'],
    ['VehicleNumber', 'VARCHAR(20)', 'NOT NULL', 'Reg number recorded per govt filing.'],
    ['TransporterID', 'VARCHAR(50)', 'NULL ALLOWED', 'EMPTY if internal fleet. Fill if outsourced.'],
    ['ValidUpto', 'DATETIME', 'NOT NULL', 'Government expiration point.']
]
pdf.add_table(headers, w, data8)

pdf.output('All_Tables_Roadmap.pdf')
print("All 8 Tables Roadmap PDF successfully generated.")
