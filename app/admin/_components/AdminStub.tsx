export default function AdminStub({
  title,
  lead,
}: {
  title: string;
  lead: string;
}) {
  return (
    <>
      <div className="os-page-head">
        <div>
          <h1>{title}</h1>
          <p>{lead}</p>
        </div>
      </div>
      <section className="os-section">
        <div className="os-section-body">
          <p className="os-muted" style={{ margin: 0 }}>
            Cet écran n&apos;est pas encore branché.
          </p>
        </div>
      </section>
    </>
  );
}
