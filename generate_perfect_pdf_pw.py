from playwright.sync_api import sync_playwright

html_content = """
<html>
<head>
<style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; color: #333; line-height: 1.5; padding: 20px;}
    h1 { color: #0056b3; text-align: center; font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
    h2 { background-color: #f1f7ff; color: #004085; padding: 10px; border-left: 5px solid #0056b3; font-size: 14px; margin-top: 35px; margin-bottom: 5px;}
    .subtitle { color: #666; font-style: italic; font-size: 11px; margin-bottom: 10px; display: block; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 25px; page-break-inside: auto; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    tr { page-break-inside: avoid; page-break-after: auto; }
    th { background-color: #0056b3; color: white; padding: 10px; text-align: left; font-size: 12px; border: 1px solid #c0c0c0; }
    td { padding: 8px 10px; border: 1px solid #ddd; vertical-align: top; }
    tr:nth-child(even) { background-color: #fcfcfc; }
    .col-name { width: 25%; font-weight: bold; }
    .col-type { width: 15%; color: #d63384; font-family: monospace; }
    .col-constraint { width: 15%; color: #28a745; font-weight: bold; }
    .col-rules { width: 45%; }
    .null-allowed { color: #dc3545; }
</style>
</head>
<body>

<h1>Database Roadmap - Total 8 Tables</h1>

<!-- Table 1 -->
<h2>1. CUSTOMERS TABLE (Consignors & Consignees)</h2>
<span class="subtitle">Purpose: Stores all senders, receivers, and billing entities. Connects to LrBilty.</span>
<table>
    <tr><th class="col-name">Column Name</th><th class="col-type">Data Type</th><th class="col-constraint">Constraint</th><th class="col-rules">Null Rules & Details</th></tr>
    <tr><td class="col-name">CustomerID (PK)</td><td class="col-type">INT</td><td class="col-constraint">NOT NULL</td><td class="col-rules">Auto-increment unique ID. Mandatory.</td></tr>
    <tr><td>CustomerType</td><td>VARCHAR(20)</td><td>NOT NULL</td><td>E.g., Consignor, Consignee, or Broker.</td></tr>
    <tr><td>FullName</td><td>VARCHAR(100)</td><td>NOT NULL</td><td>Registered Name. Mandatory.</td></tr>
    <tr><td>GSTIN</td><td>VARCHAR(15)</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>Leave empty for unregistered clients. Fill for B2B.</td></tr>
    <tr><td>ContactPhone</td><td>VARCHAR(15)</td><td>NOT NULL</td><td>Primary contact number.</td></tr>
    <tr><td>Address</td><td>TEXT</td><td>NOT NULL</td><td>Complete physical address.</td></tr>
</table>

<!-- Table 2 -->
<h2>2. VEHICLES TABLE</h2>
<span class="subtitle">Purpose: Registry of all trucks used for transport. Connects to LrBilty, EWayBill, Tracking.</span>
<table>
    <tr><th class="col-name">Column Name</th><th class="col-type">Data Type</th><th class="col-constraint">Constraint</th><th class="col-rules">Null Rules & Details</th></tr>
    <tr><td class="col-name">VehicleID (PK)</td><td class="col-type">INT</td><td class="col-constraint">NOT NULL</td><td class="col-rules">Auto-increment unique ID. Mandatory.</td></tr>
    <tr><td>RegistrationNo</td><td>VARCHAR(20)</td><td>NOT NULL</td><td>Number plate (e.g., MH12AB1234). Mandatory.</td></tr>
    <tr><td>OwnerName</td><td>VARCHAR(100)</td><td>NOT NULL</td><td>Name of the vehicle owner / agency.</td></tr>
    <tr><td>VehicleType</td><td>VARCHAR(30)</td><td>NOT NULL</td><td>E.g., Open Body, Container, Trailer.</td></tr>
    <tr><td>LoadCapacity</td><td>DECIMAL(10,2)</td><td>NOT NULL</td><td>Max weight the truck can carry in tons.</td></tr>
    <tr><td>RCExpiryDate</td><td>DATE</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>Leave empty if not tracked. Fill to prevent dispatch.</td></tr>
</table>

<!-- Table 3 -->
<h2>3. DRIVERS TABLE</h2>
<span class="subtitle">Purpose: Roster of all drivers handling shipments. Connects to LrBilty.</span>
<table>
    <tr><th class="col-name">Column Name</th><th class="col-type">Data Type</th><th class="col-constraint">Constraint</th><th class="col-rules">Null Rules & Details</th></tr>
    <tr><td class="col-name">DriverID (PK)</td><td class="col-type">INT</td><td class="col-constraint">NOT NULL</td><td class="col-rules">Auto-increment unique ID. Mandatory.</td></tr>
    <tr><td>DriverName</td><td>VARCHAR(100)</td><td>NOT NULL</td><td>Driver full name. Mandatory.</td></tr>
    <tr><td>LicenseNumber</td><td>VARCHAR(30)</td><td>NOT NULL</td><td>Official driving license code. Mandatory.</td></tr>
    <tr><td>LicenseExpiry</td><td>DATE</td><td>NOT NULL</td><td>Date when the license expires. Mandatory.</td></tr>
    <tr><td>Phone</td><td>VARCHAR(15)</td><td>NOT NULL</td><td>Primary contact number.</td></tr>
</table>

<!-- Table 4 -->
<h2>4. USERS / STAFF TABLE</h2>
<span class="subtitle">Purpose: Access management. Connects to LrBilty (Created by) & Tracking (Updated by).</span>
<table>
    <tr><th class="col-name">Column Name</th><th class="col-type">Data Type</th><th class="col-constraint">Constraint</th><th class="col-rules">Null Rules & Details</th></tr>
    <tr><td class="col-name">UserID (PK)</td><td class="col-type">INT</td><td class="col-constraint">NOT NULL</td><td class="col-rules">Auto-increment unique ID. Mandatory.</td></tr>
    <tr><td>Username</td><td>VARCHAR(50)</td><td>NOT NULL</td><td>Login name. Mandatory.</td></tr>
    <tr><td>PasswordHash</td><td>VARCHAR(255)</td><td>NOT NULL</td><td>Securely hashed password. Mandatory.</td></tr>
    <tr><td>Role</td><td>VARCHAR(20)</td><td>NOT NULL</td><td>E.g., Admin, Manager, Clerk.</td></tr>
    <tr><td>IsActive</td><td>BOOLEAN</td><td>NOT NULL</td><td>Default TRUE. FALSE when resigned.</td></tr>
</table>

<!-- Table 5 -->
<h2>5. INVOICES & PAYMENTS TABLE</h2>
<span class="subtitle">Purpose: Independent ledger to resolve multiple partial payments against a shipment. Connects to LrBilty.</span>
<table>
    <tr><th class="col-name">Column Name</th><th class="col-type">Data Type</th><th class="col-constraint">Constraint</th><th class="col-rules">Null Rules & Details</th></tr>
    <tr><td class="col-name">InvoiceID (PK)</td><td class="col-type">INT</td><td class="col-constraint">NOT NULL</td><td class="col-rules">Auto-increment unique ID. Mandatory.</td></tr>
    <tr><td>LrNumber (FK)</td><td>VARCHAR(30)</td><td>NOT NULL</td><td>The Bilty this payment belongs to. Mandatory.</td></tr>
    <tr><td>PaymentType</td><td>VARCHAR(20)</td><td>NOT NULL</td><td>E.g., Advance Payment, Balance Payment.</td></tr>
    <tr><td>AmountPaid</td><td>DECIMAL(10,2)</td><td>NOT NULL</td><td>Exact money received. Mandatory.</td></tr>
    <tr><td>PaymentDate</td><td>DATETIME</td><td>NOT NULL</td><td>Exact time of transaction. Mandatory.</td></tr>
    <tr><td>TransactionRef</td><td>VARCHAR(100)</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>Empty for Cash. Fill Bank UTR for online Txn's.</td></tr>
</table>

<!-- Table 6 -->
<h2>6. TRACKING TABLE</h2>
<span class="subtitle">Purpose: Action log tracking timeline and history of vehicle movement. Connects to LrBilty.</span>
<table>
    <tr><th class="col-name">Column Name</th><th class="col-type">Data Type</th><th class="col-constraint">Constraint</th><th class="col-rules">Null Rules & Details</th></tr>
    <tr><td class="col-name">TrackingID (PK)</td><td class="col-type">INT</td><td class="col-constraint">NOT NULL</td><td class="col-rules">Auto-increment unique ID. Mandatory.</td></tr>
    <tr><td>LrNumber (FK)</td><td>VARCHAR(30)</td><td>NOT NULL</td><td>Connects back to the Bilty. Mandatory.</td></tr>
    <tr><td>CurrentLocation</td><td>VARCHAR(200)</td><td>NOT NULL</td><td>Specific checkpoint / city name. Mandatory.</td></tr>
    <tr><td>Status</td><td>VARCHAR(50)</td><td>NOT NULL</td><td>E.g., Created, CheckpointReached, Delivered.</td></tr>
    <tr><td>UpdateTime</td><td>DATETIME</td><td>NOT NULL</td><td>Timestamp when tracking was updated.</td></tr>
    <tr><td>Remarks</td><td>TEXT</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>KEEP EMPTY standardly. Fill ONLY if delayed/breakdown.</td></tr>
    <tr><td>UpdatedBy (FK)</td><td>INT</td><td>NOT NULL</td><td>UserID of staff who pushed update.</td></tr>
</table>

<!-- Table 7 -->
<h2>7. LR_BILTY TABLE (Contract Core)</h2>
<span class="subtitle">Purpose: The central pillar. This is the Lorry Receipt tracking the active transport job.</span>
<table>
    <tr><th class="col-name">Column Name</th><th class="col-type">Data Type</th><th class="col-constraint">Constraint</th><th class="col-rules">Null Rules & Details</th></tr>
    <tr><td class="col-name">LrNumber (PK)</td><td class="col-type">VARCHAR(30)</td><td class="col-constraint">NOT NULL</td><td class="col-rules">Manual/Auto ID (e.g., LR-1050). Mandatory.</td></tr>
    <tr><td>LrDate</td><td>DATE</td><td>NOT NULL</td><td>Date receipt generated. Mandatory.</td></tr>
    <tr><td>ConsignorID (FK)</td><td>INT</td><td>NOT NULL</td><td>Sender ID from Customers. Mandatory.</td></tr>
    <tr><td>ConsigneeID (FK)</td><td>INT</td><td>NOT NULL</td><td>Receiver ID from Customers. Mandatory.</td></tr>
    <tr><td>Origin</td><td>VARCHAR(100)</td><td>NOT NULL</td><td>Start location. Mandatory.</td></tr>
    <tr><td>Destination</td><td>VARCHAR(100)</td><td>NOT NULL</td><td>End location. Mandatory.</td></tr>
    <tr><td>MaterialDesc</td><td>VARCHAR(500)</td><td>NOT NULL</td><td>Goods details. Mandatory.</td></tr>
    <tr><td>TotalWeight</td><td>DECIMAL(10,2)</td><td>NOT NULL</td><td>Package weight. Mandatory.</td></tr>
    <tr><td>TotalPackages</td><td>INT</td><td>NOT NULL</td><td>Count of boxes. Mandatory.</td></tr>
    <tr><td>FreightAmount</td><td>DECIMAL(10,2)</td><td>NOT NULL</td><td>Total transport fare.</td></tr>
    <tr><td>AdvanceAmt</td><td>DECIMAL(10,2)</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>Pre-paid amount. EMPTY if 0 advance.</td></tr>
    <tr><td>BalanceAmt</td><td>DECIMAL(10,2)</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>Pending amount. EMPTY if 0 balance.</td></tr>
    <tr><td>VehicleID (FK)</td><td>INT</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>EMPTY if truck is missing. Fill when truck is assigned.</td></tr>
    <tr><td>DriverID (FK)</td><td>INT</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>EMPTY if driver is missing. Fill when driver assigned.</td></tr>
    <tr><td>EWayBillNo</td><td>VARCHAR(20)</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>EMPTY until Govt Bill generated. Fill upon sync.</td></tr>
    <tr><td>DeliveryDate</td><td>DATETIME</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>EMPTY while tracking. Fill ONLY when completed.</td></tr>
    <tr><td>Status</td><td>VARCHAR(30)</td><td>NOT NULL</td><td>Overall Status (In Transit, Delivered).</td></tr>
</table>

<!-- Table 8 -->
<h2>8. EWAY_BILL TABLE (Govt Link)</h2>
<span class="subtitle">Purpose: Mandatory government data link mapping taxes. Connects tightly to LrBilty.</span>
<table>
    <tr><th class="col-name">Column Name</th><th class="col-type">Data Type</th><th class="col-constraint">Constraint</th><th class="col-rules">Null Rules & Details</th></tr>
    <tr><td class="col-name">EWayBillNo(PK)</td><td class="col-type">VARCHAR(20)</td><td class="col-constraint">NOT NULL</td><td class="col-rules">Official govt generated number. Mandatory.</td></tr>
    <tr><td>EWayBillDate</td><td>DATETIME</td><td>NOT NULL</td><td>Date and time generated. Mandatory.</td></tr>
    <tr><td>LrNumber (FK)</td><td>VARCHAR(30)</td><td>NOT NULL</td><td>Connects to LrBilty. Mandatory.</td></tr>
    <tr><td>GenByGSTIN</td><td>VARCHAR(15)</td><td>NOT NULL</td><td>GST number of the generator. Mandatory.</td></tr>
    <tr><td>SupplierGSTIN</td><td>VARCHAR(15)</td><td>NOT NULL</td><td>GST number of the sender. Mandatory.</td></tr>
    <tr><td>RecipientGSTIN</td><td>VARCHAR(15)</td><td>NOT NULL</td><td>GST number of the receiver. Mandatory.</td></tr>
    <tr><td>DispatchFrom</td><td>VARCHAR(200)</td><td>NOT NULL</td><td>Pincode / address it left from. Mandatory.</td></tr>
    <tr><td>ShipTo</td><td>VARCHAR(200)</td><td>NOT NULL</td><td>Pincode / address it's going to. Mandatory.</td></tr>
    <tr><td>Distance</td><td>INT</td><td>NOT NULL</td><td>Required transit distance (KM). Mandatory.</td></tr>
    <tr><td>TotalInvoiceVal</td><td>DECIMAL(10,2)</td><td>NOT NULL</td><td>Total monetary value of cargo. Mandatory.</td></tr>
    <tr><td>CustomDutyVal</td><td>DECIMAL(10,2)</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>EMPTY if not cross-border shipping.</td></tr>
    <tr><td>CGSTAmount</td><td>DECIMAL(10,2)</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>EMPTY/0 if tax exempt. Fill if standard rules apply.</td></tr>
    <tr><td>SGSTAmount</td><td>DECIMAL(10,2)</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>EMPTY/0 if tax exempt. Fill if standard rules apply.</td></tr>
    <tr><td>IGSTAmount</td><td>DECIMAL(10,2)</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>EMPTY/0 if tax exempt. Fill if standard rules apply.</td></tr>
    <tr><td>VehicleNumber</td><td>VARCHAR(20)</td><td>NOT NULL</td><td>Reg number recorded per govt filing. Mandatory.</td></tr>
    <tr><td>TransporterID</td><td>VARCHAR(50)</td><td class="col-constraint null-allowed">NULL ALLOWED</td><td>EMPTY if internal fleet transport. Fill if outsourced.</td></tr>
    <tr><td>ValidUpto</td><td>DATETIME</td><td>NOT NULL</td><td>Government expiration point. Mandatory.</td></tr>
</table>

</body>
</html>
"""

def generate_pdf():
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.set_content(html_content)
            page.pdf(path="Perfect_All_Tables_Roadmap.pdf", format="A4", margin={"top":"15mm", "bottom":"15mm", "left":"15mm", "right":"15mm"}, print_background=True)
            browser.close()
        print("Playwright PDF Generated successfully!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_pdf()
