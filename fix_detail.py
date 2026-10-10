import re

path = 'src/components/documents/document-detail-view.tsx'
with open(path) as f:
    s = f.read()

# Replace DescriptionItem label with term
s = s.replace('            <DescriptionItem label="File name">{document.fileName}</DescriptionItem>',
              '            <DescriptionItem term="File name">{document.fileName}</DescriptionItem>')
s = s.replace('            <DescriptionItem label="Type">{DOCUMENT_TYPE_LABELS[document.type]}</DescriptionItem>',
              '            <DescriptionItem term="Type">{DOCUMENT_TYPE_LABELS[document.type]}</DescriptionItem>')
s = s.replace('            <DescriptionItem label="Language">{document.language}</DescriptionItem>',
              '            <DescriptionItem term="Language">{document.language}</DescriptionItem>')
s = s.replace('            <DescriptionItem label="Pages">{document.pageCount}</DescriptionItem>',
              '            <DescriptionItem term="Pages">{document.pageCount}</DescriptionItem>')
s = s.replace('            <DescriptionItem label="Size">{formatBytes(document.sizeBytes)}</DescriptionItem>',
              '            <DescriptionItem term="Size">{formatBytes(document.sizeBytes)}</DescriptionItem>')
s = s.replace('            <DescriptionItem label="Uploaded at">{formatDateTime(document.uploadedAt)}</DescriptionItem>',
              '            <DescriptionItem term="Uploaded at">{formatDateTime(document.uploadedAt)}</DescriptionItem>')
s = s.replace('            <DescriptionItem label="Uploaded by">{document.uploadedBy}</DescriptionItem>',
              '            <DescriptionItem term="Uploaded by">{document.uploadedBy}</DescriptionItem>')
s = s.replace('            <DescriptionItem label="Archive ref">{document.archiveRef}</DescriptionItem>',
              '            <DescriptionItem term="Archive ref">{document.archiveRef}</DescriptionItem>')
s = s.replace('            <DescriptionItem label="Confidence">\n              <ConfidenceMeter value={document.confidence} />\n            </DescriptionItem>',
              '            <DescriptionItem term="Confidence">\n              <ConfidenceMeter confidence={document.confidence} />\n            </DescriptionItem>')
s = s.replace('            <DescriptionItem label="Provenance">\n              <ProvenanceBadge provenance={document.provenance} />\n            </DescriptionItem>',
              '            <DescriptionItem term="Provenance">\n              <ProvenanceBadge provenance={document.provenance} />\n            </DescriptionItem>')

with open(path, 'w') as f:
    f.write(s)
print('done')
