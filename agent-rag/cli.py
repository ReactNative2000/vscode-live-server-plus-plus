#!/usr/bin/env python3
import sys
from rag import RAG

rag = RAG()

def cmd_ingest(paths):
    for i, p in enumerate(paths, start=1):
        try:
            with open(p, 'r', encoding='utf-8') as f:
                text = f.read()
        except Exception as e:
            print('Failed to read', p, e)
            continue
        doc_id = p
        rag.ingest(doc_id, text)
        print('Ingested', p)

def cmd_query(q):
    ans = rag.query(q)
    print('\n=== RESULT ===\n')
    print(ans)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: cli.py ingest <files...> | query "question"')
        sys.exit(1)
    cmd = sys.argv[1]
    if cmd == 'ingest':
        cmd_ingest(sys.argv[2:])
    elif cmd == 'query':
        cmd_query(' '.join(sys.argv[2:]))
    else:
        print('Unknown command', cmd)
        sys.exit(1)
