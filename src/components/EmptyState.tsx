interface Props {
  title: string;
  copy: string;
}

export function EmptyState({ title, copy }: Props) {
  return (
    <section className="empty-state">
      <h2>{title}</h2>
      <p>{copy}</p>
    </section>
  );
}
