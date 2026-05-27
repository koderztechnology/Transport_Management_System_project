# Full System Database Roadmap - All 8 Tables

This document outlines the complete architectural layout for your Transport Management System (TMS) database. Below is the strict structural roadmap for **every single table** required to run the logistics system, including primary/foreign keys, datatypes, and null value handling rules.

---

## 1. Customers Table (Consignors & Consignees)
**Purpose**: Stores all senders, receivers, and billing entities to prevent duplicate data entry. Connects to `LrBilty`.

| Column Name | Data Type | Constraint | Null Rules & Details |
| :--- | :--- | :--- | :--- |
| **CustomerID (PK)** | INT | NOT NULL | Auto-increment unique ID. Mandatory. |
| **CustomerType** | VARCHAR(20) | NOT NULL | E.g., 'Consignor', 'Consignee', 'Broker'. |
| **FullName** | VARCHAR(100) | NOT NULL | Registered Name. Mandatory. |
| **GSTIN** | VARCHAR(15) | **NULL ALLOWED**| Leave empty for unregistered clients. Fill for B2B. |
| **ContactPhone** | VARCHAR(15) | NOT NULL | Primary contact number. |
| **Address** | TEXT | NOT NULL | Complete physical address. |

---

## 2. Vehicles Table
**Purpose**: Registry of all trucks used for transport. Connects to `LrBilty`, `EWayBill`, and `Tracking`.

| Column Name | Data Type | Constraint | Null Rules & Details |
| :--- | :--- | :--- | :--- |
| **VehicleID (PK)** | INT | NOT NULL | Auto-increment unique ID. Mandatory. |
| **RegistrationNo** | VARCHAR(20) | NOT NULL | Number plate (e.g., MH12AB1234). Mandatory. |
| **OwnerName** | VARCHAR(100) | NOT NULL | Name of the vehicle owner / agency. |
| **VehicleType** | VARCHAR(30) | NOT NULL | E.g., 'Open Body', 'Container', 'Trailer'. |
| **LoadCapacity** | DECIMAL(10,2)| NOT NULL | Max weight the truck can carry in tons. |
| **RCExpiryDate** | DATE | **NULL ALLOWED**| Leave empty if not tracked. Fill to prevent dispatch. |

---

## 3. Drivers Table
**Purpose**: Roster of all drivers handling the shipments. Connects to `LrBilty`.

| Column Name | Data Type | Constraint | Null Rules & Details |
| :--- | :--- | :--- | :--- |
| **DriverID (PK)** | INT | NOT NULL | Auto-increment unique ID. Mandatory. |
| **DriverName** | VARCHAR(100) | NOT NULL | Driver's full name. Mandatory. |
| **LicenseNumber** | VARCHAR(30) | NOT NULL | Official driving license code. Mandatory. |
| **LicenseExpiry**| DATE | NOT NULL | Date when the license expires. Mandatory. |
| **Phone** | VARCHAR(15) | NOT NULL | Primary contact number. |

---

## 4. Users / Staff Table
**Purpose**: Access management for TMS admins, managers, and clerks. Connects to `LrBilty` (who created) and `Tracking` (who updated).

| Column Name | Data Type | Constraint | Null Rules & Details |
| :--- | :--- | :--- | :--- |
| **UserID (PK)** | INT | NOT NULL | Auto-increment unique ID. Mandatory. |
| **Username** | VARCHAR(50) | NOT NULL | Login name. Mandatory. |
| **PasswordHash** | VARCHAR(255) | NOT NULL | Securely hashed password. Mandatory. |
| **Role** | VARCHAR(20) | NOT NULL | E.g., 'Admin', 'Manager', 'Clerk'. |
| **IsActive** | BOOLEAN | NOT NULL | Default to TRUE. Set to FALSE when they resign. |

---

## 5. Invoices & Payments Table
**Purpose**: Independent ledger to resolve multiple partial payments (Advances/Balances) against a single shipment. Connects to `LrBilty`.

| Column Name | Data Type | Constraint | Null Rules & Details |
| :--- | :--- | :--- | :--- |
| **InvoiceID (PK)** | INT | NOT NULL | Auto-increment unique ID. Mandatory. |
| **LrNumber (FK)** | VARCHAR(30) | NOT NULL | The Bilty this payment belongs to. Mandatory. |
| **PaymentType** | VARCHAR(20) | NOT NULL | E.g., 'Advance Payment', 'Balance Payment'. |
| **AmountPaid** | DECIMAL(10,2)| NOT NULL | Exact money received. Mandatory. |
| **PaymentDate** | DATETIME | NOT NULL | Exact time of transaction. Mandatory. |
| **TransactionRef** | VARCHAR(100) | **NULL ALLOWED**| Empty for Cash. Fill the Bank UTR for online Txn's. |

---

## 6. Tracking Table
**Purpose**: Action log tracking the timeline and exact history of vehicle movement. Connects to `LrBilty`.

