FROM postgres:16

# Install build deps, git, and Postgres server headers needed to compile extensions
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    ca-certificates \
    curl \
    postgresql-server-dev-16

# Build and install pgvector (this includes vector type + ivfflat + hnsw in current pgvector)
RUN git clone https://github.com/pgvector/pgvector.git /tmp/pgvector && \
    cd /tmp/pgvector && \
    make && make install

# Clean up build tooling to keep the image lean-ish
RUN rm -rf /tmp/pgvector && \
    apt-get remove -y git curl build-essential && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
