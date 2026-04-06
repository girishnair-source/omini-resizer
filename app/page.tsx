import ClientHome from './ClientHome';

export const dynamic = 'force-dynamic';

export default function Home() {
  const apiKey = process.env.RESIZE_API_KEY || 'default-secret-key';
  
  return <ClientHome serverApiKey={apiKey} />;
}
