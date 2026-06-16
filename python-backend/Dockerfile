# Multi-stage build — image size kam karne ke liye
FROM python:3.11-slim AS builder
WORKDIR /app

# virtualenv banao (saaf isolation, copy karna easy)
RUN python -m venv /opt/venv
ENV PATH=/opt/venv/bin:$PATH

# Dependencies install karo venv me
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ---
FROM python:3.11-slim AS runner
WORKDIR /app

# Non-root user banao — security best practice
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

# Builder se poora virtualenv copy karo
COPY --from=builder /opt/venv /opt/venv

# App code copy karo
COPY app/ ./app/

# Ownership do
RUN chown -R appuser:appgroup /app /opt/venv

USER appuser

# venv ka PATH set karo — ab uvicorn yahin se milega
ENV PATH=/opt/venv/bin:$PATH
ENV APP_ENV=production

EXPOSE 8000

# Health check — /health route hona chahiye app me (warna / use karo)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
