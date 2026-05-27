from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 14)
        self.cell(0, 10, 'Transport Management System - Database Roadmap & ER Diagram', border=0, ln=1, align='C')
        self.ln(3)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def section_title(self, title):
        self.set_font('Arial', 'B', 12)
        self.set_fill_color(220, 230, 241)
        self.cell(0, 8, title, 0, 1, 'L', 1)
        self.ln(2)

    def text_body(self, text):
        self.set_font('Arial', '', 10)
        self.multi_cell(0, 6, text.encode('latin-1', 'replace').decode('latin-1'))
        self.ln(4)

    def add_table(self, cols, w, data):
        self.set_font('Arial', 'B', 9)
        for i in range(len(cols)):
            self.cell(w[i], 8, cols[i], 1, 0, 'C', 0)
        self.ln()
        self.set_font('Arial', '', 8)
        for row in data:
            # handle multi-line cells could be complex, simple string truncate for fpdf cell
            for i in range(len(row)):
                cell_text = str(row[i])
                # trunc if too long for safety
                self.cell(w[i], 8, cell_text[:100], 1, 0, 'L')
            self.ln()
        self.ln(6)

pdf = PDF()
pdf.add_page()

# Section 1: Database Structure & ER Connections
pdf.section_title('1. ER Diagram Summary: How Many Tables & Connections')
er_text = """Total Core Tables Built: 8 Tables.
How they connect to each other (Foreign Keys):
1. LrBilty (Lorry Receipt): The center table.
   - Connects to Customers (Consignor & Consignee).
   - Connects to Vehicles & Drivers.
2. EWayBill: Connects to LrBilty (1-to-1 connection).
3. Tracking: Connects to LrBilty (Many tracking updates for 1 LR) and Vehicles.
4. Customers: Connects to LrBilty.
5. Invoices_Payments: Connects to LrBilty.
6. Vehicles: Connects to LrBilty & Tracking.
7. Drivers: Connects to LrBilty.
8. Users/Staff: Connects to LrBilty (Created by) & Tracking (Updated by)."""
pdf.text_body(er_text)

# Section 2: Justification for Tracking Table
pdf.section_title('2. Justification for TRACKING Table')
tracking_justification = """Why is this table required instead of just using LrBilty status?
- Audit Trail: It keeps a complete timestamp history (e.g., Dispatched -> In Transit -> Checkpoint -> Delivered).
- Transparency: Customers and internal staff need clear logs of where the shipment is exactly.
- Exceptions: If a truck breaks down, the "Remarks" column in the tracking table allows you to log the delay reason.
Total Columns in Tracking Table: 7"""
pdf.text_body(tracking_justification)

track_cols = ['Column Name', 'DataType', 'Constraint', 'Null Handling / Rule']
track_w = [40, 25, 25, 100]
track_data = [
    ['TrackingID', 'INT', 'NOT NULL PK', 'Auto-increment primary key.'],
    ['LrNumber', 'VARCHAR(30)', 'NOT NULL FK', 'Connects to LrBilty.'],
    ['CurrentLocation', 'VARCHAR(200)', 'NOT NULL', 'Exact city or checkpoint name.'],
    ['Status', 'VARCHAR(50)', 'NOT NULL', 'Created, In-Transit, Delayed, Delivered.'],
    ['UpdateTime', 'DATETIME', 'NOT NULL', 'Timestamp of the tracking log.'],
    ['Remarks', 'TEXT', 'NULL ALLOWED', 'Empty normally. Fill data ONLY if exception (breakdown).'],
    ['UpdatedByID', 'INT', 'NOT NULL FK', 'Staff or Driver ID who updated this log.']
]
pdf.add_table(track_cols, track_w, track_data)

pdf.add_page()

