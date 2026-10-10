path = 'src/components/documents/documents-list-view.tsx'
with open(path) as f:
    s = f.read()
# Also handle the other case - if confidence is null, show dash or just text
s = s.replace('                  {doc.confidence !== null ? (\n                    <ConfidenceValue confidence={doc.confidence} />\n                  ) : (\n                    <ConfidenceBadge value={null} />\n                  )}',
              '                  <ConfidenceValue confidence={doc.confidence} />')
with open(path, 'w') as f:
    f.write(s)
print('ok')
