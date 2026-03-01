import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Index from "./pages/Index";
import Buy from "./pages/Buy";
import CarDetail from "./pages/CarDetail";
import Sell from "./pages/Sell";
import Evaluate from "./pages/Evaluate";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import MyBids from "./pages/MyBids";
import MyListings from "./pages/MyListings";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/shared/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cars" element={<Buy />} />
              <Route path="/cars/:id" element={<CarDetail />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/evaluate" element={<Evaluate />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/my-bids" element={<MyBids />} />
              <Route path="/my-listings" element={<MyListings />} />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
