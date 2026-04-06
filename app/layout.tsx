import './globals.css';

export const metadata = {
  title: 'IAB Image Resizer',
  description: 'AI powered image resizing to IAB standard resolutions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
