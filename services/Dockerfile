FROM python:3.11-slim

WORKDIR /app

# Install system packages for psycopg2
RUN apt-get update && apt-get install -y gcc libpq-dev python3-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Prefer Render's $PORT when present so the platform can route traffic;
# fall back to 8000 for local/docker-compose runs.
CMD ["sh", "-c", "uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
