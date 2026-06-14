# Multi-stage build — image size kam karne ke liye
FROM python:3.11-slim AS builder

WORKDIR /app

# Dependencies pehle copy karo (Docker cache optimize hoga)
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ---
FROM python:3.11-slim AS runner

WORKDIR /app

# Non-root user banao — security best practice
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Builder se installed packages copy karo
COPY --from=builder /root/.local /home/appuser/.local

# App code copy karo
COPY app/ ./app/

# Ownership do
RUN chown -R appuser:appgroup /app
USER appuser

# PATH set karo
ENV PATH=/home/appuser/.local/bin:$PATH
ENV APP_ENV=production

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
