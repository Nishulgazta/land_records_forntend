path = 'src/components/documents/documents-list-view.tsx'
with open(path) as f:
    s = f.read()
s = s.replace('<ConfidenceValue value={doc.confidence} showLabel />',
              '<ConfidenceValue confidence={doc.confidence} />')
with open(path, 'w') as f:
    f.write(s)
print('ok')
