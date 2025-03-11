import UploadCSV from "@/components/upload-csv";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <UploadCSV />
      </div>
    </main>
  );
}
