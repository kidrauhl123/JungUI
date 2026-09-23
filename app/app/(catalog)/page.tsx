import { Gallery } from "@/components/catalog/gallery";
import { SiteTheme } from "@/components/catalog/site-theme";
export default function Home() {
  return (
    <div className="gallery-page">
      <div className="page-theme">
        <SiteTheme />
      </div>
      <Gallery />
      <footer className="page-footer">
        JungUI
      </footer>
    </div>
  );
}
