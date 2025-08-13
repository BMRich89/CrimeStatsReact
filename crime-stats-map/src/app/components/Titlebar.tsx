type TitleBarProps = {
  title: string
}


export function TitleBar({title}: TitleBarProps) {
  return (
    <div className="h-1/15 bg-blue-500 flex items-center justify-center">
      <h1 className="text-5xl text-center">{title}</h1>
    </div>
  );
}