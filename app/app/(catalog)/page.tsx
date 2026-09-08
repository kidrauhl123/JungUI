import { Gallery } from "@/components/catalog/gallery";
import { components } from "@/lib/components";
import { SiteTheme } from "@/components/catalog/site-theme";
export default function Home() {
  return (
    <div className="gallery-page">
      <div className="page-theme">
        <SiteTheme />
      </div>
      <header className="gallery-header">
        <div className="page-intro">
          <h1>有感觉的界面细节。</h1>
          <p>找到喜欢的效果，带进你的下一个作品。</p>
        </div>
        <span className="component-count">{components.length} 个可用组件</span>
      </header>
      <Gallery />
      <footer className="page-footer">
        JungUI<span>看见，试用，带走。</span>
      </footer>
    </div>
  );
}
