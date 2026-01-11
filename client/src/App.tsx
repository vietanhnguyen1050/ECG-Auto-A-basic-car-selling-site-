import CarFilled from "@ant-design/icons/lib/icons/CarFilled";
import "./App.css";
import { Button } from "antd";


function App() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white">
        <div className="grid grid-cols-7 h-12">
          <div className="col-span-2 place-items-center grid ">
            <div className="inline-block font-mono text-3xl italic text-blue-500">
              <CarFilled style={{ fontSize: "2rem", color: "bg-blue-500" }} />{" "}
              ECG Auto
            </div>
          </div>
          <div className="col-span-3 bg-amber-500 flex align-middle justify-center items-center gap-20">
            <Button  type="primary">Buy</Button>
            <Button type="primary">Sell</Button>
            <Button type="primary">Compare</Button>
          </div>
          <div className="col-span-2 place-items-center grid ">

          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
          <p className="text-gray-700 mb-4">
            This is the main content area of your application.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Feature 1</h3>
              <p className="text-gray-600">Description of feature 1</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Feature 2</h3>
              <p className="text-gray-600">Description of feature 2</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Feature 3</h3>
              <p className="text-gray-600">Description of feature 3</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              &copy; 2026 My Application. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-blue-400">
                Privacy
              </a>
              <a href="#" className="hover:text-blue-400">
                Terms
              </a>
              <a href="#" className="hover:text-blue-400">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
