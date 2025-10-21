# Minimal RAG Agent Prototype

This folder contains a minimal Retrieval-Augmented Generation (RAG) prototype implemented in pure Python with no external dependencies. It's intended as a learning scaffold: simple components to show how embeddings, a vector store, retrieval, and prompt composition work together.

Files:
- `embed.py` — fake embedding function (hash-based) for local testing.
- `vectorstore.py` — in-memory vector store with cosine-similarity retrieval.
- `rag.py` — RAG flow: ingest docs, retrieve top-k, compose prompt, and call a very small mock LLM.
- `cli.py` — small CLI for ingesting and asking queries.

Usage (from repo root):

```bash
python3 agent-rag/cli.py ingest "doc1.txt" "doc2.txt"
python3 agent-rag/cli.py query "What is the hospital phone number?"
```

This is educational only — replace the mock embedding and LLM with real services (OpenAI, local models) as you progress.
