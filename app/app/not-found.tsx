import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>还没有这个组件。</h1>
      <Link href="/components/">回到组件目录</Link>
    </main>
  );
}
