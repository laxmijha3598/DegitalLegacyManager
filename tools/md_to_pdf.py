from pathlib import Path
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas


def clean_markdown_line(line: str) -> str:
    line = line.rstrip("\n")
    line = re.sub(r"`([^`]+)`", r"\1", line)
    line = re.sub(r"\*\*([^*]+)\*\*", r"\1", line)
    line = re.sub(r"\*([^*]+)\*", r"\1", line)
    line = re.sub(r"^#{1,6}\s*", "", line)
    line = re.sub(r"^\s*[-*]\s+", "• ", line)
    line = re.sub(r"^\s*\d+\.\s+", "• ", line)
    if line.startswith("|") and line.endswith("|"):
        cols = [c.strip() for c in line.strip("|").split("|")]
        line = " | ".join(cols)
    return line


def draw_wrapped_text(pdf: canvas.Canvas, text: str, x: float, y: float, max_width: float, font_name="Times-Roman", font_size=11):
    words = text.split()
    if not words:
        return y
    line = words[0]
    for word in words[1:]:
        trial = f"{line} {word}"
        if pdf.stringWidth(trial, font_name, font_size) <= max_width:
            line = trial
        else:
            pdf.drawString(x, y, line)
            y -= 15
            line = word
    pdf.drawString(x, y, line)
    y -= 15
    return y


def markdown_to_pdf(md_path: Path, pdf_path: Path):
    lines = md_path.read_text(encoding="utf-8", errors="ignore").splitlines()
    pdf = canvas.Canvas(str(pdf_path), pagesize=A4)
    width, height = A4
    left = 2.2 * cm
    right = width - 2.2 * cm
    top = height - 2.2 * cm
    bottom = 2.0 * cm
    y = top

    for raw in lines:
        line = clean_markdown_line(raw)
        if not line.strip():
            y -= 8
            if y < bottom:
                pdf.showPage()
                y = top
            continue

        if raw.startswith("# "):
            font, size = "Times-Bold", 16
            y -= 4
        elif raw.startswith("## "):
            font, size = "Times-Bold", 14
            y -= 3
        elif raw.startswith("### "):
            font, size = "Times-Bold", 12
            y -= 2
        else:
            font, size = "Times-Roman", 11

        if y < bottom + 20:
            pdf.showPage()
            y = top

        pdf.setFont(font, size)
        y = draw_wrapped_text(pdf, line, left, y, right - left, font_name=font, font_size=size)

    pdf.save()


if __name__ == "__main__":
    src = Path("REPORT.md")
    dst = Path("REPORT.pdf")
    markdown_to_pdf(src, dst)
    print(f"Generated: {dst.resolve()}")

