import type { CatalogItem } from "@/lib/catalog-types";
import { CopyButton } from "./copy-button";
export function ComponentDocs({ item }: { item: CatalogItem }) {
  return (
    <div className="component-docs">
      <section>
        <h2>交互方式</h2>
        <p>{item.interaction}</p>
      </section>
      <section>
        <h2>使用示例</h2>
        <div className="usage-code">
          <CopyButton value={item.usage} label="复制使用示例" />
          <pre>
            <code>{item.usage}</code>
          </pre>
        </div>
      </section>
      <section>
        <h2>参数</h2>
        <div className="props-scroll">
          <table>
            <thead>
              <tr>
                <th>参数</th>
                <th>类型 / 默认值</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              {item.props.map((prop) => (
                <tr key={prop.name}>
                  <td>
                    <code>{prop.name}</code>
                  </td>
                  <td>
                    <code>{prop.type}</code>
                    {prop.default && <small>{prop.default}</small>}
                  </td>
                  <td>{prop.description}</td>
                </tr>
              ))}
              <tr>
                <td>
                  <code>className</code>
                </td>
                <td>
                  <code>string</code>
                </td>
                <td>附加样式类。组件同时支持根元素对应的原生属性。</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2>安装内容</h2>
        <p>
          Install 会将下面的源码文件写入你的项目。需要的 npm
          依赖会一起安装，代码可以直接修改。
        </p>
        <div className="dependency-list">
          {item.dependencies.length ? (
            item.dependencies.map((dep) => <code key={dep}>{dep}</code>)
          ) : (
            <span>无需额外 npm 依赖</span>
          )}
        </div>
        <ul className="shipped-files">
          {item.files.map((file) => (
            <li key={file}>
              <code>{file}</code>
            </li>
          ))}
        </ul>
      </section>
      {item.credits.length > 0 && (
        <section>
          <h2>来源</h2>
          {item.credits.map((credit) => (
            <p key={credit}>
              <a href={credit} target="_blank" rel="noreferrer">
                {credit}
              </a>
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
