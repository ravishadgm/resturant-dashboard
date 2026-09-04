export default function PageHeader({ eyebrow, title, description, action }) { return <div className="page-heading"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>; }

