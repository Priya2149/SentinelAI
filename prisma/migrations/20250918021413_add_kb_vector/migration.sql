-- CreateTable
CREATE EXTENSION IF NOT EXISTS vector;

create table if not exists "KnowledgeChunk" (
  id text primary key,
  "createdAt" timestamp with time zone not null default now(),
  title text not null,
  content text not null,
  embedding vector(768) not null
);

-- optional, but recommended index (pick one)
create index if not exists "KnowledgeChunk_embedding_hnsw"
on "KnowledgeChunk" using hnsw (embedding vector_cosine_ops);

analyze "KnowledgeChunk";