import Header from "../components/layout/Header.jsx";

export default function NotificationLayout({ children }) {
  return (
    <>
      <Header />
      <main className="app-main">
        {children}
      </main>
    </>
  );
}