# Section 3: LrBilty Structure
pdf.section_title('3. Structure: LR_BILTY Table (17 Columns)')
pdf.text_body("This table stores the primary moving contract. Total Columns: 17")
lr_cols = ['Column Name', 'DataType', 'Constraint', 'Null & Empty Row Logic']
lr_w = [40, 25, 25, 100]
lr_data = [
    ['1. LrNumber (PK)', 'VARCHAR(30)', 'NOT NULL', 'Primary Key (e.g., LR-1001). Mandatory data.'],
    ['2. LrDate', 'DATE', 'NOT NULL', 'Date receipt generated. Mandatory.'],
    ['3. ConsignorID', 'INT', 'NOT NULL FK', 'Sender Customer ID. Mandatory.'],
    ['4. ConsigneeID', 'INT', 'NOT NULL FK', 'Receiver Customer ID. Mandatory.'],
    ['5. Origin', 'VARCHAR(100)', 'NOT NULL', 'Start City. Mandatory.'],
    ['6. Destination', 'VARCHAR(100)', 'NOT NULL', 'End City. Mandatory.'],
    ['7. MaterialDesc', 'VARCHAR(255)', 'NOT NULL', 'Product details. Mandatory.'],
    ['8. TotalWeight', 'DECIMAL(10,2)', 'NOT NULL', 'Weight of goods. Mandatory.'],
    ['9. TotalPackages', 'INT', 'NOT NULL', 'Number of boxes. Mandatory.'],
    ['10. FreightAmount', 'DECIMAL(10,2)', 'NOT NULL', 'Total cost. Mandatory.'],
    ['11. AdvanceAmt', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY if no advance. Fill if paid.'],
    ['12. BalanceAmt', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY if no balance. Fill if pending.'],
    ['13. VehicleID', 'INT', 'NULL ALLOWED', 'EMPTY until a truck is assigned. Fill later.'],
    ['14. DriverID', 'INT', 'NULL ALLOWED', 'EMPTY until driver is assigned. Fill later.'],
    ['15. EWayBillNo', 'VARCHAR(20)', 'NULL ALLOWED', 'EMPTY until govt ewaybill generates.'],
    ['16. DeliveryDate', 'DATETIME', 'NULL ALLOWED', 'EMPTY while in transit. Fill UPON delivery.'],
    ['17. Status', 'VARCHAR(30)', 'NOT NULL', 'Created, Transit, Delivered. Mandatory.']
]
pdf.add_table(lr_cols, lr_w, lr_data)

pdf.add_page()

# Section 4: EWayBill Structure
pdf.section_title('4. Structure: EWAY_BILL Table (17 Columns)')
pdf.text_body("Official government tracking mechanism. Total Columns: 17")
eway_data = [
    ['1. EWayBillNo (PK)', 'VARCHAR(20)', 'NOT NULL', 'Govt generated number. Mandatory.'],
    ['2. EWayBillDate', 'DATETIME', 'NOT NULL', 'Generation Date. Mandatory.'],
    ['3. LrNumber', 'VARCHAR(30)', 'NOT NULL FK', 'Linked LR. Mandatory.'],
    ['4. GenByGSTIN', 'VARCHAR(15)', 'NOT NULL', 'Generator GST. Mandatory.'],
    ['5. SupplierGSTIN', 'VARCHAR(15)', 'NOT NULL', 'Sender GST. Mandatory.'],
    ['6. RecipientGSTIN','VARCHAR(15)', 'NOT NULL', 'Receiver GST. Mandatory.'],
    ['7. DispatchFrom', 'VARCHAR(200)', 'NOT NULL', 'Start Address/PIN. Mandatory.'],
    ['8. ShipTo', 'VARCHAR(200)', 'NOT NULL', 'End Address/PIN. Mandatory.'],
    ['9. Distance', 'INT', 'NOT NULL', 'Distance in KM. Mandatory.'],
    ['10. TotalInvVal', 'DECIMAL(10,2)', 'NOT NULL', 'Invoice monetary value. Mandatory.'],
    ['11. CustomDutyVal','DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY if N/A. Fill data if cross-border.'],
    ['12. CGSTAmount', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY/0 if exempt. Fill data if applicable.'],
    ['13. SGSTAmount', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY/0 if exempt. Fill data if applicable.'],
    ['14. IGSTAmount', 'DECIMAL(10,2)', 'NULL ALLOWED', 'EMPTY/0 if exempt. Fill data if applicable.'],
    ['15. VehicleNumber','VARCHAR(20)', 'NOT NULL', 'Registered Truck Number. Mandatory.'],
    ['16. TransporterID','VARCHAR(50)', 'NULL ALLOWED', 'EMPTY if self-transported. Fill if 3rd party.'],
    ['17. ValidUpto', 'DATETIME', 'NOT NULL', 'Expiration of EWay Bill. Mandatory.']
]
pdf.add_table(lr_cols, lr_w, eway_data)

# Section 5: Null vs Data Summary
pdf.section_title('5. Summary of NULL Value Row Handling')
summary_text = """Question: Which rows accept values, which rows want data, which will be empty?

Rule 1 (Future Data): 
Columns like [VehicleID], [DriverID], [EWayBillNo], and [DeliveryDate] in LrBilty MUST BE EMPTY upfront. They only receive DATA when the action happens (e.g., when a truck arrives, data goes into VehicleID. When delivered, data goes into DeliveryDate).

Rule 2 (Conditional Data):
Columns like [AdvanceAmt], [CustomDutyVal], and [TransporterID] ONLY WANT DATA if the condition applies. If a customer paid no advance, the row MUST BE EMPTY (NULL) or zero. Do not use fake data.

Rule 3 (Mandatory Data):
All NOT NULL rows (like Origin, Dest, Weight, LrNumber) MUST HAVE DATA immediately upon creation."""
pdf.text_body(summary_text)

# Save
pdf.output('Complete_Database_Roadmap.pdf')
print("PDF successfully generated.")
