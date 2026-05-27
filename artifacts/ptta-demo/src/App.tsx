import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Landing from "@/pages/Landing";
import ArtworkPicker from "@/pages/ArtworkPicker";
import JourneyShell from "@/pages/JourneyShell";
import DemoPlaceholder from "@/pages/DemoPlaceholder";
import FutureFeatures from "@/pages/FutureFeatures";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/demo" component={ArtworkPicker} />
      <Route path="/journey/:artworkId" component={JourneyShell} />
      <Route path="/journey/:artworkId/:processSlug" component={JourneyShell} />
      <Route path="/future-features" component={FutureFeatures} />
      <Route path="/demo/:slug" component={DemoPlaceholder} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
