import os
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, Preformatted, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

def check_pdf_pages(pdf_path):
    with open(pdf_path, 'rb') as f:
        data = f.read()
    matches = re.findall(rb'/Count\s+(\d+)', data)
    if matches:
        return int(matches[-1])
    return -1

print("Ready to implement PDF builder")
