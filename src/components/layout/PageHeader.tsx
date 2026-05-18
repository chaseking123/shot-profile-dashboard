/*
This component renders the simple page title shown at the top of each dashboard view.
It keeps header structure consistent between screens.
*/
import "./PageHeader.css";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
    </header>
  );
}
