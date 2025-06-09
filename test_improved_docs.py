from core.utils.code_parser import parse_codebase

# Generate documentation for test file
docs, gen = parse_codebase('test_simple.py')

# Save to file
with open('improved_docs_example.md', 'w') as f:
    f.write(docs)

print('Documentation saved to improved_docs_example.md')
