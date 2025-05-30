import matplotlib.pyplot as plt
import numpy as np
import io
import base64

def auto_generate_chart(chart_type: str) -> str:
    """Generate a simple random chart based on chart_type (bar, line, hist, scatter)."""
    labels = [f"Item {i}" for i in range(1, 6)]
    values = np.random.randint(10, 100, size=5)

    fig, ax = plt.subplots(figsize=(8, 4))

    if chart_type == "bar":
        ax.bar(labels, values)
    elif chart_type == "line":
        ax.plot(labels, values, marker="o")
    elif chart_type == "hist":
        ax.hist(values, bins=5)
    elif chart_type == "scatter":
        ax.scatter(range(len(values)), values)
    else:
        raise ValueError(f"Unsupported chart type: {chart_type}")

    ax.set_title("Auto-Generated Demo Chart")
    ax.set_ylabel("Value")
    ax.set_xlabel("Label")
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    plt.close()
    buf.seek(0)
    return f"data:image/png;base64,{base64.b64encode(buf.read()).decode()}"

def draw_chart_from_data(chart_type, labels, values, title="Generated Chart") -> str:
    """Draw a chart (bar, pie, line, histogram) using user-provided data and return base64 image."""
    plt.figure(figsize=(8, 5))

    if chart_type == "bar":
        plt.bar(labels, values, color='skyblue')
    elif chart_type == "pie":
        plt.pie(values, labels=labels, autopct="%1.1f%%", startangle=140)
    elif chart_type == "line":
        plt.plot(labels, values, marker="o")
    elif chart_type == "histogram":
        plt.hist(values, bins=5)
    else:
        raise ValueError("Unsupported chart type")

    plt.title(title)
    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format="png")
    plt.close()
    buf.seek(0)
    encoded = base64.b64encode(buf.read()).decode("utf-8")
    return f"data:image/png;base64,{encoded}"
