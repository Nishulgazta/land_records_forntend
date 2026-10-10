import re

path = 'src/components/documents/document-upload-view.tsx'
with open(path) as f:
    s = f.read()

# Fix toast calls
s = s.replace('      pushToast({ title: "Upload simulated", description: "Document upload (simulated) completed." });',
              '      pushToast({ title: "Upload simulated", description: "Document upload (simulated) completed.", tone: "info" });')
s = s.replace('      pushToast({ title: "Upload failed", description: error instanceof Error ? error.message : "Upload failed" });',
              '      pushToast({ title: "Upload failed", description: error instanceof Error ? error.message : "Upload failed", tone: "error" });')

# Fix Field components - need id and label
s = s.replace('          <Field>\n            <Label htmlFor="title">Title</Label>\n            <Input\n              id="title"\n              value={title}\n              onChange={(event) => setTitle(event.target.value)}\n              required\n            />\n          </Field>',
              '          <Field id="title" label="Title">\n            <Input\n              id="title"\n              value={title}\n              onChange={(event) => setTitle(event.target.value)}\n              required\n            />\n          </Field>')
s = s.replace('          <Field>\n            <Label htmlFor="type">Document type</Label>\n            <Select\n              id="type"\n              value={type}\n              onChange={(event) => setType(event.target.value as DocumentType)}\n            >',
              '          <Field id="type" label="Document type">\n            <Select\n              id="type"\n              value={type}\n              onChange={(event) => setType(event.target.value as DocumentType)}\n            >')
s = s.replace('          </Field>', '          </Field>')  # no-op, easier to handle
s = s.replace('          <Field>\n            <Label htmlFor="language">Language</Label>\n            <Select\n              id="language"\n              value={language}\n              onChange={(event) => setLanguage(event.target.value)}\n            >',
              '          <Field id="language" label="Language">\n            <Select\n              id="language"\n              value={language}\n              onChange={(event) => setLanguage(event.target.value)}\n            >')
s = s.replace('          <Field>\n            <Label htmlFor="notes">Notes (optional)</Label>\n            <Textarea\n              id="notes"\n              value={notes}\n              onChange={(event) => setNotes(event.target.value)}\n              rows={3}\n            />\n          </Field>',
              '          <Field id="notes" label="Notes (optional)">\n            <Textarea\n              id="notes"\n              value={notes}\n              onChange={(event) => setNotes(event.target.value)}\n              rows={3}\n            />\n          </Field>')

with open(path, 'w') as f:
    f.write(s)
print('done')
