// admin/src/components/Layout/PageContainer.jsx
export default function PageContainer({ children }) {
  return (
    <main className="w-full">
      <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
    </main>
  );
}
