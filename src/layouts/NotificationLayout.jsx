import Header from "../components/layout/Header.jsx";

export default function NotificationLayout({ children }) {
  return (
    <>
      <Header />
      <main className="app-main" style={{ paddingTop: "80px" }}>
        {children}
      </main>
    </>
  );
}
