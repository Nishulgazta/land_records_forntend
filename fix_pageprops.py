import re

# fix documents/[id]/page.tsx
path = 'src/app/documents/[id]/page.tsx'
with open(path) as f:
    s = f.read()
s = s.replace('import type { PageProps } from "next";\n', '')
# insert PageProps usage
s = s.replace('}: PageProps<"/documents/[id]">) {',
              '}: { params: Promise<{ id: string }> }) {')
with open(path, 'w') as f:
    f.write(s)

# fix processing/[id]/page.tsx
path = 'src/app/processing/[id]/page.tsx'
with open(path) as f:
    s = f.read()
s = s.replace('import type { PageProps } from "next";\n', '')
s = s.replace('}: PageProps<"/processing/[id]">) {',
              '}: { params: Promise<{ id: string }> }) {')
with open(path, 'w') as f:
    f.write(s)
print('ok')
