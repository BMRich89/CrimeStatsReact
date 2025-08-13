type PageContainerProps = {
  children?: React.ReactNode[];
};


export function PageContainer({children}: PageContainerProps) {
  return (
    <div className="page-container h-screen">
      {children}
    </div>
  );
}