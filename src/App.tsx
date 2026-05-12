import { AppProvider } from './context/AppProvider';
import { useAppState } from './hooks/useAppState';
import { AppContainer } from './ui/containers/AppContainer';
import { Header } from './ui/containers/Header';
import { Footer } from './ui/containers/Footer';
import { MainContent } from './ui/containers/MainContent';
import { WizardNav } from './ui/navs/WizardNav';
import { BracketPage } from './ui/pages/BracketPage';
import { LeaderboardPage } from './ui/pages/LeaderboardPage';
import { Toast } from './ui/panels/Toast';

function Shell() {
  const { state } = useAppState();
  const onBracket = state.activePage === 'bracket';
  return (
    <AppContainer
      header={<Header />}
      footer={onBracket ? <WizardNav /> : <Footer />}
    >
      <MainContent>
        {onBracket ? <BracketPage /> : <LeaderboardPage />}
      </MainContent>
      <Toast />
    </AppContainer>
  );
}

function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

export default App;
