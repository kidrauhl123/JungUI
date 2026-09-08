import { Sidebar } from "@/components/catalog/sidebar";
export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site-shell">
      <a href="#main" className="skip-link">
        跳到内容
      </a>
      <Sidebar />
      <main id="main" className="site-main">
        {children}
      </main>
    </div>
  );
}
