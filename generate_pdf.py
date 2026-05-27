from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 15)
        self.cell(0, 10, 'Transport Management System - Database Roadmap', ln=True, align='C')
        self.set_font('helvetica', 'I', 10)
        self.cell(0, 10, 'Strict Relational Schema Mapping', ln=True, align='C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', align='C')

def create_roadmap():
    pdf = PDF()
    pdf.add_page()
    pdf.set_font('helvetica', '', 11)

    intro = (
        "This document outlines the strict relational database schema of the Transport Management System. "
        "Every entity is connected through Explicit Foreign Keys ensuring data integrity. Below is a comprehensive "
        "mapping of each table and its connections."
    )
    pdf.multi_cell(0, 5, intro)
    pdf.ln(10)

    tables = [
        ("Base Entities (No Dependencies)", [
            ("Driver", "Stores driver details: name, license, contact. (Independent)"),
            ("Vendor", "Stores vendor/supplier details: name, type, contact. (Independent)"),
            ("Customer", "Stores customer accounts: name, phone, email. (Independent)"),
            ("SystemSetting", "Core system configuration and authentication. (Independent)")
        ]),
        ("Core Assets", [
            ("Vehicle", "Fleet assets. \n-> Connects to: Driver (Assigned Driver)")
        ]),
        ("Operations / Logistics", [
            ("Trip", "Logistics journey.\n-> Connects to: Vehicle (Assigned Truck), Driver (Assigned Driver)"),
            ("LRBilty", "Consignment / Transport Document.\n-> Connects to: Vehicle, Driver, EwayBill"),
            ("EwayBill", "Government Waybill.\n-> Connects to: LRBilty (Consignment), Vehicle, Driver"),
            ("Tracking", "Location tracking ping.\n-> Connects to: Trip, Vehicle, Driver")
        ]),
        ("Finance & Accounts", [
            ("FinanceTransaction", "Income/Expense Ledger.\n-> Connects to: Vehicle, Trip, Vendor"),
            ("Fuel", "Fueling Logs.\n-> Connects to: Vehicle"),
            ("Toll", "Toll/Fastag Deductions.\n-> Connects to: Vehicle"),
            ("Inventory", "Workshop/Garage items.\n-> Connects to: Vendor (Supplier)")
        ])
    ]

    for category, items in tables:
        pdf.set_font('helvetica', 'B', 14)
        pdf.set_text_color(0, 51, 153)
        pdf.cell(0, 10, category, ln=True)
        pdf.set_text_color(0, 0, 0)
        
        for name, desc in items:
            pdf.set_font('helvetica', 'B', 11)
            pdf.cell(50, 8, name, ln=False)
            pdf.set_font('helvetica', '', 11)
            pdf.multi_cell(140, 8, desc)
            pdf.ln(2)
        pdf.ln(5)

    pdf.add_page()
    pdf.set_font('helvetica', 'B', 14)
    pdf.set_text_color(0, 51, 153)
    pdf.cell(0, 10, 'Relational Map (Cross-Reference)', ln=True)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font('helvetica', '', 11)
    
    cross_ref = (
        "1. Vehicle:\n"
        "   - Required by / Connected from: Trip, Fuel, Toll, LRBilty, EWayBill, Tracking, FinanceTransaction.\n\n"
        "2. Driver:\n"
        "   - Required by / Connected from: Vehicle, Trip, LRBilty, EWayBill, Tracking.\n\n"
        "3. Vendor:\n"
        "   - Required by / Connected from: FinanceTransaction, Inventory.\n\n"
        "4. Trip:\n"
        "   - Required by / Connected from: Tracking, FinanceTransaction.\n\n"
        "5. LRBilty:\n"
        "   - Linked via: EWayBill."
    )
    pdf.multi_cell(0, 6, cross_ref)

    pdf.output("Database_Roadmap.pdf")

if __name__ == "__main__":
    create_roadmap()