| Column Name | Data Type | Constraint | Null Rules & Details |
| :--- | :--- | :--- | :--- |
| **TrackingID (PK)**| INT | NOT NULL | Auto-increment unique ID. Mandatory. |
| **LrNumber (FK)** | VARCHAR(30) | NOT NULL | Connects back to the Bilty. Mandatory. |
| **CurrentLocation**| VARCHAR(200) | NOT NULL | Specific checkpoint / city name. Mandatory. |
| **Status** | VARCHAR(50) | NOT NULL | E.g., 'Created', 'CheckpointReached', 'Delivered'. |
| **UpdateTime** | DATETIME | NOT NULL | Timestamp when the tracking was updated. |
| **Remarks** | TEXT | **NULL ALLOWED**| KEEP EMPTY standardly. Fill ONLY if delayed/breakdown. |
| **UpdatedBy (FK)** | INT | NOT NULL | UserID of the staff who pushed the update. |

---

## 7. LR_Bilty Table (Contract Core)
**Purpose**: The central pillar. This is the Lorry Receipt tracking the active transport job.

| Column Name | Data Type | Constraint | Null Rules & Details |
| :--- | :--- | :--- | :--- |
| **LrNumber (PK)** | VARCHAR(30) | NOT NULL | Manual/Auto ID (e.g., LR-1050). Mandatory. |
| **LrDate** | DATE | NOT NULL | Date receipt is generated. Mandatory. |
| **ConsignorID (FK)**| INT | NOT NULL | Sender ID from Customers. Mandatory. |
| **ConsigneeID (FK)**| INT | NOT NULL | Receiver ID from Customers. Mandatory. |
| **Origin** | VARCHAR(100) | NOT NULL | Start location. Mandatory. |
| **Destination** | VARCHAR(100) | NOT NULL | End location. Mandatory. |
| **MaterialDesc** | VARCHAR(500) | NOT NULL | Goods details. Mandatory. |
| **TotalWeight** | DECIMAL(10,2)| NOT NULL | Package weight. Mandatory. |
| **TotalPackages** | INT | NOT NULL | Count of boxes. Mandatory. |
| **FreightAmount** | DECIMAL(10,2)| NOT NULL | Total fare to be paid manually. |
| **AdvanceAmt** | DECIMAL(10,2)| **NULL ALLOWED**| Pre-paid transport amount. EMPTY if 0 advance. |
| **BalanceAmt** | DECIMAL(10,2)| **NULL ALLOWED**| Pending transport amount. EMPTY if 0 balance. |
| **VehicleID (FK)** | INT | **NULL ALLOWED**| EMPTY if truck is missing. Fill when truck is assigned.|
| **DriverID (FK)** | INT | **NULL ALLOWED**| EMPTY if driver is missing. Fill when driver is assigned.|
| **EWayBillNo** | VARCHAR(20) | **NULL ALLOWED**| EMPTY until Govt Bill generated. Fill upon govt sync.|
| **DeliveryDate** | DATETIME | **NULL ALLOWED**| EMPTY while tracking. Fill ONLY when completed. |
| **Status** | VARCHAR(30) | NOT NULL | Overall Status ("In Transit", "Delivered"). |

---

## 8. EWayBill Table (Govt Link)
**Purpose**: Mandatory government data link mapping taxes. Connects tightly to `LrBilty`.

| Column Name | Data Type | Constraint | Null Rules & Details |
| :--- | :--- | :--- | :--- |
| **EWayBillNo(PK)**| VARCHAR(20) | NOT NULL | The official govt generated number. Mandatory. |
| **EWayBillDate** | DATETIME | NOT NULL | Date and time generated. Mandatory. |
| **LrNumber (FK)** | VARCHAR(30) | NOT NULL | Connects to LrBilty. Mandatory. |
| **GenByGSTIN** | VARCHAR(15) | NOT NULL | GST number of the generator. Mandatory. |
| **SupplierGSTIN** | VARCHAR(15) | NOT NULL | GST number of the sender. Mandatory. |
| **RecipientGSTIN**| VARCHAR(15) | NOT NULL | GST number of the receiver. Mandatory. |
| **DispatchFrom** | VARCHAR(200) | NOT NULL | Pincode / address it left from. Mandatory. |
| **ShipTo** | VARCHAR(200) | NOT NULL | Pincode / address it's going to. Mandatory. |
| **Distance** | INT | NOT NULL | Required transit distance (KM). Mandatory. |
| **TotalInvoiceVal**| DECIMAL(10,2)| NOT NULL | Total monetary value of cargo. Mandatory. |
| **CustomDutyVal** | DECIMAL(10,2)| **NULL ALLOWED**| EMPTY if not international/cross-border shipping. |
| **CGSTAmount** | DECIMAL(10,2)| **NULL ALLOWED**| EMPTY/0 if tax exempt. Fill if standard rules apply. |
| **SGSTAmount** | DECIMAL(10,2)| **NULL ALLOWED**| EMPTY/0 if tax exempt. Fill if standard rules apply. |
| **IGSTAmount** | DECIMAL(10,2)| **NULL ALLOWED**| EMPTY/0 if tax exempt. Fill if standard rules apply. |
| **VehicleNumber** | VARCHAR(20) | NOT NULL | Reg number recorded per govt filing. Mandatory. |
| **TransporterID** | VARCHAR(50) | **NULL ALLOWED**| EMPTY if internal fleet transport. Fill if outsourced. |
| **ValidUpto** | DATETIME | NOT NULL | Government expiration point. Mandatory. |
