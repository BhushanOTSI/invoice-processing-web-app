export function PageTitle({ title }) {
  return <h1 className="text-2xl font-bold">{title}</h1>;
}

export function PageDescription({ description }) {
  return <p className="text-sm text-muted-foreground">{description}</p>;
}

export function PageSubtitle({ subtitle }) {
  return <h2 className="text-lg font-bold">{subtitle}</h2>;
}

export function PageSubdescription({ subdescription }) {
  return <p className="text-sm text-muted-foreground">{subdescription}</p>;
}

export function PageDescriptiveSection({ children }) {
  return <div className="[&_*]:leading-relaxed">{children}</div>;
}
