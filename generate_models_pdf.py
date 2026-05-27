import os
import sys
import django
from django.conf import settings
from django.db import models
from fpdf import FPDF

# Setup Django
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'TMS_project'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TMS_project.settings')
django.setup()

from main_app.models import Driver, Vehicle, Fuel, Toll

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 14)
        self.cell(0, 10, 'Database Tables Roadmap - According to Models', border=0, ln=1, align='C')
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

def get_field_info(field):
    name = field.name
    if field.primary_key:
        name += ' (PK)'
    elif field.related_model:
        name += ' (FK)'

    # Get data type
    if isinstance(field, models.CharField):
        data_type = f'VARCHAR({field.max_length})'
    elif isinstance(field, models.TextField):
        data_type = 'TEXT'
    elif isinstance(field, models.IntegerField):
        data_type = 'INT'
    elif isinstance(field, models.FloatField):
        data_type = 'FLOAT'
    elif isinstance(field, models.DateField):
        data_type = 'DATE'
    elif isinstance(field, models.DateTimeField):
        data_type = 'DATETIME'
    elif isinstance(field, models.BooleanField):
        data_type = 'BOOLEAN'
    elif isinstance(field, models.ImageField):
        data_type = f'VARCHAR({field.max_length})' if field.max_length else 'VARCHAR(100)'
    elif isinstance(field, models.AutoField):
        data_type = 'INT'
    elif isinstance(field, models.ForeignKey):
        data_type = 'INT'
    else:
        data_type = str(type(field).__name__)

    # Constraint
    constraint = 'NOT NULL' if not field.null else 'NULL ALLOWED'

    # Details
    details = []
    if field.default != models.NOT_PROVIDED:
        details.append(f'Default: {field.default}')
    if field.choices:
        choices_str = ', '.join([f"'{choice[0]}'" for choice in field.choices])
        details.append(f'Choices: {choices_str}')
    if hasattr(field, 'upload_to') and field.upload_to:
        details.append(f'Upload to: {field.upload_to}')
    if field.help_text:
        details.append(field.help_text)
    details_str = '. '.join(details) if details else ''

    return [name, data_type, constraint, details_str]

def generate_pdf():
    pdf = PDF()
    pdf.add_page()
    headers = ['Column Name', 'Data Type', 'Constraint', 'Details']
    w = [40, 25, 25, 100]

    models_list = [Driver, Vehicle, Fuel, Toll]

    for i, model in enumerate(models_list, 1):
        table_name = model._meta.db_table.upper()
        purpose = f"Purpose: {model.__doc__ or 'No description'}"
        pdf.section_title(f'{i}. {table_name} TABLE', purpose)

        data = []
        for field in model._meta.fields:
            data.append(get_field_info(field))

        pdf.add_table(headers, w, data)

    pdf.output('models_tables_roadmap.pdf')
    print("PDF generated: models_tables_roadmap.pdf")

if __name__ == '__main__':
    generate_pdf()