path = 'src/components/documents/document-detail-view.tsx'
with open(path) as f:
    s = f.read()
# Remove router since not used
s = s.replace('  const router = useRouter();\n', '')
s = s.replace('import { useRouter } from "next/navigation";\n', '')
with open(path, 'w') as f:
    f.write(s)
print('ok')
