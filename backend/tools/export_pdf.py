from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

def export_to_pdf(messages, file_path):
    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4
    y = height - 50
    line_height = 16

    c.setFont("Helvetica", 12)
    c.drawString(50, y, "Exported Conversation")
    y -= 30

    for msg in messages:
        role = msg["role"].capitalize()
        content = msg["content"]

        lines = content.split("\n")
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, f"{role}:")
        y -= line_height

        c.setFont("Helvetica", 12)
        for line in lines:
            if y <= 50:
                c.showPage()
                y = height - 50
                c.setFont("Helvetica", 12)
            c.drawString(60, y, line.strip())
            y -= line_height

        y -= 10  # spacing between messages

    c.save()
