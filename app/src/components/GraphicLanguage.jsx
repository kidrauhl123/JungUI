const MAXIMA_BASE = '/ui-assets/maxima'

const maximaAssets = [
  { name: '太阳', file: 'inline-svg/badge-sunburst.svg', tone: 'plain' },
  { name: '气球', file: 'inline-svg/pattern-balloon-red.svg', tone: 'plain' },
  { name: '蝴蝶', file: 'inline-svg/butterfly-teal.svg', tone: 'plain' },
  { name: '云朵 bubbles', file: 'inline-svg/cloud-bubbles.svg', tone: 'blue' },
  { name: '云朵 arch', file: 'inline-svg/cloud-arch.svg', tone: 'green' },
  { name: '云朵 pill', file: 'inline-svg/cloud-pill.svg', tone: 'pink' },
  { name: '云朵 ribbon', file: 'inline-svg/cloud-ribbon.svg', tone: 'red' },
]

function assetPath(file) {
  return `${MAXIMA_BASE}/${file}`
}

function AssetSpecimen({ asset }) {
  return (
    <figure className={`maxima-specimen maxima-specimen--${asset.tone}`}>
      <div className="maxima-specimen__art">
        <img src={assetPath(asset.file)} alt={asset.name} loading="lazy" />
      </div>
      <figcaption>
        <span>{asset.name}</span>
        <code>{asset.file}</code>
      </figcaption>
    </figure>
  )
}

export default function GraphicLanguage() {
  return (
    <div className="item graphic-language-item">
      <section className="maxima-specimens" aria-label="Maxima Therapy selected local SVG assets">
        <div className="maxima-specimens__head">
          <h3>Maxima Therapy SVG</h3>
          <p>太阳 / 云朵 / 气球 / 蝴蝶</p>
        </div>

        <div className="maxima-specimen-grid">
          {maximaAssets.map((asset) => (
            <AssetSpecimen asset={asset} key={asset.file} />
          ))}
        </div>
      </section>
      <div className="caption">
        <div className="name">Maxima Therapy / 精简 SVG 资产</div>
        <div className="note">按原始比例展示，不裁切 SVG</div>
      </div>
    </div>
  )
}
