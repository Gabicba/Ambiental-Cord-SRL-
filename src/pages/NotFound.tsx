export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-4">
          <i className="ri-error-warning-line text-4xl text-brand-primary" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary">404</h1>
        <p className="text-text-secondary mt-2">Pagina no encontrada</p>
      </div>
    </div>
  );
}